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
  ShieldCheck,
  Truck,
  Building2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flame,
  Layers,
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
    badge: 'ՃԱՐՏԱՐԱՊԵՏԱԿԱՆ ԼՈԳԱՍԵՆՅԱԿ & ARMEX ՊԱՀԵՍՏ ԵՐԵՎԱՆՈՒՄ',
    badgeIcon: Sparkles,
    titlePrefix: 'ՍԱՆՏԵԽՆԻԿԱՅԻ ՃԱՐՏԱՐԱՊԵՏՈՒԹՅՈՒՆ',
    titleHighlight: 'ՄԵԼՔՈՒՄՈՎԻ 40/1',
    description:
      'Պրեմիում լոգասենյակի կահավորում, անեզր rimless զուգարանակոնքեր և եվրոպական ստանդարտի սանտեխնիկա՝ անմիջապես պահեստից:',
    primaryCtaText: 'Դիտել Կատալոգը',
    primaryCtaLink: '/catalog',
    bgImage:
      'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=1600&q=85',
    stat: '10+ Տարի',
    statLabel: 'Պաշտոնական Երաշխիք',
  },
  {
    id: 2,
    badge: 'ԻՏԱԼԱԿԱՆ ՋԵՌՈՒՑՄԱՆ ՀԱՄԱԿԱՐԳԵՐ ԵՎ ԿԱԹՍԱՆԵՐ',
    badgeIcon: Flame,
    titlePrefix: 'ԲԱՁՐԱԿԱՐԳ BAXI ԿԱԹՍԱՆԵՐ ԵՎ VALTEC',
    titleHighlight: 'ՏԱՔ ՀԱՏԱԿ',
    description:
      '24 կՎտ կոնդենսացիոն կաթսաներ, PEX-A խողովակներ և լատունե կոլեկտորներ՝ անմիջական ցուցադրությամբ և առաքմամբ:',
    primaryCtaText: 'Ջեռուցման Տեսականի',
    primaryCtaLink: '/catalog',
    bgImage:
      'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1600&q=85',
    stat: '100% Իտալիա',
    statLabel: 'BAXI & VALTEC',
  },
  {
    id: 3,
    badge: 'ԳԵՍՍԻ ԵՎ ԴՈՌՆԲՐԱԽՏ ՍՏԱՆԴԱՐՏԻ ԾՈՐԱԿՆԵՐ',
    badgeIcon: Layers,
    titlePrefix: 'ՄԱՏ ՍԵՎ ԵՎ ՇԱՄՊԱՅՆ ԲՐՈՆԶ ԾՈՐԱԿՆԵՐ',
    titleHighlight: 'GESSI & GROHE',
    description:
      'Թերմոստատիկ ցնցուղային համակարգեր, նեոպերլ աերատորներ և sedal քարթրիջներ՝ անզուգական ճարտարապետական դիզայնով:',
    primaryCtaText: 'Բացահայտել Ծորակները',
    primaryCtaLink: '/catalog',
    bgImage:
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1600&q=85',
    stat: '750+ Կոդ',
    statLabel: 'ՀԾ ArmSoft Առկա',
  },
];

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[currentSlide];
  const BadgeIcon = slide.badgeIcon;

  return (
    <section className="space-y-6">
      {/* Architectural Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-[#111317] text-white min-h-[500px] sm:min-h-[560px] flex items-center p-8 sm:p-14 lg:p-18 border border-black/10 shadow-luxury">
        {/* Background photo with cross-fade transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.4, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
            className="absolute inset-0 bg-cover bg-center pointer-events-none"
            style={{ backgroundImage: `url(${slide.bgImage})` }}
          />
        </AnimatePresence>

        {/* Atmospheric Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#111317] via-[#111317]/80 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-radial from-[#C5A880]/15 via-[#111317]/50 to-[#111317] pointer-events-none" />

        {/* Slide Content */}
        <div className="relative z-10 max-w-3xl space-y-6">
          {/* Top trust pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-[#C5A880] border border-[#C5A880]/30 text-xs font-mono font-bold tracking-widest backdrop-blur-md uppercase">
            <BadgeIcon className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>{slide.badge}</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-[0.08em] leading-[1.12] text-white">
            {slide.titlePrefix}{' '}
            <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#C5A880] via-[#e2cdb4] to-white">
              {slide.titleHighlight}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-[#F7F5F0]/80 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl font-light">
            {slide.description}
          </p>

          {/* Actions */}
          <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link
              href={slide.primaryCtaLink}
              className="min-h-[50px] inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[#C5A880] hover:bg-white active:scale-98 text-[#111317] font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-luxury cursor-pointer"
            >
              <span>{slide.primaryCtaText}</span>
              <ArrowRight className="w-4 h-4 text-[#111317]" />
            </Link>

            <a
              href="https://maps.google.com/?q=Yerevan+Melkumovi+40/1"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[50px] inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs tracking-wider uppercase border border-white/15 transition-all cursor-pointer backdrop-blur-md"
            >
              <MapPin className="w-4 h-4 text-[#C5A880] shrink-0" />
              <span>Մելքումովի 40/1 Սրահ</span>
            </a>
          </div>
        </div>

        {/* Carousel controls & Stat badge */}
        <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 z-20 flex items-center gap-4">
          {/* Quick highlight badge */}
          <div className="hidden sm:block text-right bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 shadow-luxury">
            <span className="text-sm font-black text-[#C5A880] block tabular-nums tracking-wider">
              {slide.stat}
            </span>
            <span className="text-[9px] text-[#F7F5F0]/60 uppercase tracking-[0.2em] font-bold">
              {slide.statLabel}
            </span>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-luxury">
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
                    currentSlide === idx ? 'w-6 bg-[#C5A880]' : 'w-1.5 bg-white/30'
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

      {/* 4 Core Architectural Pillars Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1 */}
        <div className="bg-white rounded-2xl border border-[#111317]/[0.06] p-6 shadow-xs hover:shadow-luxury transition-all flex items-start gap-4 group">
          <div className="w-12 h-12 rounded-2xl bg-[#F7F5F0] text-[#C5A880] flex items-center justify-center shrink-0 border border-black/[0.04] group-hover:bg-[#111317] group-hover:text-[#C5A880] transition-colors">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-[#111317] uppercase tracking-wider">
              Ֆիզիկական Սրահ
            </h4>
            <p className="text-xs text-[#111317]/60 mt-1 font-medium">ք. Երևան, Մելքումովի 40/1</p>
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="bg-white rounded-2xl border border-[#111317]/[0.06] p-6 shadow-xs hover:shadow-luxury transition-all flex items-start gap-4 group">
          <div className="w-12 h-12 rounded-2xl bg-[#F7F5F0] text-emerald-700 flex items-center justify-center shrink-0 border border-black/[0.04] group-hover:bg-[#111317] group-hover:text-emerald-400 transition-colors">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-[#111317] uppercase tracking-wider">
              Մինչև 10 Տարի Երաշխիք
            </h4>
            <p className="text-xs text-[#111317]/60 mt-1 font-medium">Պաշտոնական սպասարկում</p>
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="bg-white rounded-2xl border border-[#111317]/[0.06] p-6 shadow-xs hover:shadow-luxury transition-all flex items-start gap-4 group">
          <div className="w-12 h-12 rounded-2xl bg-[#F7F5F0] text-[#111317] flex items-center justify-center shrink-0 border border-black/[0.04] group-hover:bg-[#111317] group-hover:text-[#C5A880] transition-colors">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-[#111317] uppercase tracking-wider">
              Արագ Առաքում
            </h4>
            <p className="text-xs text-[#111317]/60 mt-1 font-medium">Երևանում և բոլոր մարզերում</p>
          </div>
        </div>

        {/* Pillar 4 */}
        <div className="bg-white rounded-2xl border border-[#111317]/[0.06] p-6 shadow-xs hover:shadow-luxury transition-all flex items-start gap-4 group">
          <div className="w-12 h-12 rounded-2xl bg-[#F7F5F0] text-[#111317] flex items-center justify-center shrink-0 border border-black/[0.04] group-hover:bg-[#111317] group-hover:text-[#C5A880] transition-colors">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-[#111317] uppercase tracking-wider">
              B2B Հաշիվ-Ապրանքագիր
            </h4>
            <p className="text-xs text-[#111317]/60 mt-1 font-medium">ՀՎՀՀ-ով հաշիվներ վարպետներին</p>
          </div>
        </div>
      </div>
    </section>
  );
}
