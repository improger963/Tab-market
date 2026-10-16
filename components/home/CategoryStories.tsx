/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import type { ComponentType } from 'react';
import Link from 'next/link';
import {
  Droplets,
  ShowerHead,
  Box,
  CircleDot,
  Archive,
  Sparkles,
  Flame,
  Grid,
  Layers,
  Filter,
  ArrowRight,
} from 'lucide-react';
import { categories } from '@/data/categories';
import { resolveImageUrl } from '@/lib/config';
import { HY } from '@/lib/copy/hy';

/**
 * Category stories rail — built from the category data (any count).
 * Anatomy per spec: 64–72px circle with real image or neutral icon
 * placeholder, 1–2 line label below, scroll-snap momentum rail with hidden
 * scrollbar and edge fade, >=44px touch targets, focus-visible ring.
 * No rainbow gradients, no rotate/tilt decoration, no invented counts.
 */

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  Droplets,
  ShowerHead,
  Box,
  CircleDot,
  Archive,
  Sparkles,
  Flame,
  Grid,
  Layers,
  Filter,
};

export default function CategoryStories() {
  return (
    <section aria-label={HY.FAST_SEARCH} className="space-y-4">
      <div className="flex items-end justify-between gap-4 px-1">
        <div>
          <span className="text-xs font-semibold text-accent">{HY.FAST_SEARCH}</span>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-ink sm:text-2xl">
            {categories.length} {HY.MAIN_CATEGORIES}
          </h2>
        </div>
        <Link
          href="/catalog"
          className="btn-tactile inline-flex min-h-[44px] items-center gap-1.5 rounded-control px-3 text-sm font-semibold text-accent transition-colors duration-hover ease-precision hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <span>{HY.ALL}</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {/* Momentum-scrollable rail: snap, hidden scrollbar, edge fade. */}
      <div className="edge-fade no-scrollbar -mx-1 snap-x overflow-x-auto overscroll-x-contain px-1 py-2">
        <ul className="flex items-start gap-3 sm:gap-4">
          {categories.map((cat) => {
            const img = resolveImageUrl(cat.image);
            const Icon = ICONS[cat.icon] ?? Droplets;
            return (
              <li key={cat.id} className="snap-center shrink-0">
                <Link
                  href={`/category/${cat.slug}`}
                  className="group btn-tactile flex w-20 flex-col items-center gap-2 rounded-card px-1 py-1 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 sm:w-[76px]"
                >
                  {/* Pedestal circle: real image or neutral icon placeholder. */}
                  <span className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-line bg-canvas ring-1 ring-inset ring-white/70 transition-[transform,border-color] duration-hover ease-precision group-hover:border-line-strong group-hover:scale-[1.04] sm:h-[72px] sm:w-[72px]">
                    {img ? (
                      <img
                        src={img}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
                    )}
                  </span>
                  <span className="line-clamp-2 min-h-[2rem] text-xs font-medium leading-tight text-body transition-colors duration-hover group-hover:text-ink">
                    {cat.title}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
