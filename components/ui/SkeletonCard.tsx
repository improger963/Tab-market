/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';

/**
 * Mirrors the exact ProductCard anatomy and dimensions so the grid swaps in
 * with zero layout shift: pedestal → brand/title → code chip → price + CTA.
 */
export default function SkeletonCard() {
  return (
    <div className="rounded-card border border-line bg-surface shadow-e1 flex flex-col h-full overflow-hidden">
      {/* Image pedestal (aspect-square reserved to match ProductCard → zero CLS) */}
      <div className="relative aspect-square bg-canvas m-1.5 sm:m-2 rounded-control overflow-hidden">
        {/* Badge placeholder */}
        <div className="absolute top-2 left-2 w-12 h-5 skeleton-block rounded-full" />
        {/* Quick-action placeholders (44px targets) */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <div className="w-11 h-11 rounded-full skeleton-block" />
          <div className="w-11 h-11 rounded-full skeleton-block" />
        </div>
      </div>

      {/* Info body */}
      <div className="p-3 sm:p-4 pt-0 sm:pt-1 flex-1 flex flex-col justify-between space-y-2">
        <div className="space-y-2">
          {/* Brand & rating row */}
          <div className="flex items-center justify-between min-h-[1rem]">
            <div className="w-16 h-3 skeleton-block rounded-full" />
            <div className="w-10 h-3 skeleton-block rounded-full" />
          </div>

          {/* Title lines (2 clamped rows = min-h-[2.5rem]) */}
          <div className="space-y-1.5 pt-1 min-h-[2.5rem]">
            <div className="w-full h-4 skeleton-block rounded-full" />
            <div className="w-2/3 h-4 skeleton-block rounded-full" />
          </div>

          {/* Code chip placeholder */}
          <div className="w-24 h-5 skeleton-block rounded-control mt-1" />
        </div>

        {/* Price + CTA row, matching the card's footer layout */}
        <div className="pt-2 border-t border-line flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <div className="w-24 h-5 skeleton-block rounded-full" />
          </div>
          <div className="w-full sm:w-[120px] h-11 rounded-control skeleton-block shrink-0" />
        </div>
      </div>
    </div>
  );
}
