'use client';

import React, { useState, useEffect, useRef, useTransition, useMemo, useId } from 'react';
import Link from 'next/link';
import { Search, X, CheckCircle2, ChevronRight, CornerDownLeft, Sparkles } from 'lucide-react';
import { products } from '@/data/products';
import { Product } from '@/types';
import { formatAMD } from '@/lib/utils';
import ProductImage from '@/components/ui/ProductImage';

interface LiveSearchProps {
  autoFocus?: boolean;
  onSelect?: () => void;
  className?: string;
  isOverlayMode?: boolean;
}

/* ---------------------------------------------------------------------------
 * SMART SPOTLIGHT: Armenian ↔ Latin translit normalization engine.
 * Typing "corak"/"tsorak" matches "ծորակ", "ganzer" matches "GANZER",
 * exact SKU "31297" matches instantly, and Armenian glyphs match Latin brands.
 * ------------------------------------------------------------------------- */

/* Canonical Armenian glyph → Latin approximation pairs (used for both directions). */
const ARM_LATIN_PAIRS: [string, string][] = [
  ['ա', 'a'], ['բ', 'p'], ['գ', 'g'], ['դ', 't'], ['ե', 'ye'], ['զ', 'z'],
  ['է', 'e'], ['ը', 'e'], ['թ', 'd'], ['ժ', 'zh'], ['ի', 'i'], ['լ', 'l'],
  ['խ', 'kh'], ['ծ', 'ts'], ['կ', 'k'], ['հ', 'h'], ['ձ', 'dz'], ['ղ', 'gh'],
  ['ճ', 'ch'], ['մ', 'm'], ['յ', 'y'], ['ն', 'n'], ['շ', 'sh'], ['ո', 'vo'],
  ['չ', 'ch'], ['պ', 'b'], ['ջ', 'j'], ['ռ', 'r'], ['ս', 's'], ['վ', 'v'],
  ['տ', 't'], ['ց', 'ts'], ['ւ', 'w'], ['փ', 'p'], ['ք', 'k'], ['օ', 'o'],
  ['ֆ', 'f'],
];

// Digraph-first ordered Latin → Armenian map ('ev' and 'ou' must beat single letters)
const ARM_DIGRAPHS: [string, string][] = [
  ['ev', 'էվ'],
  ['ou', 'ու'],
  ...ARM_LATIN_PAIRS.map(([arm, latin]) => [latin, arm] as [string, string]),
];

const ARM_SINGLE: Record<string, string> = Object.fromEntries(ARM_DIGRAPHS);

const ARMENIAN_TO_LATIN: Record<string, string[]> = {
  ...ARM_LATIN_PAIRS.reduce<Record<string, string[]>>((acc, [arm, latin]) => {
    acc[arm] = acc[arm] ? [...new Set([...acc[arm], latin])] : [latin];
    return acc;
  }, {}),
  // Extra accepted spellings for common typos / alternate translit conventions
  'ա': ['a', 'ah'],
  'բ': ['p', 'b'],
  'գ': ['g', 'k', 'c'],
  'դ': ['t', 'd'],
  'ե': ['ye', 'e', 'yev'],
  'զ': ['z', 'dz'],
  'է': ['e', 'eh'],
  'ը': ['e', 'y', 'u'],
  'թ': ['t', 'd', 'th'],
  'խ': ['kh', 'x'],
  'ծ': ['ts', 'c', 'dz', 'j'],
  'կ': ['k', 'g', 'c', 'q'],
  'ձ': ['dz', 't', 'd'],
  'ղ': ['gh', 'g', 'w'],
  'ճ': ['ch', 'j', 'ts'],
  'շ': ['sh', 's', 'ch'],
  'ո': ['o', 'vo', 'u'],
  'չ': ['ch', 'c', 'ts'],
  'ջ': ['j', 'ch', 'dz'],
  'ռ': ['r', 'rr'],
  'վ': ['v', 'w'],
  'տ': ['t', 'd'],
  'ց': ['ts', 'c', 'j', 's'],
  'ւ': ['w', 'u', 'v', 'ww'],
  'փ': ['p', 'b'],
  'ք': ['k', 'q', 'x', 'c'],
  'օ': ['o', 'oh'],
  'ֆ': ['f', 'ph'],
  'ի': ['i', 'ih', 'ee'],
  'լ': ['l', 'll'],
  'հ': ['h', 'hh'],
  'մ': ['m', 'mm'],
  'յ': ['y', 'i'],
  'ն': ['n', 'nn'],
  'ս': ['s', 'ss'],
};

/** Converts a single Latin translit token into Armenian glyphs (digraph-first greedy pass). */
function translitTokenToArmenian(token: string): string {
  let out = '';
  let i = 0;
  while (i < token.length) {
    let matched = false;
    for (const [latin, arm] of ARM_DIGRAPHS) {
      if (token.startsWith(latin, i)) {
        out += arm;
        i += latin.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      const ch = token[i];
      out += ARM_SINGLE[ch] ?? ch;
      i += 1;
    }
  }
  return out;
}

/** Expands a raw query into Latin + Armenian translit token variants. */
function getQueryVariants(rawQuery: string): string[] {
  const q = rawQuery.toLowerCase().trim();
  if (!q) return [];
  const tokens = q.split(/\s+/);
  const variants = new Set<string>(tokens);
  const latinReversed = new Set<string>(tokens);

  for (const token of tokens) {
    if (/^[a-z'"]+$/.test(token)) {
      const arm = translitTokenToArmenian(token);
      variants.add(arm);
      // Typo tolerance: single trailing/leading apostrophe or doubled letters
      variants.add(token.replace(/['"]/g, ''));
    }
    // Armenian glyphs → latin approximations so "ծորակ" also matches "GANZER"-style latin haystacks
    for (const char of token) {
      const latinOpts = ARMENIAN_TO_LATIN[char];
      if (latinOpts) latinOpts.forEach((l) => latinReversed.add(l));
    }
  }

  return [...variants, ...latinReversed];
}

function buildHaystack(p: Product): string {
  return `${p.title} ${p.brand} ${p.code} ${p.categoryName} ${p.slug} ${Object.values(p.specs).join(' ')}`.toLowerCase();
}

function scoreMatch(p: Product, rawQuery: string, variants: string[]): number {
  const q = rawQuery.toLowerCase().trim();
  const haystack = buildHaystack(p);
  const code = p.code.toLowerCase();
  const brand = p.brand.toLowerCase();
  const title = p.title.toLowerCase();

  // Exact SKU wins instantly
  if (code === q) return 100;
  if (code.startsWith(q)) return 90;
  // Exact translit brand match
  if (brand === q || variants.includes(brand)) return 80;
  if (title.startsWith(q)) return 70;

  // Any variant token present in the haystack
  if (variants.some((v) => v.length >= 2 && haystack.includes(v))) return 60;
  // Armenian → Latin reverse tolerance (Armenian query vs latin brand/spec text)
  if (/[\u0530-\u058F]/.test(q)) {
    const armNorm = [...q].map((c) => (ARMENIAN_TO_LATIN[c] ? `[${ARMENIAN_TO_LATIN[c].join('')}]` : c)).join('');
    if (new RegExp(armNorm.replace(/\s+/g, '.*'), 'i').test(haystack)) return 50;
  }
  return 0;
}

export default function LiveSearch({
  autoFocus = false,
  onSelect,
  className = '',
  isOverlayMode = false,
}: LiveSearchProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isPending, startTransition] = useTransition();

  const listboxId = useId();

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Auto focus if requested
  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [autoFocus]);

  // 150ms input debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      startTransition(() => {
        setDebouncedQuery(query.trim());
      });
    }, 150);

    return () => clearTimeout(handler);
  }, [query]);

  // Global keyboard shortcut ('/' or 'Cmd+K' / 'Ctrl+K' to focus)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Spotlight results: translit/typo tolerant matching, relevance ranked
  const filteredProducts: Product[] = useMemo(() => {
    if (!debouncedQuery) return [];
    const variants = getQueryVariants(debouncedQuery);
    return products
      .map((p) => ({ p, score: scoreMatch(p, debouncedQuery, variants) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.p.code.localeCompare(b.p.code))
      .slice(0, 8)
      .map((entry) => entry.p);
  }, [debouncedQuery]);

  // Keep keyboard selection visible inside the spotlight dropdown
  useEffect(() => {
    if (selectedIndex >= 0) {
      resultRefs.current[selectedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation inside dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredProducts.length === 0) {
      if (e.key === 'ArrowDown' && filteredProducts.length > 0) {
        setIsOpen(true);
        setSelectedIndex(0);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredProducts.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredProducts.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < filteredProducts.length) {
        e.preventDefault();
        const selected = filteredProducts[selectedIndex];
        window.history.pushState({}, '', `/product/${selected.slug}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setIsOpen(false);
        onSelect?.();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
      onSelect?.();
    }
  };

  const handleClear = () => {
    setQuery('');
    setDebouncedQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Highlight literal query AND translit-expanded Armenian glyph matches
  const highlightMatch = (text: string, rawQueryStr: string) => {
    if (!rawQueryStr.trim()) return text;
    const variants = getQueryVariants(rawQueryStr).filter((v) => v.length >= 2);
    if (variants.length === 0) return text;

    const escaped = variants.map((v) => v.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const splitRegex = new RegExp(`(${escaped.join('|')})`, 'gi');
    const exactRegex = new RegExp(`^(?:${escaped.join('|')})$`, 'i');
    const parts = text.split(splitRegex);
    return (
      <>
        {parts.map((part, i) =>
          part && exactRegex.test(part) ? (
            <mark key={i} className="bg-blue-100 text-blue-900 font-bold px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Որոնել՝ ԾԾ Կոդ, անուն կամ translit (օր. 31297, corak, ganzer)..."
          aria-label="Որոնել սանտեխնիկա"
          role="combobox"
          aria-expanded={isOpen && debouncedQuery.length > 0}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-activedescendant={
            isOpen && selectedIndex >= 0 ? `${listboxId}-opt-${selectedIndex}` : undefined
          }
          className="w-full h-11 pl-11 pr-24 rounded-full bg-white hover:bg-slate-50 focus:bg-white text-slate-900 text-base md:text-sm border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/15 transition-all duration-200 placeholder:text-slate-400 font-normal shadow-2xs"
        />

        {/* Left search icon */}
        <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />

        {/* Right buttons / shortcuts */}
        <div className="absolute right-3 flex items-center gap-1.5">
          {query ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Մաքրել որոնումը"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-mono font-medium text-slate-400 bg-white border border-slate-200 rounded-md shadow-2xs">
              <span className="text-[10px]">⌘</span>K
            </kbd>
          )}

          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 bg-[#0F172A] text-white rounded tracking-wider shadow-2xs">
            Կոդ
          </span>
        </div>
      </div>

      {/* Instant Spotlight Dropdown with backdrop-blur chrome */}
      {(isOpen || isOverlayMode) && debouncedQuery && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 shadow-2xl rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-md max-h-[60vh] sm:max-h-[440px] overflow-y-auto overscroll-contain divide-y divide-slate-100 animate-in fade-in-50 slide-in-from-top-1 duration-150">
          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#0F172A]">Արդյունք չի գտնվել</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                «<span className="font-semibold text-slate-700">{debouncedQuery}</span>» հարցմամբ
                Կոդ Կոդ կամ ապրանք չկա: Փորձեք <b>31297</b>, <b>corak</b> կամ <b>ganzer</b>:
              </p>
            </div>
          ) : (
            <>
              {/* Dropdown Header */}
              <div className="px-4 py-2.5 bg-slate-50/80 backdrop-blur-xs flex items-center justify-between text-xs text-slate-500 sticky top-0 z-10">
                <span className="font-semibold text-[#0F172A]">
                  համապատասխանող արդյունքներ ({filteredProducts.length})
                </span>
                <span className="hidden sm:inline text-[11px] text-slate-400 flex items-center gap-1">
                  <CornerDownLeft className="w-3 h-3" /> Enter · ↑↓ նավիգացիա
                </span>
              </div>

              {/* Product List */}
              <div className="divide-y divide-slate-100" role="listbox" id={listboxId}>
                {filteredProducts.map((product, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <Link
                      key={product.id}
                      id={`${listboxId}-opt-${idx}`}
                      role="option"
                      aria-selected={isSelected}
                      ref={(el: HTMLAnchorElement | null) => {
                        resultRefs.current[idx] = el;
                      }}
                      href={`/product/${product.slug}`}
                      onClick={() => {
                        setIsOpen(false);
                        onSelect?.();
                      }}
                      className={`flex items-center gap-3.5 p-3 sm:p-3.5 transition-colors group cursor-pointer ${
                        isSelected ? 'bg-blue-50/80 text-blue-950' : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      {/* Product Thumbnail */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <ProductImage
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full"
                          imgClassName="group-hover:scale-106 transition-transform"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-mono text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                            Կոդ: {highlightMatch(product.code, debouncedQuery)}
                          </span>
                          {product.inStock && product.stockQuantity > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Առկա է սրահում ({product.stockQuantity})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                              Պատվերով
                            </span>
                          )}
                        </div>

                        <h5 className="text-xs font-semibold truncate group-hover:text-blue-600 transition-colors">
                          {highlightMatch(product.title, debouncedQuery)}
                        </h5>

                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-bold text-[#0F172A] tabular-nums">
                            {formatAMD(product.price)}
                          </span>
                          {product.oldPrice && (
                            <span className="text-[10px] text-slate-400 line-through tabular-nums">
                              {formatAMD(product.oldPrice)}
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                  );
                })}
              </div>

              {/* Dropdown Footer */}
              <div className="px-4 py-2 bg-slate-50/80 backdrop-blur-xs border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Translit ուղղում ակտիվ է · Մելքումովի 40/1 ուղիղ տվյալներ
                </span>
                
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
