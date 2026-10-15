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
  Phone,
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
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const count = isMounted ? totalCount() : 0;
  const price = isMounted ? totalPrice() : 0;
  const wishCount = isMounted ? wishlistCount() : 0;
  const compCount = isMounted ? compareCount() : 0;

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Droplets':
        return <Droplets className="w-4 h-4 text-blue-600 shrink-0" />;
      case 'ShowerHead':
        return <ShowerHead className="w-4 h-4 text-blue-600 shrink-0" />;
      case 'Box':
        return <Box className="w-4 h-4 text-blue-600 shrink-0" />;
      case 'CircleDot':
        return <CircleDot className="w-4 h-4 text-blue-600 shrink-0" />;
      case 'Archive':
        return <Archive className="w-4 h-4 text-blue-600 shrink-0" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />;
      case 'Flame':
        return <Flame className="w-4 h-4 text-blue-600 shrink-0" />;
      case 'Grid':
        return <Grid className="w-4 h-4 text-blue-600 shrink-0" />;
      case 'Layers':
        return <Layers className="w-4 h-4 text-blue-600 shrink-0" />;
      case 'Filter':
        return <Filter className="w-4 h-4 text-blue-600 shrink-0" />;
      default:
        return <Droplets className="w-4 h-4 text-blue-600 shrink-0" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[60px] md:h-16 flex items-center justify-between gap-3 sm:gap-6">
        {/* Brand Logo & Catalog Mega-Menu Dropdown */}
        <div className="flex items-center gap-3 md:gap-4 shrink-0" ref={menuRef}>
          <Link
            href="/"
            className="flex flex-col group cursor-pointer focus:outline-hidden"
            aria-label="tab.am Գլխավոր էջ"
          >
            <div className="flex items-center gap-1">
              <span className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-[#0F172A] group-hover:text-blue-600 transition-colors">
                TAB<span className="text-blue-600">.AM</span>
              </span>
              <span className="hidden xl:inline-block text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-[#0F172A] border border-slate-200 uppercase tracking-widest">
                ERP
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider -mt-1 group-hover:text-slate-700 transition-colors hidden xs:block">
              ՍԱՆՏԵԽՆԻԿԱՅԻ ԽԱՆՈՒԹ-ՍՐԱՀ
            </span>
          </Link>

          {/* Catalog Button / Mega-Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
              className="hidden sm:inline-flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E3A8A] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <LayoutGrid className="w-4 h-4 text-blue-400" />
              <span className="hidden md:inline">Կատալոգ</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-300 transition-transform duration-200 ${
                  isMegaMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Mega Menu Dropdown */}
            {isMegaMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-[90vw] max-w-[700px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-wider">
                      tab.am 10 Կորային Բաժիններ
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Ընտրեք սանտեխնիկայի և ջրամատակարարման պահանջվող բաժինը
                    </p>
                  </div>
                  <Link
                    href="/catalog"
                    onClick={() => setIsMegaMenuOpen(false)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    Ամբողջ կատալոգը →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[60vh] overflow-y-auto">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 hover:border-blue-300 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white shadow-xs flex items-center justify-center border border-slate-200 group-hover:scale-110 transition-transform">
                          {getCategoryIcon(cat.icon)}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[#0F172A] group-hover:text-blue-600 block transition-colors">
                            {cat.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {cat.itemCount}+ ապրանք
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all">
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
            aria-label="Որոնել ըստ ՀԾ կոդի"
            className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 active:scale-95 transition-all cursor-pointer"
          >
            <Search className="w-5 h-5 text-slate-600" />
          </button>

          {/* Compare shortcut (visible on tablet+) */}
          <Link
            href="/compare"
            title="Ապրանքների Համեմատում"
            className="hidden sm:flex min-h-[44px] min-w-[44px] relative items-center justify-center rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-[#0F172A] transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4" />
            {compCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#2563EB] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {compCount}
              </span>
            )}
          </Link>

          {/* Wishlist shortcut (visible on tablet+) */}
          <Link
            href="/wishlist"
            title="Սիրված Ապրանքներ"
            className="hidden sm:flex min-h-[44px] min-w-[44px] relative items-center justify-center rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <Heart className="w-4 h-4 text-rose-500" />
            {wishCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {wishCount}
              </span>
            )}
          </Link>

          {/* Track Order Shortcut (Desktop) */}
          <Link
            href="/track-order"
            title="Ստուգել Պատվերի Կարգավիճակը"
            className="hidden lg:inline-flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#0F172A] text-xs font-bold transition-all cursor-pointer"
          >
            <Package className="w-4 h-4 text-blue-600" />
            <span>Ստուգել Պատվերը</span>
          </Link>

          {/* Showroom Phone shortcut (Desktop) */}
          <a
            href="tel:095530435"
            className="hidden xl:flex items-center gap-2 min-h-[44px] px-3 py-1.5 rounded-xl text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
            title="Զանգահարել Մելքումովի 40/1 սրահ"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Phone className="w-4 h-4" />
            </div>
            <div className="text-left leading-tight">
              <span className="block text-[10px] text-slate-400 font-medium">Խորհրդատվություն</span>
              <span className="tabular-nums font-bold text-[#0F172A]">095 53-04-35</span>
            </div>
          </a>

          {/* Cart Trigger Button */}
          <button
            type="button"
            onClick={openDrawer}
            aria-label={`Գնումների զամբյուղ, ${count} ապրանք`}
            className="min-h-[44px] min-w-[44px] relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E3A8A] text-white font-medium text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 text-blue-400" />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#2563EB] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </div>

            <span className="hidden sm:inline font-bold">Զամբյուղ</span>

            {price > 0 && (
              <span className="hidden md:inline font-bold text-blue-300 border-l border-slate-700 pl-2 tabular-nums">
                {formatAMD(price)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Fullscreen Search Overlay Modal */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/80 backdrop-blur-md flex flex-col p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 space-y-4 max-w-lg mx-auto w-full">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-[#0F172A]">Որոնում ըստ ՀԾ Կոդի</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(false)}
                className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
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
