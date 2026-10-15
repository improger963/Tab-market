'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Home, LayoutGrid, ShoppingBag, PhoneCall } from 'lucide-react';
import { useCart } from '@/store/useCart';

export default function MobileNav() {
  const { openDrawer, totalCount } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const count = isMounted ? totalCount() : 0;

  return (
    <nav
      aria-label="Մոբայլ նավիգացիա"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg safe-area-pb"
    >
      {/* 1. Home */}
      <Link
        href="/"
        className="min-h-[44px] min-w-[44px] flex flex-col items-center justify-center text-slate-600 hover:text-cyan-600 active:scale-95 transition-all text-[11px] font-semibold gap-1 px-2"
      >
        <Home className="w-5 h-5 text-slate-700" />
        <span>Գլխավոր</span>
      </Link>

      {/* 2. Catalog */}
      <Link
        href="/catalog"
        className="min-h-[44px] min-w-[44px] flex flex-col items-center justify-center text-slate-600 hover:text-cyan-600 active:scale-95 transition-all text-[11px] font-semibold gap-1 px-2"
      >
        <LayoutGrid className="w-5 h-5 text-slate-700" />
        <span>Կատալոգ</span>
      </Link>

      {/* 3. Cart Trigger with live badge */}
      <button
        type="button"
        onClick={openDrawer}
        aria-label={`Զամբյուղ, ${count} ապրանք`}
        className="min-h-[44px] min-w-[44px] relative flex flex-col items-center justify-center text-slate-600 hover:text-cyan-600 active:scale-95 transition-all text-[11px] font-semibold gap-1 px-2 cursor-pointer"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5 text-slate-700" />
          {isMounted && count > 0 && (
            <span className="absolute -top-1.5 -right-2.5 bg-cyan-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center tabular-nums leading-none shadow-xs">
              {count > 99 ? '99+' : count}
            </span>
          )}
        </div>
        <span>Զամբյուղ</span>
      </button>

      {/* 4. Call Showroom */}
      <a
        href="tel:095530435"
        className="min-h-[44px] min-w-[44px] flex flex-col items-center justify-center text-cyan-700 active:scale-95 transition-all text-[11px] font-bold gap-1 px-2"
      >
        <div className="w-5 h-5 rounded-full bg-cyan-100 flex items-center justify-center">
          <PhoneCall className="w-3.5 h-3.5 text-cyan-700" />
        </div>
        <span>Զանգել</span>
      </a>
    </nav>
  );
}
