/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useMemo, useEffect, useRef, useTransition } from 'react';
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
import { HY } from '@/lib/copy/hy';
import ProductImage from '@/components/ui/ProductImage';
import Pagination from '@/components/ui/Pagination';

interface CatalogViewProps {
  initialCategorySlug?: string;
}

// One page of listings. The imported price list carries ~1.6k rows, so the
// catalogue is never rendered whole: 24 gallery cards is roughly two screens.
const PAGE_SIZE = 24;

const VALID_SORTS = ['catalogue', 'price-asc', 'price-desc'] as const;
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

/** Restores the active sort from the URL query string (defaults to `catalogue`). */
function readSortFromUrl(): SortKey {
  if (typeof window === 'undefined') return 'catalogue';
  try {
    const s = new URLSearchParams(window.location.search).get('sort');
    return s && (VALID_SORTS as readonly string[]).includes(s) ? (s as SortKey) : 'catalogue';
  } catch {
    return 'catalogue';
  }
}

/** Restores the page number from the URL query string (defaults to 1). */
function readPageFromUrl(): number {
  if (typeof window === 'undefined') return 1;
  try {
    const raw = Number(new URLSearchParams(window.location.search).get('page'));
    return Number.isInteger(raw) && raw > 0 ? raw : 1;
  } catch {
    return 1;
  }
}

export default function CatalogView({ initialCategorySlug }: CatalogViewProps) {
  // Price bounds come from the imported list itself. Hard-coding a ceiling used
  // to hide every listing above it: the real range tops out at 650 000.
  const priceBounds = useMemo(() => {
    let min = Infinity;
    let max = 0;
    for (const p of products) {
      const value = Number(p.price) || 0;
      if (value < min) min = value;
      if (value > max) max = value;
    }
    return { min: Number.isFinite(min) ? min : 0, max };
  }, []);

  // Filter state (seeded from the URL query for shareable / reloadable views)
  const [filters, setFilters] = useState<FilterState>(() =>
    readFiltersFromUrl(initialCategorySlug || null, priceBounds)
  );

  const [sortBy, setSortBy] = useState<SortKey>(() => readSortFromUrl());
  const [page, setPage] = useState<number>(() => readPageFromUrl());
  const [viewMode, setViewMode] = useState<'gallery' | 'compact'>('gallery');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  // Skeletons are only for the first mount. Filter/sort/page updates keep the
  // previous results mounted and merely dim the grid while pending, so the
  // document height never collapses (a collapsing grid was throwing the
  // viewport around on every filter change).
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isGridPending, startGridTransition] = useTransition();
  // Scroll target for page changes: the results column, not the document top,
  // so the filter sidebar stays where the user left it.
  const resultsTopRef = useRef<HTMLDivElement | null>(null);
  // Set only by explicit pagination clicks; consumed after the new page renders.
  const pendingPageScrollRef = useRef(false);
  // Focusable container for the mobile filter sheet (dialog focus management).
  const drawerPanelRef = useRef<HTMLDivElement | null>(null);

  const { addItem, openDrawer } = useCart();
  const { showCartToast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    const initialTimer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1000);
    return () => clearTimeout(initialTimer);
  }, []);

  // All filter/sort/page mutations run inside a transition: React exposes
  // isGridPending (wired to opacity + aria-busy below) while the update is
  // being applied, without unmounting anything.
  const updateFilters = (updater: (prev: FilterState) => FilterState) => {
    startGridTransition(() => setFilters(updater));
  };
  const updateSort = (next: SortKey) => {
    startGridTransition(() => setSortBy(next));
  };

  // A new filter set or ordering always restarts at page 1. The first run is
  // skipped so a deep link like `?page=3` survives the initial mount.
  const pageResetMountedRef = useRef(false);
  useEffect(() => {
    if (!pageResetMountedRef.current) {
      pageResetMountedRef.current = true;
      return;
    }
    setPage(1);
  }, [filters, sortBy]);

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

  // Serialize the active filters + sort into the URL query string (no reload,
  // no history entry, no scroll), making branded / filtered views shareable
  // and reloadable (BUG-03). Debounced so slider drags and rapid toggles don't
  // thrash the History API.
  useEffect(() => {
    if (!isMounted) return;
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (filters.category) params.set('category', filters.category);
      if (filters.brands.length) params.set('brand', filters.brands.join(','));
      if (filters.inStockOnly) params.set('stock', '1');
      if (filters.minPrice > priceBounds.min) params.set('min', String(filters.minPrice));
      if (filters.maxPrice < priceBounds.max) params.set('max', String(filters.maxPrice));
      if (sortBy !== 'catalogue') params.set('sort', sortBy);
      if (page > 1) params.set('page', String(page));
      const query = params.toString();
      const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
      // replaceState never scrolls and never spams history (filter toggles).
      window.history.replaceState({}, '', nextUrl);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters, sortBy, isMounted, page, priceBounds]);

  // Lock body scroll, trap focus inside the mobile filter sheet, and let
  // Escape dismiss it. Focus is moved into the dialog on open and restored to
  // the toggle on close so keyboard/AT users are never dropped at page top.
  useEffect(() => {
    if (!isMobileDrawerOpen) return;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = drawerPanelRef.current;
    requestAnimationFrame(() => panel?.focus({ preventScroll: true }));
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileDrawerOpen(false);
        return;
      }
      // Keep Tab cycling within the dialog panel (lightweight focus trap).
      if (e.key !== 'Tab' || !panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (!panel.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [isMobileDrawerOpen]);

  const resetFilters = () => {
    // Same no-scroll rule as every other filter change: results update in
    // place, the viewport stays exactly where the user left it.
    startGridTransition(() =>
      setFilters({
        category: null,
        brands: [],
        colors: [],
        diameters: [],
        materials: [],
        inStockOnly: false,
        minPrice: priceBounds.min,
        maxPrice: priceBounds.max,
      })
    );
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
      // Showroom availability filter. The price list says whether a line is in
      // the showroom, not how many units are on the shelf, so `inStock` alone
      // decides.
      if (filters.inStockOnly && !p.inStock) {
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

    // Sorting. The default is the price list's own SKU order: the sheet has no
    // popularity, "newness" or editorial ranking to sort by.
    if (sortBy === 'price-asc') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list = [...list].sort((a, b) => b.price - a.price);
    } else {
      list = [...list].sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
    }

    return list;
  }, [filters, sortBy]);

  // One page of the result set. With ~1.6k listings, rendering everything would
  // build ~1.6k product cards at once.
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageProducts = useMemo(
    () => filteredProducts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filteredProducts, safePage],
  );

  const handlePageChange = (next: number) => {
    pendingPageScrollRef.current = true;
    startGridTransition(() => setPage(next));
    // The actual scroll happens in the effect below, AFTER the new page of
    // results is rendered — scrolling to a stale offset mid-update was a
    // source of jumpy motion. Filters/sort never set this flag, so they
    // produce no viewport movement at all.
  };

  // Pagination-only scroll: bring the results column into view (its
  // scroll-margin-top keeps it clear of the sticky header), never the top of
  // the document. Skipped when the grid top is already visible.
  useEffect(() => {
    if (!pendingPageScrollRef.current) return;
    pendingPageScrollRef.current = false;
    const frame = requestAnimationFrame(() => {
      const el = resultsTopRef.current;
      if (!el) return;
      if (el.getBoundingClientRect().top >= 0) return; // grid top visible or below
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      el.scrollIntoView({ block: 'start', behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      // Move focus for keyboard/AT users without triggering another scroll.
      el.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [page]);

  // Fallback alternatives for zero-state
  const fallbackAlternatives = useMemo(() => {
    return products.slice(0, 4);
  }, []);

  return (
    <div className="space-y-8 pb-16">
      {/* Category Scroll Strip */}
      <CategoryNavStrip
        selectedCategorySlug={filters.category}
        onSelectCategory={(slug) => updateFilters((p) => ({ ...p, category: slug }))}
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
                aria-haspopup="dialog"
                aria-expanded={isMobileDrawerOpen}
                aria-controls="mobile-filter-sheet"
                className="lg:hidden min-h-[44px] px-4 py-2.5 rounded-control bg-ink text-white text-xs font-bold flex items-center gap-2 shadow-e1 cursor-pointer btn-tactile focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
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
                  onChange={(e) => updateSort(e.target.value as SortKey)}
                  aria-label="Դասավորել ըստ"
                  className="min-w-0 max-w-[8rem] truncate bg-transparent text-xs font-bold text-ink focus:outline-hidden cursor-pointer"
                >
                  <option value="catalogue">{HY.BY_CODE}</option>
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
                    onClick={() => updateFilters((p) => ({ ...p, category: null }))}
                    aria-label={`${HY.REMOVE} ${activeCategory?.title ?? ''}`}
                    className="inline-flex min-h-[24px] min-w-[24px] items-center justify-center rounded-full hover:text-ink hover:bg-accent/10 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
                    onClick={() => updateFilters((p) => ({ ...p, inStockOnly: false }))}
                    aria-label={`${HY.REMOVE} ${HY.IN_STOCK_SHOWROOM}`}
                    className="inline-flex min-h-[24px] min-w-[24px] items-center justify-center rounded-full hover:text-ink hover:bg-success/10 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
                      updateFilters((p) => ({ ...p, brands: p.brands.filter((x) => x !== b) }))
                    }
                    aria-label={`${HY.REMOVE} ${b}`}
                    className="inline-flex min-h-[24px] min-w-[24px] items-center justify-center rounded-full hover:text-ink hover:bg-line/70 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <X className="w-3 h-3" aria-hidden="true" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex min-h-[36px] items-center rounded-control px-2 text-xs font-bold text-danger hover:text-danger underline underline-offset-2 ml-1 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
              >
                Մաքրել բոլորը
              </button>
            </div>
          )}
        </div>

        {/* Main Grid & Desktop Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Sticky Sidebar — mounted as soon as the first load is
              done; filter changes never swap it for a skeleton, so accordions
              keep their state, focus stays put and its inner scroll survives. */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-[calc(var(--topbar-h)+var(--header-h)+1rem)] bg-white p-5 rounded-panel border border-line shadow-e1 max-h-[calc(100dvh-var(--topbar-h)-var(--header-h)-2rem)] overflow-y-auto overscroll-contain">
            {isInitialLoading ? (
              <CatalogFilterSkeleton />
            ) : (
              <FilterSidebar
                filters={filters}
                onChange={updateFilters}
                onReset={resetFilters}
                priceBounds={priceBounds}
              />
            )}
          </aside>

          {/* Product Grid Area */}
          <div
            ref={resultsTopRef}
            tabIndex={-1}
            aria-busy={isGridPending}
            className={`lg:col-span-9 space-y-6 scroll-mt-[calc(var(--topbar-h)+var(--header-h)+1rem)] outline-none transition-opacity duration-200 ${
 isGridPending ? 'opacity-60' : 'opacity-100'
 }`}
          >
            {isInitialLoading ? (
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
                    {pageProducts.map((product) => {
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
                            {product.inStock ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded border border-success">
                                <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                                {HY.IN_STOCK_SHOWROOM}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-muted bg-canvas px-2 py-0.5 rounded border border-line-strong">
                                <span className="w-1.5 h-1.5 rounded-full bg-faint"></span>
                                {HY.BACK_ORDER}
                              </span>
                            )}
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
                {pageProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* One page of ~1.6k listings: the controls sit below the results
                in both the gallery and the contractor table view. */}
            {!isInitialLoading && filteredProducts.length > PAGE_SIZE ? (
              <Pagination
                page={safePage}
                pageSize={PAGE_SIZE}
                total={filteredProducts.length}
                onChange={handlePageChange}
              />
            ) : null}
          </div>
        </div>
      </div>

      {/* Mobile Filters Native iOS-style Bottom Sheet (< 1024px) */}
      {isMobileDrawerOpen && (
        <div
          id="mobile-filter-sheet"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-filter-title"
          className="fixed inset-0 z-sheet lg:hidden overflow-hidden"
        >
          <div
            className="fixed inset-0 bg-ink/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          <div
            ref={drawerPanelRef}
            tabIndex={-1}
            className="fixed inset-x-0 bottom-0 max-h-[85dvh] bg-white rounded-t-3xl shadow-e2 flex flex-col z-10 outline-none animate-in slide-in-from-bottom duration-300"
          >
            {/* iOS Drag Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 rounded-full bg-line-strong" />
            </div>

            {/* Header */}
            <div className="px-5 py-3 border-b border-line flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-accent" />
                <h3 id="mobile-filter-title" className="font-bold text-sm text-ink">
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
              {isInitialLoading ? (
                <CatalogFilterSkeleton />
              ) : (
                <FilterSidebar
                  filters={filters}
                  onChange={updateFilters}
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
