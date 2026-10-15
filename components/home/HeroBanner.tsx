'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  MapPin,
  ShieldCheck,
  Truck,
  Building2,
  Sparkles,
  Layers,
} from 'lucide-react';

export default function HeroBanner() {
  return (
    <section className="space-y-6">
      {/* Architectural Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white p-8 sm:p-14 lg:p-16 border border-slate-800 shadow-2xl">
        {/* Subtle background glow effects & grid overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/40 via-slate-950 to-slate-950 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          {/* Top trust pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-bold tracking-wide backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Պաշտոնական Խանութ-Սրահ & ArmSoft Պահեստ Երևանում</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white">
            Եվրոպական Ստանդարտի Սանտեխնիկա և Ջեռուցում{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              Երևանում
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl font-normal">
            Բարձրակարգ ծորակներ, ցնցուղային համակարգեր և կերամիկա՝ պաշտոնական երաշխիքով և
            անմիջապես <b>Մելքումովի 40/1</b> սրահից։
          </p>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            <Link
              href="/catalog"
              className="min-h-[48px] inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 active:scale-98 text-slate-950 font-extrabold text-sm uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
            >
              <span>Դիտել Կատալոգը</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </Link>

            <a
              href="https://maps.google.com/?q=Yerevan+Melkumovi+40/1"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-sm border border-slate-700 hover:border-slate-600 transition-all cursor-pointer backdrop-blur-sm"
            >
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Այցելել Խանութ-Սրահ (Մելքումովի 40/1)</span>
            </a>
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
