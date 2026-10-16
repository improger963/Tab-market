/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  SlidersHorizontal,
  ChevronRight,
  X,
  PackageOpen,
  ArrowUpDown,
  RotateCcw,
  LayoutGrid,
  Rows,
  ShoppingCart,
} from 'lucide-react';
import { products } from '@/data/products';
import { categories } from '@/data/categories';
import ProductCard from '@/components/product/ProductCard';
import SkeletonCard from '@/components/ui/SkeletonCard';
import CatalogFilterSkeleton from '@/components/ui/CatalogFilterSkeleton';
import FilterSidebar, { FilterState } from './FilterSidebar';
import CategoryNavStrip from './CategoryNavStrip';
import { useCart } from '@/store/useCart';
import { useToast } from '@/store/useToast';
import { formatAMD } from '@/lib/utils';
import ProductImage from '@/components/ui/ProductImage';

interface CatalogViewProps {
  initialCategorySlug?: string;
}

const VALID_SORTS = ['popular', 'price-asc', 'price-desc'] as const;
type SortKey = (typeof VALID_SORTS)[number];

/**
 * Builds the initial filter state from the shareable URL query string, so a
 * deep link like `/catalog?brand=VIEIR&stock=1` restores the exact view. The
 * route-path category (from `/category/[slug]`) is used as a fallback.
 */
function readFiltersFromUrl(
  pathCategory: string | null,
  priceBounds: { min: number; max: number }
): FilterState {
  const base: FilterState = {
    category: pathCategory,
    brands: [],
    colors: [],
    diameters: [],
    materials: [],
    inStockOnly: false,
    minPrice: priceBounds.min,
    maxPrice: priceBounds.max,
  };
  if (typeof window === 'undefined') return base;
  try {
    const sp = new URLSearchParams(window.location.search);
    const minRaw = sp.get('min');
    const maxRaw = sp.get('max');
    return {
      ...base,
      category: sp.get('category') || pathCategory,
      brands: (sp.get('brand') || '').split(',').map((s) => s.trim()).filter(Boolean),
      inStockOnly: sp.get('stock') === '1',
      minPrice: minRaw !== null && Number.isFinite(Number(minRaw)) ? Number(minRaw) : priceBounds.min,
      maxPrice: maxRaw !== null && Number.isFinite(Number(maxRaw)) ? Number(maxRaw) : priceBounds.max,
    };
  } catch {
    return base;
  }
}

/** Restores the active sort from the URL query string (defaults to `popular`). */
function readSortFromUrl(): SortKey {
  if (typeof window === 'undefined') return 'popular';
  try {
    const s = new URLSearchParams(window.location.search).get('sort');
    return s && (VALID_SORTS as readonly string[]).includes(s) ? (s as SortKey) : 'popular';
  } catch {
    return 'popular';
  }
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

  // Filter state (seeded from the URL query for shareable / reloadable views)
  const [filters, setFilters] = useState<FilterState>(() =>
    readFiltersFromUrl(initialCategorySlug || null, priceBounds)
  );

  const [sortBy, setSortBy] = useState<SortKey>(() => readSortFromUrl());
  const [viewMode, setViewMode] = useState<'gallery' | 'compact'>('gallery');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { addItem, openDrawer } = useCart();
  const { showCartToast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    const initialTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(initialTimer);
  }, []);

  // Trigger 1-second loading simulation whenever filters or sort changes
  useEffect(() => {
    if (!isMounted) return;
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [filters, sortBy, isMounted]);

  // Route-driven category sync (Back / Forward between /catalog and
  // /category/[slug]). The first run is skipped so a category parsed from the
  // URL query on initial mount is preserved; afterwards the path is
  // authoritative — leaving a category route resets the category filter to null
  // instead of leaving a stale category / heading behind (BUG-04).
  const pathCategoryMountedRef = useRef(false);
  useEffect(() => {
    if (!pathCategoryMountedRef.current) {
      pathCategoryMountedRef.current = true;
      return;
    }
    const nextCategory = initialCategorySlug || null;
    setFilters((prev) =>
      prev.category === nextCategory ? prev : { ...prev, category: nextCategory }
    );
  }, [initialCategorySlug]);

  // Serialize the active filters + sort into the URL query string (no reload),
  // making branded / filtered views shareable and reloadable (BUG-03).
  useEffect(() => {
    if (!isMounted) return;
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.brands.length) params.set('brand', filters.brands.join(','));
    if (filters.inStockOnly) params.set('stock', '1');
    if (filters.minPrice > priceBounds.min) params.set('min', String(filters.minPrice));
    if (filters.maxPrice < priceBounds.max) params.set('max', String(filters.maxPrice));
    if (sortBy !== 'popular') params.set('sort', sortBy);
    const query = params.toString();
    const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState({}, '', nextUrl);
  }, [filters, sortBy, isMounted, priceBounds]);

  // Lock body scroll and allow Escape to dismiss the mobile filter sheet (no layout jump).
  useEffect(() => {
    if (!isMobileDrawerOpen) return;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileDrawerOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileDrawerOpen]);

  const resetFilters = () => {
    setIsLoading(true);
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
    setTimeout(() => setIsLoading(false), 1000);
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

      <div className="space-y-6">
        {/* Breadcrumbs & Catalog Title Header */}
        <div className="space-y-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted">
            <Link href="/" className="hover:text-accent transition-colors">
              Գլխավոր
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-muted" aria-hidden="true" />
            <span className="text-ink font-bold">
              {activeCategory ? activeCategory.title : 'Ամբողջ Կատալոգ'}
            </span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-ink tracking-tight">
                {activeCategory ? activeCategory.title : 'Ցուցասրահի Ամբողջ Կատալոգ'}
              </h1>
              <p className="text-xs sm:text-sm text-muted mt-1">
                {activeCategory
                  ? `${activeCategory.itemCount} պրեմիում տեսականի առկա է Մելքումովի 40/1 սրահում`
                  : 'Գնե՛ք հատով՝ մեծածախի արժեքով: Պաշտոնական 1-5 տարվա երաշխիք:'}
              </p>
            </div>

            {/* Mobile Filter Toggle & Desktop Sorting Dropdown */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(true)}
                className="lg:hidden min-h-[44px] px-4 py-2.5 rounded-control bg-ink text-white text-xs font-bold flex items-center gap-2 shadow-e1 cursor-pointer btn-tactile"
              >
                <SlidersHorizontal className="w-4 h-4 text-accent" aria-hidden="true" />
                <span>Ֆիլտրեր</span>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-accent text-white text-xs flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="relative flex min-w-0 items-center gap-2 bg-white border border-line rounded-control px-3 py-2 shadow-e1">
                <ArrowUpDown className="w-3.5 h-3.5 text-muted shrink-0" aria-hidden="true" />
                <span className="text-xs font-semibold text-body hidden sm:inline">Դասավորել՝</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'popular' | 'price-asc' | 'price-desc')}
                  aria-label="Դասավորել ըստ"
                  className="min-w-0 max-w-[8rem] truncate bg-transparent text-xs font-bold text-ink focus:outline-hidden cursor-pointer"
                >
                  <option value="popular">Նախընտրելի / Հանրաճանաչ</option>
                  <option value="price-asc">Գնով՝ Աճող</option>
                  <option value="price-desc">Գնով՝ Նվազող</option>
                </select>
              </div>

              {/* View Switcher Toggle */}
              <div className="flex items-center bg-white border border-line rounded-control p-1 shadow-e1">
                <button
                  type="button"
                  onClick={() => setViewMode('gallery')}
                  title="Վիզուալ Ցանց (Gallery)"
                  className={`p-2 rounded-card transition-colors cursor-pointer btn-tactile ${
 viewMode === 'gallery'
 ? 'bg-ink text-white shadow-e1'
 : 'text-muted hover:text-ink hover:bg-canvas'
 }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('compact')}
                  title="Կոմպակտ Աղյուսակ վարպետների համար (Compact)"
                  className={`p-2 rounded-card transition-colors cursor-pointer btn-tactile ${
 viewMode === 'compact'
 ? 'bg-ink text-white shadow-e1'
 : 'text-muted hover:text-ink hover:bg-canvas'
 }`}
                >
                  <Rows className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Chips Bar */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-2">
              <span className="text-xs text-muted font-semibold">Ակտիվ ֆիլտրեր.</span>
              {filters.category && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-card bg-accent/5 border border-accent/15 text-accent-hover text-xs font-bold">
                  Բաժին: {activeCategory?.title}
                  <button
                    type="button"
                    onClick={() => setFilters((p) => ({ ...p, category: null }))}
                    className="hover:text-ink cursor-pointer"
                  >
                    <X className="w-3 h-3" aria-hidden="true" />
                  </button>
                </span>
              )}
              {filters.inStockOnly && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-card bg-success/10 border border-success text-ink text-xs font-bold">
                  Առկա է սրահում
                  <button
                    type="button"
                    onClick={() => setFilters((p) => ({ ...p, inStockOnly: false }))}
                    className="hover:text-ink cursor-pointer"
                  >
                    <X className="w-3 h-3" aria-hidden="true" />
                  </button>
                </span>
              )}
              {filters.brands.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-card bg-canvas border border-line text-ink text-xs font-bold"
                >
                  {b}
                  <button
                    type="button"
                    onClick={() =>
                      setFilters((p) => ({ ...p, brands: p.brands.filter((x) => x !== b) }))
                    }
                    className="hover:text-ink cursor-pointer"
                  >
                    <X className="w-3 h-3" aria-hidden="true" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-bold text-danger hover:text-danger underline underline-offset-2 ml-1 cursor-pointer"
              >
                Մաքրել բոլորը
              </button>
            </div>
          )}
        </div>

        {/* Main Grid & Desktop Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Sticky Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-[calc(var(--topbar-h)+var(--header-h)+1rem)] bg-white p-5 rounded-panel border border-line shadow-e1 max-h-[calc(100dvh-var(--topbar-h)-var(--header-h)-2rem)] overflow-y-auto overscroll-contain">
            {!isMounted || isLoading ? (
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
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 lg:[grid-template-columns:repeat(auto-fill,minmax(min(100%,220px),1fr))] gap-3 sm:gap-5 lg:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              /* Smart Zero-State Recovery */
              <div className="space-y-10">
                <div className="bg-white rounded-panel border border-line p-10 sm:p-14 text-center max-w-xl mx-auto space-y-5 shadow-e1">
                  <div className="w-20 h-20 rounded-panel bg-accent/5 text-accent flex items-center justify-center mx-auto">
                    <PackageOpen className="w-10 h-10" aria-hidden="true" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-bold text-ink tracking-tight">
                      Նշված ֆիլտրերով ապրանքներ չեն գտնվել
                    </h3>
                    <p className="text-xs sm:text-sm text-muted max-w-md mx-auto leading-relaxed">
                      Ցավոք, ընտրված պարամետրերին համապատասխան ապրանքներ այս պահին առկա չեն: Խնդրում ենք մաքրել ֆիլտրերը կամ դիտել առաջարկվող այլընտրանքները:
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="min-h-[48px] px-8 py-3 rounded-control bg-ink hover:bg-accent-hover text-white text-xs font-semibold transition-all shadow-e1 active:scale-98 cursor-pointer inline-flex items-center gap-2 btn-tactile"
                  >
                    <RotateCcw className="w-4 h-4" aria-hidden="true" />
                    <span>Մաքրել Բոլոր Ֆիլտրերը</span>
                  </button>
                </div>

                {/* 4-Item Fallback Alternatives Grid */}
                <div className="space-y-4 pt-4 border-t border-line">
                  <h4 className="text-sm font-bold text-ink ">
                    Առաջարկվող Այլընտրանքներ Մելքումովի 40/1 Սրահից
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {fallbackAlternatives.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              </div>
            ) : viewMode === 'compact' ? (
              /* Compact Contractor Table View */
              <div className="bg-white rounded-panel border border-line shadow-e1 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-canvas border-b border-line-strong text-muted font-bold text-xs">
                      <th className="p-3.5">Կոդ / SKU</th>
                      <th className="p-3.5">Ապրանք</th>
                      <th className="p-3.5 hidden sm:table-cell">Բնութագիր (Specs)</th>
                      <th className="p-3.5">Գին</th>
                      <th className="p-3.5 hidden md:table-cell">Առկայություն</th>
                      <th className="p-3.5 text-right">Գործողություն</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredProducts.map((product) => {
                      // Contractor-core specs first: Diameter / Material / Cartridge, padded with Warranty
                      const specPriority = ['Միացում', 'Նյութ', 'Քարտրիջ', 'Երաշխիք'];
                      const specEntries = Object.entries(product.specs);
                      const coreSpecs = specPriority
                        .map((key) => specEntries.find(([k]) => k.includes(key)))
                        .filter((e): e is [string, string] => Boolean(e));
                      const extraSpecs = specEntries.filter(
                        ([k]) => !specPriority.some((key) => k.includes(key)) && !k.includes('Կոդ')
                      );
                      const specSummary = [...coreSpecs, ...extraSpecs]
                        .slice(0, 3)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' · ');
                      return (
                        <tr key={product.id} className="hover:bg-canvas/60 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-accent whitespace-nowrap">
                            {product.code}
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <ProductImage
                                src={product.images[0]}
                                alt={product.title}
                                className="w-10 h-10 rounded-card bg-canvas border border-line shrink-0"
                              />
                              <Link
                                href={`/product/${product.slug}`}
                                className="font-bold text-ink hover:text-accent line-clamp-1 transition-colors"
                              >
                                {product.title}
                              </Link>
                            </div>
                          </td>
                          <td className="p-3.5 hidden sm:table-cell text-muted text-xs truncate max-w-xs">
                            {specSummary || product.categoryName}
                          </td>
                          <td className="p-3.5 font-bold text-ink tabular-nums whitespace-nowrap">
                            {formatAMD(product.price)}
                          </td>
                          <td className="p-3.5 hidden md:table-cell whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded border border-success">
                              <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                              Առկա ({product.stockQuantity})
                            </span>
                          </td>
                          <td className="p-3.5 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                addItem(product, 1);
                                showCartToast(product, 1);
                                openDrawer();
                              }}
                              className="px-3.5 py-2 rounded-control bg-ink hover:bg-accent text-white font-bold text-xs shadow-e1 transition-all cursor-pointer inline-flex items-center gap-1.5 btn-tactile"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>Ավելացնել</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Responsive 2-column on mobile, 3-column on tablet and desktop */
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 lg:[grid-template-columns:repeat(auto-fill,minmax(min(100%,220px),1fr))] gap-3 sm:gap-5 lg:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Native iOS-style Bottom Sheet (< 1024px) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-sheet lg:hidden overflow-hidden">
          <div
            className="fixed inset-0 bg-ink/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          <div className="fixed inset-x-0 bottom-0 max-h-[85dvh] bg-white rounded-t-3xl shadow-e2 flex flex-col z-10 animate-in slide-in-from-bottom duration-300">
            {/* iOS Drag Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 rounded-full bg-line-strong" />
            </div>

            {/* Header */}
            <div className="px-5 py-3 border-b border-line flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-accent" />
                <h3 className="font-bold text-sm text-ink">
                  Ֆիլտրեր {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-xs font-bold text-danger hover:text-danger px-2 py-1"
                  >
                    Մաքրել
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted hover:text-body rounded-control hover:bg-canvas btn-tactile"
                  aria-label="Փակել"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Facets */}
            <div className="flex-1 overflow-y-auto p-5 overscroll-contain">
              {!isMounted || isLoading ? (
                <CatalogFilterSkeleton />
              ) : (
                <FilterSidebar
                  filters={filters}
                  onChange={setFilters}
                  onReset={resetFilters}
                  priceBounds={priceBounds}
                  isMobileDrawer={true}
                />
              )}
            </div>

            {/* Sticky Bottom Apply CTA with Safe Area */}
            <div className="p-4 border-t border-line bg-white shrink-0 pb-[calc(env(safe-area-inset-bottom,16px)+16px)]">
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="w-full min-h-[48px] py-3 rounded-panel bg-ink hover:bg-accent active:scale-98 text-white text-xs font-bold shadow-e1 flex items-center justify-center gap-2 transition-all cursor-pointer btn-tactile"
              >
                <span>Կիրառել Ֆիլտրերը {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
