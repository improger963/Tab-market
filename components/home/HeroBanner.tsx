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
  Droplets,
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
    badge: 'Պաշտոնական Խանութ-Սրահ & ArmSoft Պահեստ Երևանում',
    badgeIcon: Sparkles,
    titlePrefix: 'Եվրոպական Ստանդարտի Սանտեխնիկա և Ծորակներ ',
    titleHighlight: 'Երևանում',
    description:
      'Բարձրակարգ ծորակներ, ցնցուղային թերմոստատիկ համակարգեր և կերամիկա՝ մինչև 10 տարի գործարանային երաշխիքով և անմիջապես Մելքումովի 40/1 սրահից։',
    primaryCtaText: 'Դիտել Կատալոգը',
    primaryCtaLink: '/catalog',
    bgImage:
      'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=1600&q=85',
    stat: '10+ Տարի',
    statLabel: 'Պաշտոնական Երաշխիք',
  },
  {
    id: 2,
    badge: 'Իտալական Ջեռուցման Տեխնիկա & Կաթսաներ',
    badgeIcon: Flame,
    titlePrefix: 'Իտալական BAXI Կաթսաներ և VALTEC Տաք Հատակ ',
    titleHighlight: 'Պահեստից',
    description:
      '24 կՎտ կոնդենսացիոն գազի կաթսաներ, PEX-A EVOH թթվածնային պատնեշով խողովակներ և լատունե կոլեկտորներ՝ անմիջական առկայությամբ:',
    primaryCtaText: 'Ջեռուցման Տեսականի',
    primaryCtaLink: '/catalog',
    bgImage:
      'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1600&q=85',
    stat: '100% Իտալիա',
    statLabel: 'BAXI & VALTEC Օրիգինալ',
  },
  {
    id: 3,
    badge: 'Շքեղ Լոգասենյակի Սանկերամիկա & Լոգարաններ',
    badgeIcon: Layers,
    titlePrefix: 'Անեզր Rimless Զուգարանակոնքեր և Առանձին Կանգնող ',
    titleHighlight: 'Լոգարաններ',
    description:
      'Tornado Rimless 360° հիգիենիկ լվացմամբ կախովի զուգարանակոնքեր, թաքնված ինստալյացիաներ և ակրիլային դիզայներական լոգարաններ:',
    primaryCtaText: 'Դիտել Սանկերամիկան',
    primaryCtaLink: '/catalog',
    bgImage:
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1600&q=85',
    stat: '400+ Կոդ',
    statLabel: 'ՀԾ ArmSoft Սինք',
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
      <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white min-h-[460px] sm:min-h-[500px] flex items-center p-8 sm:p-14 lg:p-16 border border-slate-800 shadow-2xl">
        {/* Background photo with cross-fade transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.35, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-cover bg-center pointer-events-none"
            style={{ backgroundImage: `url(${slide.bgImage})` }}
          />
        </AnimatePresence>

        {/* Ambient Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-radial from-cyan-900/20 via-slate-950/40 to-slate-950 pointer-events-none" />

        {/* Slide Content */}
        <div className="relative z-10 max-w-3xl space-y-6">
          {/* Top trust pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-bold tracking-wide backdrop-blur-md">
            <BadgeIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>{slide.badge}</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white">
            {slide.titlePrefix}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              {slide.titleHighlight}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl font-normal">
            {slide.description}
          </p>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            <Link
              href={slide.primaryCtaLink}
              className="min-h-[48px] inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 active:scale-98 text-slate-950 font-extrabold text-sm uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
            >
              <span>{slide.primaryCtaText}</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </Link>

            <a
              href="https://maps.google.com/?q=Yerevan+Melkumovi+40/1"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-sm border border-slate-700 hover:border-slate-600 transition-all cursor-pointer backdrop-blur-sm"
            >
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Այցելել Սրահ (Մելքումովի 40/1)</span>
            </a>
          </div>
        </div>

        {/* Carousel controls & Stat badge */}
        <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 z-20 flex items-center gap-4">
          {/* Quick highlight badge */}
          <div className="hidden sm:block text-right bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800 shadow-md">
            <span className="text-sm font-black text-cyan-400 block tabular-nums">
              {slide.stat}
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              {slide.statLabel}
            </span>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md p-1 rounded-2xl border border-slate-800 shadow-md">
            <button
              type="button"
              onClick={() =>
                setCurrentSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1))
              }
              aria-label="Նախորդ սլայդ"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex gap-1 px-1">
              {SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Սլայդ ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    currentSlide === idx ? 'w-5 bg-cyan-400' : 'w-1.5 bg-slate-700'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setCurrentSlide((prev) => (prev + 1) % SLIDES.length)}
              aria-label="Հաջորդ սլայդ"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Pillars Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition-shadow flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 border border-cyan-100">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Ֆիզիկական Սրահ
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">ք. Երևան, Մելքումովի 40/1 (Ամեն օր)</p>
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition-shadow flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Մինչև 10 Տարի Երաշխիք
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">Պաշտոնական գործարանային սպասարկում</p>
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition-shadow flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Արագ Առաքում
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">Երևանում և ՀՀ բոլոր մարզերում</p>
          </div>
        </div>

        {/* Pillar 4 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition-shadow flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 border border-slate-200">
            <Building2 className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              B2B Անկանխիկ Հաշիվ
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">ՀՎՀՀ-ով հաշիվ-ապրանքագիր վարպետներին</p>
          </div>
        </div>
      </div>
    </section>
  );
}
