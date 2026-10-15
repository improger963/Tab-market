'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  SlidersHorizontal,
  ChevronRight,
  X,
  PackageOpen,
  ArrowUpDown,
  RotateCcw,
} from 'lucide-react';
import { products } from '@/data/products';
import { categories } from '@/data/categories';
import ProductCard from '@/components/product/ProductCard';
import FilterSidebar, { FilterState } from './FilterSidebar';

interface CatalogViewProps {
  initialCategorySlug?: string;
}

export default function CatalogView({ initialCategorySlug }: CatalogViewProps) {
  // Compute global price bounds
  const priceBounds = useMemo(() => {
    const prices = products.map((p) => p.price);
    return {
      min: Math.min(...prices, 0),
      max: Math.max(...prices, 400000),
    };
  }, []);

  // Filter state
  const [filters, setFilters] = useState<FilterState>(() => ({
    category: initialCategorySlug || null,
    brands: [],
    colors: [],
    diameters: [],
    materials: [],
    inStockOnly: false,
    minPrice: priceBounds.min,
    maxPrice: priceBounds.max,
  }));

  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc'>('popular');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Sync if initialCategorySlug changes
  useEffect(() => {
    if (initialCategorySlug) {
      setFilters((prev) => ({ ...prev, category: initialCategorySlug }));
    }
  }, [initialCategorySlug]);

  const resetFilters = () => {
    setFilters({
      category: null,
      brands: [],
      colors: [],
      diameters: [],
      materials: [],
      inStockOnly: false,
      minPrice: priceBounds.min,
      maxPrice: priceBounds.max,
    });
  };

  // Find active category title if filtered
  const activeCategory = useMemo(() => {
    if (!filters.category) return null;
    return categories.find((c) => c.slug === filters.category) || null;
  }, [filters.category]);

  // Count active filters (excluding defaults)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category) count += 1;
    if (filters.inStockOnly) count += 1;
    count += filters.brands.length;
    count += filters.colors.length;
    count += filters.diameters.length;
    count += filters.materials.length;
    if (filters.maxPrice < priceBounds.max || filters.minPrice > priceBounds.min) count += 1;
    return count;
  }, [filters, priceBounds]);

  // Filter logic
  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => {
      // Category filter
      if (filters.category && p.categorySlug !== filters.category) {
        return false;
      }
      // Showroom stock filter
      if (filters.inStockOnly && (!p.inStock || p.stockQuantity <= 0)) {
        return false;
      }
      // Brand filter
      if (filters.brands.length > 0 && !filters.brands.includes(p.brand)) {
        return false;
      }
      // Price range
      if (p.price < filters.minPrice || p.price > filters.maxPrice) {
        return false;
      }
      // Color / finish matching against specs and title
      if (filters.colors.length > 0) {
        const textToSearch = `${p.title} ${Object.values(p.specs).join(' ')}`.toLowerCase();
        const matchesColor = filters.colors.some((col) => {
          if (col === 'chrome') return textToSearch.includes('քրոմ') || textToSearch.includes('chrome');
          if (col === 'black') return textToSearch.includes('սև') || textToSearch.includes('black');
          if (col === 'gold') return textToSearch.includes('ոսկ') || textToSearch.includes('gold');
          if (col === 'white') return textToSearch.includes('սպիտակ') || textToSearch.includes('white');
          if (col === 'gunmetal') return textToSearch.includes('gunmetal') || textToSearch.includes('մոխրագույն');
          return true;
        });
        if (!matchesColor) return false;
      }
      // Diameter matching
      if (filters.diameters.length > 0) {
        const textToSearch = `${p.title} ${Object.values(p.specs).join(' ')}`.toLowerCase();
        const matchesDiameter = filters.diameters.some((dia) => textToSearch.includes(dia));
        if (!matchesDiameter) return false;
      }
      // Material matching
      if (filters.materials.length > 0) {
        const textToSearch = `${p.title} ${Object.values(p.specs).join(' ')}`.toLowerCase();
        const matchesMaterial = filters.materials.some((mat) => {
          if (mat === 'brass') return textToSearch.includes('լատուն') || textToSearch.includes('արույր') || textToSearch.includes('brass');
          if (mat === 'stainless') return textToSearch.includes('չժանգոտվող') || textToSearch.includes('304');
          if (mat === 'ceramic') return textToSearch.includes('կերամիկ') || textToSearch.includes('սանֆարֆոր');
          if (mat === 'pex') return textToSearch.includes('pex') || textToSearch.includes('մետաղապլաստ');
          return true;
        });
        if (!matchesMaterial) return false;
      }
      return true;
    });

    // Sorting
    if (sortBy === 'price-asc') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list = [...list].sort((a, b) => b.price - a.price);
    } else {
      // 'popular' / default featured first
      list = [...list].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return list;
  }, [filters, sortBy]);

  return (
    <div className="space-y-6">
      {/* Top Toolbar & Breadcrumbs */}
      <div className="space-y-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-cyan-600 transition-colors">
            Գլխավոր
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link
            href="/catalog"
            onClick={() => setFilters((prev) => ({ ...prev, category: null }))}
            className={`transition-colors ${
              !activeCategory ? 'text-slate-900 font-bold' : 'hover:text-cyan-600'
            }`}
          >
            Կատալոգ
          </Link>
          {activeCategory && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 font-bold">{activeCategory.title}</span>
            </>
          )}
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              {activeCategory ? activeCategory.title : 'Ամբողջ Տեսականին'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Գտնվել է <b className="text-slate-900 tabular-nums">{filteredProducts.length}</b> ապրանք
              ՀԾ (ArmSoft) պահեստում
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Mobile Filter Trigger Button */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              <span>Ֆիլտրեր</span>
              {activeFilterCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-black">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sorting Dropdown */}
            <div className="relative flex items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Դասավորել ապրանքները"
                className="min-h-[44px] text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 pr-8 text-slate-800 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-cyan-500 cursor-pointer"
              >
                <option value="popular">Ըստ պահանջարկի</option>
                <option value="price-asc">Գինը՝ Էժանից Թանկ</option>
                <option value="price-desc">Գինը՝ Թանկից Էժան</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Active Filter Chips Strip */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Ակտիվ ֆիլտրեր՝
            </span>

            {/* Category chip */}
            {filters.category && activeCategory && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-900 border border-cyan-200 text-xs font-bold">
                <span>{activeCategory.title}</span>
                <button
                  type="button"
                  onClick={() => setFilters((p) => ({ ...p, category: null }))}
                  className="hover:text-cyan-950 p-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Showroom stock chip */}
            {filters.inStockOnly && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold">
                <span>Մելքումովի 40/1 առկա</span>
                <button
                  type="button"
                  onClick={() => setFilters((p) => ({ ...p, inStockOnly: false }))}
                  className="hover:text-emerald-950 p-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Brands chips */}
            {filters.brands.map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold"
              >
                <span>Բրենդ: {b}</span>
                <button
                  type="button"
                  onClick={() =>
                    setFilters((p) => ({ ...p, brands: p.brands.filter((x) => x !== b) }))
                  }
                  className="hover:text-slate-950 p-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {/* Colors chips */}
            {filters.colors.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold"
              >
                <span>Գույն: {c}</span>
                <button
                  type="button"
                  onClick={() =>
                    setFilters((p) => ({ ...p, colors: p.colors.filter((x) => x !== c) }))
                  }
                  className="hover:text-slate-950 p-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {/* Reset all button */}
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 underline underline-offset-2 ml-1 cursor-pointer"
            >
              Մաքրել բոլորը
            </button>
          </div>
        )}
      </div>

      {/* Main Grid & Desktop Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sticky Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-24 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs max-h-[calc(100vh-7rem)] overflow-y-auto">
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            onReset={resetFilters}
            priceBounds={priceBounds}
          />
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-9 space-y-6">
          {filteredProducts.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <PackageOpen className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Համապատասխան ապրանքներ չեն գտնվել
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Նշված ֆիլտրերով ապրանքներ այս պահին չկան: Փորձեք փոխել գնային միջակայքը կամ մաքրել ֆիլտրերը:
                </p>
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Վերականգնել ֆիլտրերը
              </button>
            </div>
          ) : (
            /* Responsive 3-column Grid on Desktop */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Slide-Over Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden" role="dialog" aria-modal="true">
          <div
            onClick={() => setIsMobileDrawerOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-sm bg-white shadow-2xl flex flex-col h-full border-l border-slate-200">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-950 text-white shrink-0">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-sm">Ֆիլտրեր</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                <FilterSidebar
                  filters={filters}
                  onChange={setFilters}
                  onReset={resetFilters}
                  priceBounds={priceBounds}
                  isMobileDrawer={true}
                  onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
