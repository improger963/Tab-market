'use client';

import React, { useState, useEffect, useRef, useTransition, useMemo, useId } from 'react';
import Link from 'next/link';
import { pushRoute } from '@/lib/next-compat/navigation';
import { Search, X, CheckCircle2, ChevronRight, CornerDownLeft, Sparkles } from 'lucide-react';
import { products } from '@/data/products';
import { Product } from '@/types';
import { getQueryVariants, scoreMatch } from '@/lib/search/translit';
import { formatAMD } from '@/lib/utils';
import ProductImage from '@/components/ui/ProductImage';

interface LiveSearchProps {
  autoFocus?: boolean;
  onSelect?: () => void;
  className?: string;
  isOverlayMode?: boolean;
}

/* ---------------------------------------------------------------------------
 * SMART SPOTLIGHT: the Armenian ↔ Latin translit normalization engine lives
 * in `lib/search/translit.ts` (pure, smoke-testable). "corak"/"tsorak"/"vorak"
 * match "ծորակ", "ganzer" matches "GANZER", exact SKU "5932" wins instantly.
 * ------------------------------------------------------------------------- */

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
        // Route-change scroll is owned by the app's popstate handler: the
        // product page appears at the top instantly (no animated jump).
        pushRoute(`/product/${selected.slug}`);
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
            <mark key={i} className="bg-accent/80 text-ink font-bold px-0.5 rounded">
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
          inputMode="search"
          enterKeyHint="search"
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
          placeholder="Որոնել՝ Կոդ, անուն կամ translit (օր. 5932, corak, ganzer)..."
          aria-label="Որոնել սանտեխնիկա"
          role="combobox"
          aria-expanded={isOpen && debouncedQuery.length > 0}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-activedescendant={
            isOpen && selectedIndex >= 0 ? `${listboxId}-opt-${selectedIndex}` : undefined
          }
          className="w-full h-11 pl-11 pr-24 rounded-full bg-white hover:bg-canvas/70 focus:bg-white text-ink text-base md:text-sm border border-line focus:border-accent focus:ring-4 focus:ring-accent/15 transition-[background-color,border-color,box-shadow] duration-hover placeholder:text-muted font-normal shadow-e1"
        />

        {/* Left search icon */}
        <Search className="w-4 h-4 text-muted absolute left-4 pointer-events-none" />

        {/* Right buttons / shortcuts */}
        <div className="absolute right-3 flex items-center gap-1.5">
          {query ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-control text-muted hover:text-body hover:bg-canvas transition-colors cursor-pointer"
              aria-label="Մաքրել որոնումը"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-xs font-mono font-medium text-muted bg-white border border-line-strong rounded-control shadow-e1">
              <span className="text-xs">⌘</span>K
            </kbd>
          )}

          <span className="text-xs font-semibold px-1.5 py-0.5 bg-ink text-white rounded-control shadow-e1">
            Կոդ
          </span>
        </div>
      </div>

      {/* Instant Spotlight Dropdown with backdrop-blur chrome */}
      {(isOpen || isOverlayMode) && debouncedQuery && (
        <div className="absolute top-full left-0 right-0 mt-2 z-overlay shadow-e2 rounded-panel border border-line bg-white/95 backdrop-blur-sm max-h-[60dvh] sm:max-h-[440px] overflow-y-auto overscroll-contain divide-y divide-line animate-in fade-in-50 slide-in-from-top-1 duration-hover">
          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-canvas text-muted flex items-center justify-center mx-auto">
                <Search className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-ink">Արդյունք չի գտնվել</h4>
              <p className="text-xs text-muted max-w-xs mx-auto">
                «<span className="font-semibold text-body">{debouncedQuery}</span>» հարցմամբ
                Կոդ կամ ապրանք չկա: Փորձեք <b>5932</b>, <b>corak</b> կամ <b>ganzer</b>:
              </p>
            </div>
          ) : (
            <>
              {/* Dropdown Header */}
              <div className="px-4 py-2.5 bg-canvas/80 backdrop-blur-sm flex items-center justify-between text-xs text-muted sticky top-0 z-10">
                <span className="font-semibold text-ink">
                  համապատասխանող արդյունքներ ({filteredProducts.length})
                </span>
                <span className="hidden sm:inline text-xs text-muted flex items-center gap-1">
                  <CornerDownLeft className="w-3 h-3" /> Enter · ↑↓ նավիգացիա
                </span>
              </div>

              {/* Product List */}
              <div className="divide-y divide-line" role="listbox" id={listboxId}>
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
 isSelected ? 'bg-accent/5 text-ink' : 'hover:bg-line/60 text-ink'
 }`}
                    >
                      {/* Product Thumbnail */}
                      <div className="w-12 h-12 rounded-control overflow-hidden bg-canvas border border-line shrink-0">
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
                          <span className="font-mono text-xs font-bold text-accent bg-accent/5 px-1.5 py-0.2 rounded border border-accent/15">
                            Կոդ: {highlightMatch(product.code, debouncedQuery)}
                          </span>
                          {product.inStock ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-success bg-success/10 px-1.5 py-0.2 rounded border border-success">
                              <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                              Առկա է սրահում 
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning bg-warning/10 px-1.5 py-0.2 rounded border border-warning/25">
                              Պատվերով
                            </span>
                          )}
                        </div>

                        <h5 className="text-xs font-semibold truncate group-hover:text-accent transition-colors">
                          {highlightMatch(product.title, debouncedQuery)}
                        </h5>

                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-bold text-ink tabular-nums">
                            {formatAMD(product.price)}
                          </span>
                          {product.oldPrice && (
                            <span className="text-xs text-muted line-through tabular-nums">
                              {formatAMD(product.oldPrice)}
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-faint group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                  );
                })}
              </div>

              {/* Dropdown Footer */}
              <div className="px-4 py-2 bg-canvas/80 backdrop-blur-sm border-t border-canvas flex items-center justify-between text-xs text-muted">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
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
