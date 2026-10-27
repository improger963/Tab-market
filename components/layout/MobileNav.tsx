/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Home, LayoutGrid, Package, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '@/store/useCart';
import { useWishlist } from '@/store/useWishlist';
import { useAuth } from '@/store/useAuth';

export default function MobileNav() {
  const { openDrawer, totalCount, isDrawerOpen } = useCart();
  const { totalCount: wishlistCount } = useWishlist();
  // The auth sheet is a bottom sheet: two fixed bottom layers would fight for
  // the same space, so the dock steps aside while it is open.
  const isAuthModalOpen = useAuth((state) => state.isAuthModalOpen);
  const [isMounted, setIsMounted] = useState(false);
  const [currentPath, setCurrentPath] = useState('/');

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname || '/');
      const handleLocationChange = () => {
        setCurrentPath(window.location.pathname || '/');
      };
      window.addEventListener('popstate', handleLocationChange);
      return () => window.removeEventListener('popstate', handleLocationChange);
    }
  }, []);

  const count = isMounted ? totalCount() : 0;
  const wishCount = isMounted ? wishlistCount() : 0;

  const isHome = currentPath === '/';
  const isCatalog = currentPath.startsWith('/catalog') || currentPath.startsWith('/category');
  const isTrack = currentPath.startsWith('/track-order');
  const isWishlist = currentPath.startsWith('/wishlist');

  // Stacking rule: never two fixed bottom bars at once. On the PDP the sticky buy
  // bar replaces the dock; on checkout, while the cart sheet is open and while the
  // auth sheet is open the dock hides.
  const isProduct = currentPath.startsWith('/product/');
  const isCheckout = currentPath.startsWith('/checkout');
  if (isMounted && (isProduct || isCheckout || isDrawerOpen || isAuthModalOpen)) return null;

  return (
    <nav
      aria-label="Մոբայլ նավիգացիա"
      className="md:hidden fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-dock max-w-lg mx-auto bg-ink/95 backdrop-blur-sm text-white rounded-panel border border-white/10 px-2 py-1 flex items-center justify-around shadow-e2"
    >
      {/* 1. Home */}
      <Link
        href="/"
        className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center transition-colors text-xs font-semibold gap-0.5 px-2 rounded-control ${
 isHome ? 'text-accent' : 'text-on-dark hover:text-white'
 }`}
      >
        <div className="relative">
          <Home className={`w-5 h-5 ${isHome ? 'text-accent' : 'text-on-dark'}`} />
          {isHome && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent" />
          )}
        </div>
        <span className={isHome ? 'font-bold text-white' : ''}>Գլխավոր</span>
      </Link>

      {/* 2. Catalog */}
      <Link
        href="/catalog"
        className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center transition-colors text-xs font-semibold gap-0.5 px-2 rounded-control ${
 isCatalog ? 'text-accent' : 'text-on-dark hover:text-white'
 }`}
      >
        <div className="relative">
          <LayoutGrid className={`w-5 h-5 ${isCatalog ? 'text-accent' : 'text-on-dark'}`} />
          {isCatalog && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent" />
          )}
        </div>
        <span className={isCatalog ? 'font-bold text-white' : ''}>Կատալոգ</span>
      </Link>

      {/* 3. Track Order */}
      <Link
        href="/track-order"
        className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center transition-colors text-xs font-semibold gap-0.5 px-2 rounded-control ${
 isTrack ? 'text-accent' : 'text-on-dark hover:text-white'
 }`}
      >
        <div className="relative">
          <Package className={`w-5 h-5 ${isTrack ? 'text-accent' : 'text-on-dark'}`} />
          {isTrack && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent" />
          )}
        </div>
        <span className={isTrack ? 'font-bold text-white' : ''}>Ստուգել</span>
      </Link>

      {/* 4. Wishlist */}
      <Link
        href="/wishlist"
        aria-label={`Սիրվածներ, ${wishCount} ապրանք`}
        className={`min-h-[48px] min-w-[48px] relative flex flex-col items-center justify-center transition-colors text-xs font-semibold gap-0.5 px-2 rounded-control cursor-pointer ${
 isWishlist ? 'text-accent' : 'text-on-dark hover:text-white'
 }`}
      >
        <div className="relative">
          <Heart className={`w-5 h-5 ${isWishlist ? 'fill-accent text-accent' : 'text-on-dark'}`} />
          {isMounted && wishCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-accent text-white text-caption font-bold w-4 h-4 rounded-full flex items-center justify-center tabular-nums leading-none shadow-e1">
              {wishCount > 99 ? '99+' : wishCount}
            </span>
          )}
        </div>
        <span className={isWishlist ? 'font-bold text-white' : ''}>Սիրված</span>
      </Link>

      {/* 5. Cart Trigger with live badge */}
      <button
        type="button"
        onClick={openDrawer}
        aria-label={`Զամբյուղ, ${count} ապրանք`}
        className="min-h-[48px] min-w-[48px] relative flex flex-col items-center justify-center text-on-dark hover:text-white transition-colors text-xs font-semibold gap-0.5 px-2 rounded-control cursor-pointer"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5 text-on-dark" />
          {isMounted && count > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-accent text-white text-caption font-bold w-4 h-4 rounded-full flex items-center justify-center tabular-nums leading-none shadow-e1">
              {count > 99 ? '99+' : count}
            </span>
          )}
        </div>
        <span>Զամբյուղ</span>
      </button>
    </nav>
  );
}
