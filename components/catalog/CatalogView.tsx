/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
import ProductCardSkeleton from '@/components/ui/ProductCardSkeleton';
import CatalogFilterSkeleton from '@/components/ui/CatalogFilterSkeleton';
import FilterSidebar, { FilterState } from './FilterSidebar';
import CategoryNavStrip from './CategoryNavStrip';

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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
      list = [...list].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return list;
  }, [filters, sortBy]);

  // Fallback alternatives for zero-state
  const fallbackAlternatives = useMemo(() => {
    return products.slice(0, 4);
  }, []);

  return (
    <div className="space-y-8 pb-16">
      {/* Category Scroll Strip */}
      <CategoryNavStrip
        selectedCategorySlug={filters.category}
        onSelectCategory={(slug) => setFilters((p) => ({ ...p, category: slug }))}
        isInteractiveFilter={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Breadcrumbs & Catalog Title Header */}
        <div className="space-y-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-cyan-600 transition-colors">
              Գլխավոր
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <span className="text-slate-900 font-bold">
              {activeCategory ? activeCategory.title : 'Ամբողջ Կատալոգ'}
            </span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
                {activeCategory ? activeCategory.title : 'Ցուցասրահի Ամբողջ Կատալոգ'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {activeCategory
                  ? `${activeCategory.itemCount} պրեմիում տեսականի առկա է Մելքումովի 40/1 սրահում`
                  : 'Գնե՛ք հատով՝ մեծածախի արժեքով: Պաշտոնական 1-5 տարվա երաշխիք:'}
              </p>
            </div>

            {/* Mobile Filter Toggle & Desktop Sorting Dropdown */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(true)}
                className="lg:hidden min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-950 text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                <span>Ֆիլտրեր</span>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-cyan-600 text-white text-[10px] flex items-center justify-center font-black">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="relative flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-2xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span className="text-xs font-semibold text-slate-600 hidden sm:inline">Դասավորել՝</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  aria-label="Դասավորել ըստ"
                  className="bg-transparent text-xs font-bold text-slate-900 focus:outline-hidden cursor-pointer"
                >
                  <option value="popular">Նախընտրելի / Հանրաճանաչ</option>
                  <option value="price-asc">Գնով՝ Աճող</option>
                  <option value="price-desc">Գնով՝ Նվազող</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Chips Bar */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-2">
              <span className="text-xs text-slate-500 font-semibold">Ակտիվ ֆիլտրեր.</span>
              {filters.category && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold">
                  Բաժին: {activeCategory?.title}
                  <button
                    type="button"
                    onClick={() => setFilters((p) => ({ ...p, category: null }))}
                    className="hover:text-cyan-950 cursor-pointer"
                  >
                    <X className="w-3 h-3" aria-hidden="true" />
                  </button>
                </span>
              )}
              {filters.inStockOnly && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  Առկա է սրահում
                  <button
                    type="button"
                    onClick={() => setFilters((p) => ({ ...p, inStockOnly: false }))}
                    className="hover:text-emerald-950 cursor-pointer"
                  >
                    <X className="w-3 h-3" aria-hidden="true" />
                  </button>
                </span>
              )}
              {filters.brands.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold"
                >
                  {b}
                  <button
                    type="button"
                    onClick={() =>
                      setFilters((p) => ({ ...p, brands: p.brands.filter((x) => x !== b) }))
                    }
                    className="hover:text-slate-950 cursor-pointer"
                  >
                    <X className="w-3 h-3" aria-hidden="true" />
                  </button>
                </span>
              ))}
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
            {!isMounted ? (
              <CatalogFilterSkeleton />
            ) : (
              <FilterSidebar
                filters={filters}
                onChange={setFilters}
                onReset={resetFilters}
                priceBounds={priceBounds}
              />
            )}
          </aside>

          {/* Product Grid Area */}
          <div className="lg:col-span-9 space-y-6">
            {!isMounted ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              /* Smart Zero-State Recovery */
              <div className="space-y-10">
                <div className="bg-white rounded-3xl border border-slate-200 p-10 sm:p-14 text-center max-w-xl mx-auto space-y-5 shadow-sm">
                  <div className="w-20 h-20 rounded-3xl bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto shadow-inner">
                    <PackageOpen className="w-10 h-10" aria-hidden="true" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight">
                      Նշված ֆիլտրերով ապրանքներ չեն գտնվել
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                      Ցավոք, ընտրված պարամետրերին համապատասխան ապրանքներ այս պահին առկա չեն: Խնդրում ենք մաքրել ֆիլտրերը կամ դիտել առաջարկվող այլընտրանքները:
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="min-h-[48px] px-8 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-extrabold uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer inline-flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" aria-hidden="true" />
                    <span>Մաքրել Բոլոր Ֆիլտրերը</span>
                  </button>
                </div>

                {/* 4-Item Fallback Alternatives Grid */}
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <h4 className="text-sm font-black text-slate-950 uppercase tracking-wider">
                    Առաջարկվող Այլընտրանքներ Մելքումովի 40/1 Սրահից
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {fallbackAlternatives.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
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
                  <SlidersHorizontal className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                  <span className="font-bold text-sm">Ֆիլտրեր</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white"
                  aria-label="Փակել ֆիլտրերը"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
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
