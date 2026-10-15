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
} from 'lucide-react';
import { categories } from '@/data/categories';

export default function CategoryStories() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Droplets':
        return <Droplets className="w-6 h-6 text-blue-600" />;
      case 'ShowerHead':
        return <ShowerHead className="w-6 h-6 text-blue-600" />;
      case 'Box':
        return <Box className="w-6 h-6 text-blue-600" />;
      case 'CircleDot':
        return <CircleDot className="w-6 h-6 text-blue-600" />;
      case 'Archive':
        return <Archive className="w-6 h-6 text-blue-600" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-blue-600" />;
      case 'Flame':
        return <Flame className="w-6 h-6 text-blue-600" />;
      case 'Grid':
        return <Grid className="w-6 h-6 text-blue-600" />;
      case 'Layers':
        return <Layers className="w-6 h-6 text-blue-600" />;
      case 'Filter':
        return <Filter className="w-6 h-6 text-blue-600" />;
      default:
        return <Droplets className="w-6 h-6 text-blue-600" />;
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#2563EB]">
            Արագ Որոնում
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
            10 Հիմնական Բաժիններ (Stories)
          </h2>
        </div>
        <Link
          href="/catalog"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Բոլորը →
        </Link>
      </div>

      {/* Horizontal Scrollable Instagram Stories Bar */}
      <div
        ref={scrollRef}
        className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1 touch-pan-x overscroll-x-contain"
      >
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="flex flex-col items-center gap-2 group shrink-0 cursor-pointer w-20 sm:w-24 text-center"
          >
            {/* Circular Bubble with Active Royal Blue Glowing Ring */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0.5 bg-gradient-to-tr from-blue-600 via-indigo-500 to-sky-400 group-hover:scale-105 transition-transform shadow-md">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-2 border-2 border-white group-hover:border-blue-200 transition-colors">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="absolute inset-1 rounded-full w-[calc(100%-8px)] h-[calc(100%-8px)] object-cover opacity-85 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-1 rounded-full bg-[#0F172A]/30 group-hover:bg-transparent transition-colors flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center shadow-xs">
                    {getCategoryIcon(cat.icon)}
                  </div>
                </div>
              </div>
            </div>

            {/* Category Title */}
            <span className="text-[11px] sm:text-xs font-bold text-[#0F172A] group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
              {cat.title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
