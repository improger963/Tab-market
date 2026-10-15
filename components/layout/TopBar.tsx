/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import { MapPin, Clock, Phone, MessageCircle } from 'lucide-react';

export default function TopBar() {
  return (
    <div className="bg-[#F0EEE8] text-[#111317]/80 text-[11px] tracking-wider py-2 px-4 sm:px-6 border-b border-black/[0.04] transition-colors select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Showroom Location & Navigation */}
        <a
          href="https://maps.google.com/?q=Yerevan+Melkumovi+40/1"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[#111317] hover:text-[#C5A880] transition-colors group truncate font-medium"
        >
          <MapPin className="w-3.5 h-3.5 text-[#C5A880] shrink-0 group-hover:scale-110 transition-transform" />
          <span className="truncate">
            Երևան, <span className="font-bold">Մելքումովի 40/1 (Դավթաշեն / Աջափնյակ)</span>
          </span>
        </a>

        {/* Center: Live Working Hours Indicator */}
        <div className="hidden lg:flex items-center gap-2 bg-white/80 px-3.5 py-1 rounded-full border border-black/[0.04] shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Clock className="w-3.5 h-3.5 text-[#111317]/60 shrink-0" />
          <span className="text-[#111317] font-medium">
            Բաց է ամեն օր՝ <b className="font-bold">10:00 - 20:00</b>
          </span>
        </div>

        {/* Right: Phone Numbers & Direct Specialist Link */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-1.5 text-[#111317]">
            <Phone className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
            <a
              href="tel:095530435"
              className="hover:text-[#C5A880] font-bold transition-colors tabular-nums tracking-wider"
            >
              095 53-04-35
            </a>
          </div>

          <a
            href="https://wa.me/37495530435"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111317] hover:bg-[#C5A880] text-white hover:text-[#111317] font-semibold transition-all text-[10px] tracking-widest uppercase shadow-xs"
          >
            <MessageCircle className="w-3 h-3 shrink-0" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
