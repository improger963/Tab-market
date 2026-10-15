import React from 'react';
import { MapPin, Clock, Phone, MessageCircle } from 'lucide-react';

export default function TopBar() {
  return (
    <div className="bg-slate-950 text-slate-300 text-xs py-2 px-4 border-b border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        {/* Left: Showroom Location */}
        <div className="flex items-center gap-2">
          <a
            href="https://maps.google.com/?q=Yerevan+Melkumovi+40/1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors font-medium group"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
            <span className="underline-offset-2 hover:underline">
              ք. Երևան, Մելքումովի 40/1 (Խանութ-սրահ)
            </span>
          </a>
        </div>

        {/* Center: Working Hours & Live Pulse Dot */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-300 font-medium tracking-tight">
            Երկ-Կիրակի՝ <span className="text-slate-100 font-semibold">09:00 - 19:00</span> (Բաց է)
          </span>
        </div>

        {/* Right: Phone numbers & WhatsApp CTA */}
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <div className="flex items-center gap-2 text-slate-300">
            <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <a
              href="tel:095530435"
              className="hover:text-white font-semibold transition-colors tabular-nums"
            >
              095 53-04-35
            </a>
            <span className="text-slate-700">/</span>
            <a
              href="tel:094530435"
              className="hover:text-white font-semibold transition-colors tabular-nums"
            >
              094 53-04-35
            </a>
          </div>

          <a
            href="https://wa.me/37495530435"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-semibold transition-all shadow-xs text-[11px]"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-emerald-400 text-slate-950 shrink-0" />
            <span>Հարցնել մասնագետին</span>
          </a>
        </div>
      </div>
    </div>
  );
}
