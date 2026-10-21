/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Flame, Tag, ArrowRight } from 'lucide-react';
import { products } from '@/data/products';
import ProductCard from '@/components/product/ProductCard';
import { HY } from '@/lib/copy/hy';

type Segment = 'discount' | 'clearance';

/** Genuine price cut as a fraction of the old price (0 when there is none). */
function discountFraction(oldPrice: number | undefined, price: number): number {
  if (!oldPrice || oldPrice <= price) return 0;
  return (oldPrice - price) / oldPrice;
}

const SHOWCASE_LIMIT = 8;

export default function TabbedProductShowcase() {
  const [activeSegment, setActiveSegment] = useState<Segment>('discount');

  // Both segments come straight from the imported price list. The old "bestsellers"
  // and "new arrivals" tabs ranked on isFeatured/isNew flags the sheet does not
  // carry (and on `id % 3`, i.e. noise), so they are gone.
  const segmentProducts = React.useMemo(() => {
    if (activeSegment === 'clearance') {
      // The price list's own liquidation lot, in catalogue order.
      return products
        .filter((p) => p.clearance)
        .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }))
        .slice(0, SHOWCASE_LIMIT);
    }
    return products
      .filter((p) => discountFraction(p.oldPrice, p.price) > 0)
      .sort(
        (a, b) =>
          discountFraction(b.oldPrice, b.price) - discountFraction(a.oldPrice, a.price) ||
          a.code.localeCompare(b.code, undefined, { numeric: true }),
      )
      .slice(0, SHOWCASE_LIMIT);
  }, [activeSegment]);

  return (
    <section className="space-y-8">
      {/* Header & Segment Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-accent">
            {HY.OUR_SHOWROOM}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
            {HY.DISCOUNTS} {HY.AND} {HY.CLEARANCE}
          </h2>
        </div>

        {/* Tab Switcher */}
        <div className="flex w-full sm:w-auto items-center gap-1.5 p-1 rounded-panel bg-canvas border border-line shadow-e1 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveSegment('discount')}
            className={`min-h-[44px] shrink-0 whitespace-nowrap px-4 py-2 rounded-control text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer btn-tactile ${
 activeSegment === 'discount'
 ? 'bg-ink text-white shadow-e1'
 : 'text-body hover:text-ink'
 }`}
          >
            <Tag className="w-3.5 h-3.5 text-danger" />
            <span>{HY.BIG_DISCOUNTS}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSegment('clearance')}
            className={`min-h-[44px] shrink-0 whitespace-nowrap px-4 py-2 rounded-control text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer btn-tactile ${
 activeSegment === 'clearance'
 ? 'bg-ink text-white shadow-e1'
 : 'text-body hover:text-ink'
 }`}
          >
            <Flame className="w-3.5 h-3.5 text-accent" />
            <span>{HY.CLEARANCE}</span>
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
        {segmentProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="pt-2 text-center">
        <Link
          href="/catalog"
          className="min-h-[48px] inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-control bg-ink hover:bg-accent-hover text-white font-semibold text-xs transition-all shadow-e1 active:scale-98 cursor-pointer btn-tactile"
        >
          <span>{HY.VIEW_CATALOG}</span>
          <ArrowRight className="w-4 h-4 text-accent" />
        </Link>
      </div>
    </section>
  );
}
