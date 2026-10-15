/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  MapPin,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flame,
  Truck,
  ShieldCheck,
} from 'lucide-react';

interface HeroSlide {
  id: number;
  badge: string;
  badgeIcon: any;
  titlePrefix: string;
  titleHighlight: string;
  description: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  bgImage: string;
  stat: string;
  statLabel: string;
}

const SLIDES: HeroSlide[] = [
  {
    id: 1,
    badge: 'ԳԱՐՆԱՆԱՅԻՆ ՎԵՐԱԶԻՆՈՒՄ • ՄԻՆՉԵՎ 40% ԶԵՂՉ',
    badgeIcon: Sparkles,
    titlePrefix: 'ՇԱՀԱՎԵՏ ԱՌԱՋԱՐԿ․',
    titleHighlight: 'ԼՈԳԱՍԵՆՅԱԿԻ ՀԱՎԱՔԱԾՈՒՆԵՐ',
    description:
      'Մինչև 40% զեղչ պրեմիում դասի ցնցուղային համակարգերի, ծորակների և ինստալյացիաների վրա՝ Մելքումովի 40/1 սրահում:',
    primaryCtaText: 'Դիտել Զեղչերը',
    primaryCtaLink: '/catalog',
    bgImage:
      'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=1600&q=85',
    stat: '-40%',
    statLabel: 'Spring Special',
  },
  {
    id: 2,
    badge: 'ԽԵՂԱՑԻ ԿԱՀԱՎՈՐՈՒՄ ԵՎ LED ՀԱՅԵԼԻՆԵՐ',
    badgeIcon: Flame,
    titlePrefix: 'ԲԱՑԱՌԻԿ ԳԵՐՄԱՆԱԿԱՆ ԵՎ ԻՏԱԼԱԿԱՆ ՈՃ',
    titleHighlight: 'LED ՀԱՅԵԼԻՆԵՐ ԵՎ ՊԱՀԱՐԱՆՆԵՐ',
    description:
      'Ժամանակակից լոգարանի կահույք սենսորային կառավարմամբ, հակամառախուղային համակարգով և պատրաստի առաքմամբ:',
    primaryCtaText: 'Բացահայտել Հավաքածուն',
    primaryCtaLink: '/catalog',
    bgImage:
      'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1600&q=85',
    stat: '100% Առկա',
    statLabel: 'Մելքումովի 40/1',
  },
  {
    id: 3,
    badge: '🚚 ԱՆՎՃԱՐ ԱՌԱՔՈՒՄ ԵՐԵՎԱՆՈՒՄ ԱՆՄԻՋԱՊԵՍ',
    badgeIcon: Truck,
    titlePrefix: 'ԱՆՎՃԱՐ ԱՌԱՔՈՒՄ ԵՐԵՎԱՆՈՒՄ',
    titleHighlight: 'ԱՆՄԻՋԱՊԵՍ ԳՆՄԱՆ ՕՐԸ',
    description:
      'Գնե՛ք ցանկացած սանտեխնիկա առցանց կամ Մելքումովի 40/1 սրահից, և մենք կառաքենք Երևանի ողջ տարածքում անվճար:',
    primaryCtaText: 'Անցնել Կատալոգ',
    primaryCtaLink: '/catalog',
    bgImage:
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1600&q=85',
    stat: '0 ֏',
    statLabel: 'Անվճար Առաքում',
  },
];

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[currentSlide];
  const BadgeIcon = slide.badgeIcon;

  return (
    <div className="relative rounded-3xl overflow-hidden bg-[#0F172A] border border-slate-800 shadow-2xl min-h-[480px] sm:min-h-[520px] flex flex-col justify-between">
      {/* Background Image with AnimatePresence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="absolute inset-0 z-0"
        >
          <img
            src={slide.bgImage}
            alt={slide.titleHighlight}
            className="w-full h-full object-cover opacity-45"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/80 to-[#0F172A]/40" />
        </motion.div>
      </AnimatePresence>

      {/* Slide Content */}
      <div className="relative z-10 p-6 sm:p-12 lg:p-16 max-w-3xl space-y-6 my-auto">
        {/* Top trust pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-mono font-bold tracking-wider backdrop-blur-md uppercase">
          <BadgeIcon className="w-3.5 h-3.5 text-blue-400" />
          <span>{slide.badge}</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] text-white">
          {slide.titlePrefix}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-white block sm:inline">
            {slide.titleHighlight}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-200 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl font-normal">
          {slide.description}
        </p>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
          <Link
            href={slide.primaryCtaLink}
            className="min-h-[48px] inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-98 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer"
          >
            <span>{slide.primaryCtaText}</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </Link>

          <a
            href="https://maps.google.com/?q=Yerevan+Melkumovi+40/1"
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[48px] inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 font-bold text-xs tracking-wider uppercase transition-all cursor-pointer shadow-xs"
          >
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Մելքումովի 40/1 Սրահ</span>
          </a>
        </div>
      </div>

      {/* Carousel controls & Stat badge */}
      <div className="relative z-20 p-6 sm:p-8 flex items-center justify-between border-t border-slate-800/80 bg-[#0F172A]/80 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Պաշտոնական 1-5 տարվա երաշխիք • ապառիկ 0%</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <span className="text-sm font-black text-blue-400 block tabular-nums">
              {slide.stat}
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              {slide.statLabel}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#1E293B] p-1.5 rounded-2xl border border-slate-700 shadow-lg">
            <button
              type="button"
              onClick={() =>
                setCurrentSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1))
              }
              aria-label="Նախորդ սլայդ"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex gap-1.5 px-1.5">
              {SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Սլայդ ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    currentSlide === idx ? 'w-6 bg-blue-500' : 'w-1.5 bg-white/30'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setCurrentSlide((prev) => (prev + 1) % SLIDES.length)}
              aria-label="Հաջորդ սլայդ"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
