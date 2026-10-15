/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Award, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export const BRANDS = [
  { name: 'GANZER', slug: 'ganzer', country: 'Germany', desc: 'Պրեմիում ծորակներ և ինստալյացիաներ', rating: '4.9/5', badge: 'Բեսթսելեր' },
  { name: 'VIEIR', slug: 'vieir', country: 'Italy / Russia', desc: 'Ջեռուցման խողովակներ և կոլեկտորներ', rating: '4.8/5', badge: 'Պաշտոնական' },
  { name: 'LEDEME', slug: 'ledeme', country: 'International', desc: 'Լոգարանի և խոհանոցի ժամանակակից ծորակներ', rating: '4.7/5', badge: 'Հանրաճանաչ' },
  { name: 'HANSEN', slug: 'hansen', country: 'Germany', desc: 'Բարձր ճնշման ցնցուղային համակարգեր', rating: '4.9/5', badge: 'Նորույթ' },
  { name: 'GERHANS', slug: 'gerhans', country: 'Germany', desc: 'Անեզր սանկերամիկա և զուգարանակոնքեր', rating: '4.9/5', badge: 'Պրեմիում' },
  { name: 'ACCOONA', slug: 'accoona', country: 'Italy', desc: 'Ճկուն միացումներ և աքսեսուարներ', rating: '4.8/5', badge: 'Վստահելի' },
  { name: 'LEMARK', slug: 'lemark', country: 'Czech Republic', desc: 'Թերմոստատիկ և ստանդարտ խառնիչներ', rating: '4.9/5', badge: 'Էլիտար' },
];

export default function BrandsCarousel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const handleResize = () => checkScroll();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Optional smart auto-scroll when not hovered
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollContainerRef.current.scrollBy({ left: 280, behavior: 'smooth' });
        }
      }
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const scrollBy = (offset: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section 
      className="space-y-6 pt-4 relative group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-[#2563EB] mb-1">
            <Award className="w-3.5 h-3.5" />
            <span>Պաշտոնական Ներկրում & Եվրոպական Ստանդարտ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Վստահելի Եվրոպական և Միջազգային Բրենդներ
          </h2>
        </div>
        
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm hidden md:block">
            tab.am-ը հանդիսանում է այս առաջատար բրենդների պաշտոնական դիլերը Հայաստանում:
          </p>
          
          {/* Carousel Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollBy(-300)}
              disabled={!canScrollLeft}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all shadow-xs ${
                canScrollLeft 
                  ? 'bg-white border-slate-200 text-[#0F172A] hover:bg-slate-50 hover:border-blue-600 hover:text-blue-600 cursor-pointer' 
                  : 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
              }`}
              aria-label="Previous brands"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollBy(300)}
              disabled={!canScrollRight}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all shadow-xs ${
                canScrollRight 
                  ? 'bg-white border-slate-200 text-[#0F172A] hover:bg-slate-50 hover:border-blue-600 hover:text-blue-600 cursor-pointer' 
                  : 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
              }`}
              aria-label="Next brands"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Professional Smart Horizontal Scroll Carousel */}
      <div 
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-4 pt-2 px-1 focus:outline-none focus:ring-2 focus:ring-blue-600/20 rounded-2xl"
        tabIndex={0}
        role="region"
        aria-label="Brands carousel"
      >
        {BRANDS.map((brand, idx) => (
          <motion.div
            key={brand.slug}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="flex-shrink-0 w-[200px] sm:w-[220px] snap-start"
          >
            <Link
              href={`/brand/${brand.slug}`}
              className="group h-full bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-600 hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden block"
            >
              {/* Top Row: Badge & Official Shield */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 tracking-wider">
                  {brand.badge}
                </span>
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>100% Օրգ.</span>
                </div>
              </div>

              {/* Center: Brand Monogram & Name */}
              <div className="space-y-3 my-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white font-black text-lg tracking-wider flex items-center justify-center transition-transform group-hover:scale-105 group-hover:bg-[#2563EB] shadow-md">
                  {brand.name.slice(0, 3)}
                </div>

                <div>
                  <h3 className="font-black text-base text-[#0F172A] group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                    {brand.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-slate-500 font-semibold">{brand.country}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-xs font-bold text-amber-600">★ {brand.rating}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 pt-1 font-normal leading-relaxed">
                  {brand.desc}
                </p>
              </div>

              {/* Bottom Footer Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
                <span>Դիտել կատալոգը</span>
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
