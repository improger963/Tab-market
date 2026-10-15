'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import Link from 'next/link';
import { Search, X, CheckCircle2, ChevronRight, CornerDownLeft, Sparkles } from 'lucide-react';
import { products } from '@/data/products';
import { Product } from '@/types';
import { formatAMD } from '@/lib/utils';

export default function LiveSearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isPending, startTransition] = useTransition();

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Filter products by title or ArmSoft ERP code
  const filteredProducts: Product[] = React.useMemo(() => {
    if (!debouncedQuery) return [];
    const lower = debouncedQuery.toLowerCase();
    return products.filter((p) => {
      const matchCode = p.code.toLowerCase().includes(lower);
      const matchTitle = p.title.toLowerCase().includes(lower);
      const matchBrand = p.brand.toLowerCase().includes(lower);
      return matchCode || matchTitle || matchBrand;
    });
  }, [debouncedQuery]);

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
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setQuery('');
    setDebouncedQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Helper to highlight matching text
  const highlightMatch = (text: string, queryStr: string) => {
    if (!queryStr) return text;
    const parts = text.split(new RegExp(`(${queryStr.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === queryStr.toLowerCase() ? (
            <mark key={i} className="bg-cyan-100 text-cyan-900 font-bold px-0.5 rounded">
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
    <div ref={containerRef} className="relative w-full max-w-xl">
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
          placeholder="Որոնել ըստ ՀԾ Կոդի (օր. 31297) կամ մոդելի..."
          aria-label="Որոնել սանտեխնիկա"
          className="w-full h-11 pl-11 pr-24 rounded-xl bg-slate-100 hover:bg-slate-200/70 focus:bg-white text-slate-900 text-sm border border-slate-200 focus-cobalt focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 transition-all duration-200 placeholder:text-slate-400 font-normal"
        />

        {/* Left search icon */}
        <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />

        {/* Right buttons / shortcuts */}
        <div className="absolute right-3 flex items-center gap-1.5">
          {query ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              aria-label="Մաքրել որոնումը"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-mono font-medium text-slate-400 bg-white border border-slate-200 rounded-md shadow-2xs">
              <span className="text-[10px]">⌘</span>K
            </kbd>
          )}

          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 bg-slate-900 text-cyan-400 rounded tracking-wider shadow-2xs">
            ՀԾ
          </span>
        </div>
      </div>

      {/* Results Dropdown */}
      {isOpen && debouncedQuery && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 shadow-2xl rounded-2xl border border-slate-200 bg-white max-h-[440px] overflow-y-auto divide-y divide-slate-100 animate-in fade-in-50 zoom-in-95 duration-150">
          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Արդյունք չի գտնվել</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                «<span className="font-semibold text-slate-700">{debouncedQuery}</span>» հարցմամբ
                ՀԾ կոդ կամ ապրանք չկա: Փորձեք <b>31297</b>, <b>18472</b> կամ <b>BAXI</b>:
              </p>
            </div>
          ) : (
            <>
              {/* Dropdown Header */}
              <div className="px-4 py-2.5 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">
                  ՀԾ համապատասխանող արդյունքներ ({filteredProducts.length})
                </span>
                <span className="hidden sm:inline text-[11px] text-slate-400">
                  Օգտագործեք ↑↓ սլաքները և Enter
                </span>
              </div>

              {/* Items List */}
              <div className="p-1 space-y-0.5">
                {filteredProducts.map((product, idx) => {
                  const isSelected = selectedIndex === idx;
                  return (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={() => setIsOpen(false)}
                      className={`group flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-50/80 text-cyan-950 ring-1 ring-cyan-500/30'
                          : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 font-mono text-[10px] font-bold tracking-wider">
                            ՀԾ: {highlightMatch(product.code, debouncedQuery)}
                          </span>

                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            {product.brand}
                          </span>

                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Առկա է սրահում ({product.stockQuantity})
                          </span>
                        </div>

                        <h5 className="text-xs font-semibold truncate group-hover:text-cyan-700 transition-colors">
                          {highlightMatch(product.title, debouncedQuery)}
                        </h5>

                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-bold text-slate-900 tabular-nums">
                            {formatAMD(product.price)}
                          </span>
                          {product.oldPrice && (
                            <span className="text-[10px] text-slate-400 line-through tabular-nums">
                              {formatAMD(product.oldPrice)}
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-cyan-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                  );
                })}
              </div>

              {/* Dropdown Footer */}
              <div className="px-4 py-2 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                  Մելքումովի 40/1 սրահի ուղիղ տվյալներ
                </span>
                <span className="font-mono text-[10px] text-slate-400">ArmSoft ERP v8.4</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
