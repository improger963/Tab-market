/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import { MapPin, Clock, Phone, MessageCircle, Truck } from 'lucide-react';

export default function TopBar() {
  return (
    <div className="bg-[#0B192C] text-slate-200 text-xs py-2 px-3 sm:px-6 border-b border-slate-800 transition-colors select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Free delivery highlight */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-600/20 text-blue-300 border border-blue-400/30 text-[11px] font-extrabold tracking-wide">
            <Truck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>🚚 Անվճար Առաքում Երևանի Ողջ Տարածքում</span>
          </span>
        </div>

        {/* Center: Showroom Location & Working Hours */}
        <div className="hidden lg:flex items-center gap-4 text-[11px] text-slate-300 font-medium">
          <a
            href="https://maps.google.com/?q=Yerevan+Melkumovi+40/1"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>ք. Երևան, Մելքումովի 40/1</span>
          </a>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Երկ-Կիրակի՝ 10:00 - 20:00</span>
          </div>
        </div>

        {/* Right: Phone & WhatsApp */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="tel:095530435"
            className="inline-flex items-center gap-1.5 min-h-[36px] px-2.5 py-1 rounded-lg text-white hover:text-blue-300 font-bold transition-colors tabular-nums tracking-wider text-xs"
            title="Զանգահարել 095 53-04-35"
          >
            <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>095 53-04-35</span>
          </a>

          <a
            href="https://wa.me/37495530435"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all text-[11px] tracking-wide shadow-xs min-h-[32px]"
          >
            <MessageCircle className="w-3.5 h-3.5 shrink-0" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
