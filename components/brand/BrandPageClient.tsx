/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, PackageX, ArrowRight, MapPin, Truck } from 'lucide-react';
import { products } from '@/data/products';
import { brandBySlug } from '@/data/brands';
import ProductCard from '@/components/product/ProductCard';
import ProductImage from '@/components/ui/ProductImage';
import Pagination from '@/components/ui/Pagination';
import { DELIVERY_CONFIG, SHOWROOM_INFO, resolveImageUrl } from '@/lib/config';
import { HY } from '@/lib/copy/hy';

interface BrandPageClientProps {
  slug: string;
}

const PAGE_SIZE = 24;

/**
 * Dedicated brand landing page, shared by the App Router route and the SPA
 * router so there is a single source of truth.
 *
 * Only facts the price list really carries are shown: the brand's own spelling,
 * its photograph, and the listings attributed to it. Origin, ratings, award
 * badges and blanket warranty promises were removed - the price list has no such
 * columns, so any such statement on this page would have been invented.
 */
export default function BrandPageClient({ slug }: BrandPageClientProps) {
  const brand = brandBySlug.get(slug);

  const brandProducts = useMemo(
    () =>
      brand
        ? products
            .filter((p) => p.brand === brand.name)
            .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }))
        : [],
    [brand],
  );

  const [page, setPage] = useState(1);
  const resultsTopRef = useRef<HTMLDivElement | null>(null);
  // Set only by explicit pagination clicks; consumed after the new page renders.
  const pendingPageScrollRef = useRef(false);

  // A different brand means a different result set: start over on page 1.
  useEffect(() => {
    setPage(1);
  }, [slug]);

  const totalPages = Math.max(1, Math.ceil(brandProducts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageProducts = useMemo(
    () => brandProducts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [brandProducts, safePage],
  );

  const handlePageChange = (next: number) => {
    pendingPageScrollRef.current = true;
    setPage(next);
  };

  // Pagination-only scroll, run AFTER the new page of results is rendered:
  // bring the listings container into view (scroll-margin-top keeps it below
  // the sticky header), never the top of the document. Skipped when the
  // container top is already visible.
  useEffect(() => {
    if (!pendingPageScrollRef.current) return;
    pendingPageScrollRef.current = false;
    const frame = requestAnimationFrame(() => {
      const el = resultsTopRef.current;
      if (!el) return;
      if (el.getBoundingClientRect().top >= 0) return;
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
      // Move focus for keyboard/AT users without triggering another scroll.
      el.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [page]);

  if (!brand) {
    return (
      <div className="max-w-2xl w-full mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-panel bg-canvas text-faint flex items-center justify-center mx-auto">
          <PackageX className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-ink tracking-tight">
            {HY.BRAND_NOT_FOUND}
          </h1>
          <p className="text-xs sm:text-sm text-muted max-w-sm mx-auto leading-relaxed">
            {HY.BRAND_ABSENT}
          </p>
        </div>
        <Link
          href="/catalog"
          className="min-h-[48px] inline-flex items-center gap-2 px-8 py-3 rounded-panel bg-ink hover:bg-accent text-white font-bold text-xs transition-all shadow-e1 active:scale-98"
        >
          <span>{HY.BACK_TO_CATALOG}</span>
          <ArrowRight className="w-4 h-4 text-accent" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-lux py-8 space-y-10">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs text-muted overflow-x-auto no-scrollbar whitespace-nowrap"
      >
        <Link href="/" className="hover:text-accent transition-colors">
          {HY.HOME}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-muted" />
        <Link href="/catalog" className="hover:text-accent transition-colors">
          {HY.CATALOG}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-muted" />
        <span className="text-ink font-bold">{brand.name}</span>
      </nav>

      {/* Brand Header - name, its own photography and its real listing count */}
      <div className="bg-ink text-white rounded-panel p-8 sm:p-12 border border-ink shadow-e2 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-4">
            {resolveImageUrl(brand.image) ? (
              <ProductImage
                src={brand.image}
                alt={brand.name}
                className="w-16 h-16 rounded-control shrink-0 bg-white"
                imgClassName="object-contain p-1.5"
              />
            ) : (
              <div className="w-16 h-16 rounded-panel bg-ice-chrome border-ice-chrome text-ink font-bold text-2xl tracking-wider flex items-center justify-center shrink-0">
                {brand.name.slice(0, 3)}
              </div>
            )}
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase">
              {brand.name}
            </h1>
          </div>

          <p className="text-on-dark text-xs sm:text-sm leading-relaxed tabular-nums">
            {brand.count} {HY.APRANQ}
          </p>
        </div>

        {/* Verified showroom facts only */}
        <div className="w-full md:w-auto bg-ink/90 border border-body/80 p-5 rounded-panel flex items-center gap-4 shrink-0 shadow-e1">
          <div className="w-12 h-12 rounded-control bg-accent text-white flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-white block">{HY.OUR_SHOWROOM}</span>
            <span className="text-muted">{SHOWROOM_INFO.address}</span>
          </div>
        </div>
      </div>

      {/* Delivery fact, only when the delivery config really guarantees it */}
      {DELIVERY_CONFIG.yerevanFreeAlways ? (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-body bg-canvas border border-line rounded-panel px-5 py-3.5">
          <span className="inline-flex items-center gap-1.5 text-success">
            <span className="w-4 h-4 rounded-full bg-success/10 text-success flex items-center justify-center text-xs font-bold">
              <Truck className="w-3 h-3" />
            </span>
            {HY.FREE_DELIVERY_YEREVAN}
          </span>
        </div>
      ) : null}

      {/* Product listings for this brand */}
      <div
        className="space-y-6 scroll-mt-[calc(var(--topbar-h)+var(--header-h)+1rem)] outline-none"
        ref={resultsTopRef}
        tabIndex={-1}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight tabular-nums">
            {brand.name} {HY.ASSORTMENT} ({brandProducts.length} {HY.APRANQ})
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {pageProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <Pagination
          page={safePage}
          pageSize={PAGE_SIZE}
          total={brandProducts.length}
          onChange={handlePageChange}
          className="pt-4"
        />
      </div>
    </div>
  );
}
