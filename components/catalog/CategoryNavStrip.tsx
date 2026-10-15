/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useRef } from 'react';
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
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { categories } from '@/data/categories';

interface CategoryNavStripProps {
  selectedCategorySlug?: string | null;
  onSelectCategory?: (slug: string | null) => void;
  isInteractiveFilter?: boolean;
}

export default function CategoryNavStrip({
  selectedCategorySlug = null,
  onSelectCategory,
  isInteractiveFilter = false,
}: CategoryNavStripProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (offset: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Droplets':
        return <Droplets className="w-4 h-4 shrink-0" aria-hidden="true" />;
      case 'ShowerHead':
        return <ShowerHead className="w-4 h-4 shrink-0" aria-hidden="true" />;
      case 'Box':
      case 'Bath':
        return <Box className="w-4 h-4 shrink-0" aria-hidden="true" />;
      case 'CircleDot':
        return <CircleDot className="w-4 h-4 shrink-0" aria-hidden="true" />;
      case 'Archive':
        return <Archive className="w-4 h-4 shrink-0" aria-hidden="true" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 shrink-0" aria-hidden="true" />;
      case 'Flame':
        return <Flame className="w-4 h-4 shrink-0" aria-hidden="true" />;
      case 'Grid':
      case 'Wrench':
        return <Grid className="w-4 h-4 shrink-0" aria-hidden="true" />;
      case 'Layers':
        return <Layers className="w-4 h-4 shrink-0" aria-hidden="true" />;
      case 'Filter':
      case 'ShieldCheck':
        return <Filter className="w-4 h-4 shrink-0" aria-hidden="true" />;
      default:
        return <Droplets className="w-4 h-4 shrink-0" aria-hidden="true" />;
    }
  };

  return (
    <div className="relative w-full bg-white border-y border-[#E2E8F0] shadow-2xs py-3 px-4 sm:px-6 group">
      {/* Scroll Left Arrow (Desktop Hover) */}
      <button
        type="button"
        onClick={() => scrollBy(-280)}
        aria-label="Scroll left"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/95 shadow-md border border-[#E2E8F0] text-slate-700 hover:text-blue-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hidden sm:flex"
      >
        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
      </button>

      {/* Scroll Right Arrow (Desktop Hover) */}
      <button
        type="button"
        onClick={() => scrollBy(280)}
        aria-label="Scroll right"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/95 shadow-md border border-[#E2E8F0] text-slate-700 hover:text-blue-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hidden sm:flex"
      >
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
      </button>

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-1 touch-pan-x overscroll-x-contain"
      >
        {/* All Categories Chip */}
        {isInteractiveFilter ? (
          <button
            type="button"
            onClick={() => onSelectCategory && onSelectCategory(null)}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
              selectedCategorySlug === null
                ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-md'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-[#E2E8F0]'
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-blue-400" aria-hidden="true" />
            <span>Բոլոր 10 Բաժինները</span>
          </button>
        ) : (
          <Link
            href="/catalog"
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
              selectedCategorySlug === null
                ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-md'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-[#E2E8F0]'
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-blue-400" aria-hidden="true" />
            <span>Բոլոր 10 Բաժինները</span>
          </Link>
        )}

        {/* 10 Core Category Chips */}
        {categories.map((cat) => {
          const isSelected = selectedCategorySlug === cat.slug;

          if (isInteractiveFilter) {
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory && onSelectCategory(cat.slug)}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                  isSelected
                    ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-md'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-[#E2E8F0]'
                }`}
              >
                <span className={isSelected ? 'text-blue-400' : 'text-slate-500'}>
                  {getCategoryIcon(cat.icon)}
                </span>
                <span>{cat.title}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isSelected ? 'bg-slate-800 text-blue-300' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {cat.itemCount}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                isSelected
                  ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-md'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-[#E2E8F0]'
              }`}
            >
              <span className={isSelected ? 'text-blue-400' : 'text-slate-500'}>
                {getCategoryIcon(cat.icon)}
              </span>
              <span>{cat.title}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  isSelected ? 'bg-slate-800 text-blue-300' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {cat.itemCount}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
