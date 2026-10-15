'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Home, LayoutGrid, Heart, ShoppingBag, PhoneCall } from 'lucide-react';
import { useCart } from '@/store/useCart';
import { useWishlist } from '@/store/useWishlist';

export default function MobileNav() {
  const { openDrawer, totalCount } = useCart();
  const { totalCount: wishlistCount } = useWishlist();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const count = isMounted ? totalCount() : 0;
  const wishCount = isMounted ? wishlistCount() : 0;

  return (
    <nav
      aria-label="Մոբայլ նավիգացիա"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 px-1 py-1 flex items-center justify-around shadow-2xl safe-area-pb"
    >
      {/* 1. Home */}
      <Link
        href="/"
        className="min-h-[48px] min-w-[48px] flex flex-col items-center justify-center text-slate-600 hover:text-cyan-600 active:scale-95 transition-all text-[10px] font-semibold gap-0.5 px-2"
      >
        <Home className="w-5 h-5 text-slate-700" />
        <span>Գլխավոր</span>
      </Link>

      {/* 2. Catalog */}
      <Link
        href="/catalog"
        className="min-h-[48px] min-w-[48px] flex flex-col items-center justify-center text-slate-600 hover:text-cyan-600 active:scale-95 transition-all text-[10px] font-semibold gap-0.5 px-2"
      >
        <LayoutGrid className="w-5 h-5 text-slate-700" />
        <span>Կատալոգ</span>
      </Link>

      {/* 3. Wishlist */}
      <Link
        href="/wishlist"
        aria-label={`Սիրվածներ, ${wishCount} ապրանք`}
        className="min-h-[48px] min-w-[48px] relative flex flex-col items-center justify-center text-slate-600 hover:text-cyan-600 active:scale-95 transition-all text-[10px] font-semibold gap-0.5 px-2 cursor-pointer"
      >
        <div className="relative">
          <Heart className="w-5 h-5 text-slate-700" />
          {isMounted && wishCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center tabular-nums leading-none shadow-xs">
              {wishCount > 99 ? '99+' : wishCount}
            </span>
          )}
        </div>
        <span>Սիրված</span>
      </Link>

      {/* 4. Cart Trigger with live badge */}
      <button
        type="button"
        onClick={openDrawer}
        aria-label={`Զամբյուղ, ${count} ապրանք`}
        className="min-h-[48px] min-w-[48px] relative flex flex-col items-center justify-center text-slate-600 hover:text-cyan-600 active:scale-95 transition-all text-[10px] font-semibold gap-0.5 px-2 cursor-pointer"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5 text-slate-700" />
          {isMounted && count > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-cyan-600 text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center tabular-nums leading-none shadow-xs">
              {count > 99 ? '99+' : count}
            </span>
          )}
        </div>
        <span>Զամբյուղ</span>
      </button>

      {/* 5. Call Showroom */}
      <a
        href="tel:095530435"
        className="min-h-[48px] min-w-[48px] flex flex-col items-center justify-center text-cyan-700 active:scale-95 transition-all text-[10px] font-bold gap-0.5 px-2"
      >
        <div className="w-5 h-5 rounded-full bg-cyan-100 flex items-center justify-center">
          <PhoneCall className="w-3 h-3 text-cyan-700" />
        </div>
        <span>Զանգել</span>
      </a>
    </nav>
  );
}
