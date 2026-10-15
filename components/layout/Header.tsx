'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, LayoutGrid, Phone, MapPin } from 'lucide-react';
import { useCart } from '@/store/useCart';
import { formatAMD } from '@/lib/utils';
import LiveSearch from './LiveSearch';

export default function Header() {
  const { openDrawer, totalCount, totalPrice } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const count = isMounted ? totalCount() : 0;
  const price = isMounted ? totalPrice() : 0;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3 sm:gap-6">
        {/* Brand Logo & Catalog Button */}
        <div className="flex items-center gap-3 md:gap-5 shrink-0">
          <Link
            href="/"
            className="flex flex-col group cursor-pointer focus:outline-hidden"
            aria-label="tab.am Գլխավոր էջ"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 group-hover:text-cyan-600 transition-colors">
                TAB<span className="text-cyan-600">.AM</span>
              </span>
              <span className="hidden xl:inline-block text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-widest">
                ERP
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider -mt-1 group-hover:text-slate-700 transition-colors">
              ՍԱՆՏԵԽՆԻԿԱ & ՋԵՌՈՒՑՈՒՄ
            </span>
          </Link>

          {/* Catalog Link Button */}
          <Link
            href="/catalog"
            className="hidden sm:inline-flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-bold transition-all border border-slate-200/60 cursor-pointer active:scale-95"
          >
            <LayoutGrid className="w-4 h-4 text-cyan-600" />
            <span>Կատալոգ</span>
          </Link>
        </div>

        {/* Center: Live Predictive Search */}
        <div className="flex-1 max-w-xl mx-auto hidden md:block">
          <LiveSearch />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Showroom shortcut */}
          <a
            href="tel:095530435"
            className="hidden lg:flex items-center gap-2 min-h-[44px] px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
            title="Զանգահարել Մելքումովի 40/1 սրահ"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center border border-cyan-100">
              <Phone className="w-4 h-4" />
            </div>
            <div className="text-left leading-tight">
              <span className="block text-[10px] text-slate-400 font-medium">Խորհրդատվություն</span>
              <span className="tabular-nums font-bold text-slate-900">095 53-04-35</span>
            </div>
          </a>

          {/* Cart Trigger Button */}
          <button
            type="button"
            onClick={openDrawer}
            aria-label={`Գնումների զամբյուղ, ${count} ապրանք`}
            className="min-h-[44px] min-w-[44px] relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-medium text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 text-cyan-400" />
              {isMounted && count > 0 && (
                <span className="absolute -top-2 -right-2 bg-cyan-500 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </div>

            <span className="hidden sm:inline font-bold">Զամբյուղ</span>

            {isMounted && price > 0 && (
              <span className="hidden md:inline font-bold text-cyan-300 border-l border-slate-800 pl-2 tabular-nums">
                {formatAMD(price)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile LiveSearch under header */}
      <div className="md:hidden px-4 pb-3">
        <LiveSearch />
      </div>
    </header>
  );
}
