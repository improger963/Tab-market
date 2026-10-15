/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import { MapPin, Clock, Phone, MessageCircle } from 'lucide-react';

export default function TopBar() {
  return (
    <div className="bg-[#090D16] text-slate-300 text-xs py-2 px-3 sm:px-6 border-b border-white/[0.08] transition-colors select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Showroom Location & Navigation */}
        <a
          href="https://maps.google.com/?q=Yerevan+Melkumovi+40/1"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors group truncate"
        >
          <MapPin className="w-3.5 h-3.5 text-[#C5A880] shrink-0 group-hover:scale-110 transition-transform" />
          <span className="truncate">
            Երևան, <span className="text-white font-semibold">Մելքումովի 40/1 (Դավթաշեն / Աջափնյակ)</span>
          </span>
        </a>

        {/* Center: Live Working Hours Indicator */}
        <div className="hidden lg:flex items-center gap-2 bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.08]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-300 font-medium">
            Բաց է ամեն օր՝ <b className="text-white">10:00 - 20:00</b>
          </span>
        </div>

        {/* Right: Phone Numbers & Direct Specialist Link */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-slate-200">
            <Phone className="w-3 h-3 text-[#C5A880] shrink-0" />
            <a
              href="tel:095530435"
              className="hover:text-white font-bold transition-colors tabular-nums tracking-wide"
            >
              095 53-04-35
            </a>
          </div>

          <a
            href="https://wa.me/37495530435"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 font-semibold transition-all text-[11px]"
          >
            <MessageCircle className="w-3 h-3 fill-emerald-400 text-[#090D16] shrink-0" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
