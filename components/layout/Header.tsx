/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  LayoutGrid,
  Heart,
  ArrowLeftRight,
  Droplets,
  ShowerHead,
  Box,
  CircleDot,
  Archive,
  Sparkles,
  Flame,
  Grid,
  Layers,
  Filter,
  ChevronDown,
  Package,
  Search,
  X,
} from 'lucide-react';
import { useCart } from '@/store/useCart';
import { useWishlist } from '@/store/useWishlist';
import { useCompare } from '@/store/useCompare';
import { categories } from '@/data/categories';
import { formatAMD } from '@/lib/utils';
import LiveSearch from './LiveSearch';

export default function Header() {
  const { openDrawer, totalCount, totalPrice } = useCart();
  const { totalCount: wishlistCount } = useWishlist();
  const { totalCount: compareCount } = useCompare();
  const [isMounted, setIsMounted] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isCartBumping, setIsCartBumping] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const count = isMounted ? totalCount() : 0;
  const prevCountRef = useRef(count);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Trigger bouncy cart badge when item count increases
  useEffect(() => {
    if (count > prevCountRef.current) {
      setIsCartBumping(true);
      const timer = setTimeout(() => setIsCartBumping(false), 400);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = count;
  }, [count]);

  // Close megamenu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMegaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile search on Escape
  useEffect(() => {
    if (!isMobileSearchOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileSearchOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileSearchOpen]);

  const price = isMounted ? totalPrice() : 0;
  const wishCount = isMounted ? wishlistCount() : 0;
  const compCount = isMounted ? compareCount() : 0;

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Droplets':
        return <Droplets className="w-4 h-4 text-accent shrink-0" />;
      case 'ShowerHead':
        return <ShowerHead className="w-4 h-4 text-accent shrink-0" />;
      case 'Box':
        return <Box className="w-4 h-4 text-accent shrink-0" />;
      case 'CircleDot':
        return <CircleDot className="w-4 h-4 text-accent shrink-0" />;
      case 'Archive':
        return <Archive className="w-4 h-4 text-accent shrink-0" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-accent shrink-0" />;
      case 'Flame':
        return <Flame className="w-4 h-4 text-accent shrink-0" />;
      case 'Grid':
        return <Grid className="w-4 h-4 text-accent shrink-0" />;
      case 'Layers':
        return <Layers className="w-4 h-4 text-accent shrink-0" />;
      case 'Filter':
        return <Filter className="w-4 h-4 text-accent shrink-0" />;
      default:
        return <Droplets className="w-4 h-4 text-accent shrink-0" />;
    }
  };

  return (
    <header className="sticky top-0 z-header bg-surface/90 backdrop-blur-sm border-b border-line shadow-e1">
      <div className="container-lux h-[var(--header-h)] flex items-center justify-between gap-3 sm:gap-6">
        {/* Brand Logo & Catalog Mega-Menu Dropdown */}
        <div className="flex items-center gap-3 md:gap-4 shrink-0" ref={menuRef}>
          <Link
            href="/"
            className="flex flex-col group cursor-pointer focus:outline-hidden"
            aria-label="tab.am Գլխավոր էջ"
          >
            <div className="flex items-center gap-1">
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-ink group-hover:text-accent transition-colors">
                TAB<span className="text-accent">.AM</span>
              </span>
            </div>
            <span className="text-xs font-semibold text-muted -mt-1 group-hover:text-ink transition-colors hidden sm:block">
              ՍԱՆՏԵԽՆԻԿԱՅԻ ԽԱՆՈՒԹ-ՍՐԱՀ
            </span>
          </Link>

          {/* Catalog Button / Mega-Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
              className="hidden sm:inline-flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-control bg-ink hover:bg-accent text-white text-xs font-bold transition-colors shadow-e1 cursor-pointer btn-tactile focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              <LayoutGrid className="w-4 h-4 text-white" />
              <span className="hidden md:inline">Կատալոգ</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-on-dark transition-transform duration-200 ${
 isMegaMenuOpen ? 'rotate-180' : ''
 }`}
              />
            </button>

            {/* Mega Menu Dropdown */}
            {isMegaMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-[90vw] max-w-[700px] bg-surface/95 backdrop-blur-sm rounded-panel shadow-e2 border border-line p-6 z-overlay animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-line">
                  <div>
                    <h3 className="text-sm font-bold text-ink">
                      tab.am {categories.length} Կորային Բաժիններ
                    </h3>
                    <p className="text-xs text-muted">
                      Ընտրեք սանտեխնիկայի և ջրամատակարարման պահանջվող բաժինը
                    </p>
                  </div>
                  <Link
                    href="/catalog"
                    onClick={() => setIsMegaMenuOpen(false)}
                    className="text-xs font-bold text-accent hover:text-accent-hover"
                  >
                    Ամբողջ կատալոգը →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[60dvh] overflow-y-auto">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="flex items-center justify-between p-3 rounded-control bg-canvas hover:bg-line/60 border border-line hover:border-line-strong transition-colors group btn-tactile"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-card bg-surface shadow-e1 flex items-center justify-center border border-line group-hover:scale-110 transition-transform">
                          {getCategoryIcon(cat.icon)}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-ink group-hover:text-accent block transition-colors">
                            {cat.title}
                          </span>
                          <span className="text-xs text-faint font-medium">
                            {cat.itemCount}+ ապրանք
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-faint group-hover:text-accent group-hover:translate-x-0.5 transition-colors">
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Live Predictive Search (Tablet & Desktop >= 768px) */}
        <div className="flex-1 max-w-xl mx-auto hidden md:block">
          <LiveSearch />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Mobile Search Icon Trigger (< 768px) */}
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(true)}
            aria-label="Որոնել ապրանխ կամ կոդ"
            className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-control bg-canvas hover:bg-line/60 border border-line text-body transition-colors cursor-pointer btn-tactile"
          >
            <Search className="w-5 h-5 text-muted" />
          </button>

          {/* Compare shortcut (visible on tablet+) */}
          <Link
            href="/compare"
            title="Ապրանքների Համեմատում"
            className="hidden sm:flex min-h-[44px] min-w-[44px] relative items-center justify-center rounded-control bg-surface hover:bg-canvas border border-line text-body hover:text-ink transition-colors cursor-pointer btn-tactile"
          >
            <ArrowLeftRight className="w-4 h-4" />
            {compCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none shadow-e1">
                {compCount}
              </span>
            )}
          </Link>

          {/* Wishlist shortcut (visible on tablet+) */}
          <Link
            href="/wishlist"
            title="Սիրված Ապրանքներ"
            className="hidden sm:flex min-h-[44px] min-w-[44px] relative items-center justify-center rounded-control bg-surface hover:bg-canvas border border-line text-body hover:text-accent transition-colors cursor-pointer btn-tactile"
          >
            <Heart className="w-4 h-4 text-accent" />
            {wishCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none shadow-e1 animate-heart-pop">
                {wishCount}
              </span>
            )}
          </Link>

          {/* Track Order Shortcut (Desktop) — light text link */}
          <Link
            href="/track-order"
            title="Ստուգել Պատվերի Կարգավիճակը"
            className="hidden lg:inline-flex items-center gap-1.5 min-h-[44px] px-2 text-xs font-semibold text-muted hover:text-accent transition-colors"
          >
            <Package className="w-4 h-4" />
            <span>Ստուգել Պատվերը</span>
          </Link>

          {/* Showroom phone lives in TopBar; duplicate removed here */}

          {/* Cart Trigger Button with Bouncy Badge */}
          <button
            type="button"
            onClick={openDrawer}
            aria-label={`Գնումների զամբյուղ, ${count} ապրանք`}
            className={`min-h-[44px] min-w-[44px] relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-control bg-ink hover:bg-accent text-white font-medium text-xs transition-colors shadow-e1 cursor-pointer btn-tactile ${
 isCartBumping ? 'scale-105' : ''
 }`}
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 text-white" />
              {count > 0 && (
                <span
                  className={`absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none shadow-e1 transition-transform duration-300 ${
 isCartBumping ? 'scale-125' : 'scale-100'
 }`}
                >
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </div>

            <span className="hidden sm:inline font-bold">Զամբյուղ</span>

            {price > 0 && (
              <span className="hidden md:inline font-bold text-on-dark border-l border-white/10 pl-2 tabular-nums">
                {formatAMD(price)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Fullscreen Search Overlay Modal */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-overlay h-dvh bg-ink/80 backdrop-blur-sm flex flex-col p-4 pt-[calc(1rem+env(safe-area-inset-top))] animate-in fade-in duration-200">
          <div className="bg-surface rounded-panel shadow-e2 border border-line p-4 space-y-4 max-w-lg mx-auto w-full overflow-y-auto overscroll-contain">
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold text-ink">Որոնել ապրանք կամ կոդ</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-card text-faint hover:text-ink hover:bg-canvas btn-tactile"
                aria-label="Փակել որոնումը"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <LiveSearch
              autoFocus={true}
              isOverlayMode={true}
              onSelect={() => setIsMobileSearchOpen(false)}
            />
          </div>
        </div>
      )}
    </header>
  );
}
