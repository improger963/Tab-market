/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  MapPin,
  PackageOpen,
  Tag,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useCart } from '@/store/useCart';
import { useToast } from '@/store/useToast';
import { formatAMD, stockCap } from '@/lib/utils';
import { DELIVERY_CONFIG, SHOWROOM_INFO } from '@/lib/config';
import { HY } from '@/lib/copy/hy';
import { products } from '@/data/products';
import ProductImage from '@/components/ui/ProductImage';
import type { Product } from '@/types';

export default function CartDrawer() {
  const {
    items,
    addItem,
    isDrawerOpen,
    closeDrawer,
    removeItem,
    updateQuantity,
    totalPrice,
    totalCount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    getDiscountAmount,
    getFinalTotal,
  } = useCart();

  const { showToast, showCartToast } = useToast();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  // Direction of the latest stepper change per item, for smooth spring digit rolls
  const [qtyRoll, setQtyRoll] = useState<{ id: number; dir: 'up' | 'down' } | null>(null);

  const stepQuantity = (productId: number, nextQty: number, dir: 'up' | 'down') => {
    updateQuantity(productId, nextQty);
    setQtyRoll({ id: productId, dir });
  };

  // Prevent SSR hydration mismatch for localStorage persisted Zustand store
  const [isMounted, setIsMounted] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Reset pending digit-roll state whenever the drawer closes
  useEffect(() => {
    if (!isDrawerOpen) setQtyRoll(null);
  }, [isDrawerOpen]);

  // Lock body scroll and handle Escape key when drawer is open
  useEffect(() => {
    if (!isMounted) return;

    if (isDrawerOpen) {
      // Compensate for the removed vertical scrollbar so locking scroll causes no layout jump.
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
      closeBtnRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeDrawer();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        document.body.style.paddingRight = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '';
    }
  }, [isDrawerOpen, closeDrawer, isMounted]);

  if (!isMounted) return null;

  const count = totalCount();
  const subtotal = totalPrice();
  const discountAmount = getDiscountAmount();
  const finalTotal = getFinalTotal(0);

  // Suggestions come from the real assortment: showroom-available listings from
  // a section the cart already touches, deepest genuine price cut first. The
  // HEAD copy claimed "frequently bought together", which needs order
  // telemetry nobody has; the honest HEAD phrase for this block is "similar
  // products", so that is what the heading says.
  const cartProductIds = new Set(items.map((i) => i.product.id));
  const cartCategories = new Set(items.map((i) => i.product.categorySlug));
  const crossSellProducts = products
    .filter((p) => !cartProductIds.has(p.id) && p.inStock && cartCategories.has(p.categorySlug))
    .sort((a, b) => {
      const cut = (p: Product) =>
        p.oldPrice && p.oldPrice > p.price ? (p.oldPrice - p.price) / p.oldPrice : 0;
      return cut(b) - cut(a) || a.code.localeCompare(b.code);
    })
    .slice(0, 2);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const res = applyCoupon(couponInput);
    if (res.success) {
      showToast(res.message, 'Պրոմոկոդ');
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Գնումների զամբյուղ"
      className={`fixed inset-0 z-sheet overflow-hidden transition-[visibility] duration-sheet ${
 isDrawerOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
 }`}
    >
      {/* Dark backdrop with blur */}
      <div
        onClick={closeDrawer}
        aria-hidden="true"
        className={`fixed inset-0 bg-ink/70 backdrop-blur-sm transition-opacity duration-sheet ${
 isDrawerOpen ? 'opacity-100' : 'opacity-0'
 }`}
      />

      <div className="fixed inset-x-0 bottom-0 md:inset-y-0 md:left-auto md:right-0 max-w-full flex md:pl-10 justify-end items-end md:items-stretch">
        <div
          ref={drawerRef}
          className={`w-full md:w-screen md:max-w-md bg-surface shadow-e2 flex flex-col max-h-[92dvh] md:max-h-full h-auto md:h-full rounded-t-panel md:rounded-t-none md:border-l border-line transition-transform duration-sheet ease-precision ${
 isDrawerOpen
 ? 'translate-y-0 md:translate-x-0'
 : 'translate-y-full md:translate-y-0 md:translate-x-full'
 }`}
        >
          {/* Mobile pull handle */}
          <div className="md:hidden flex justify-center pt-2.5 pb-1 bg-ink rounded-t-panel">
            <div className="w-12 h-1.5 rounded-full bg-white/20" />
          </div>

          {/* Drawer Header: Deep Navy */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-ink text-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-control bg-white/10 text-white flex items-center justify-center border border-white/15">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight">Զամբյուղ</h3>
                <span className="text-xs text-on-dark-muted font-mono">
                  {count > 0 ? `${count} ապրանք պահեստից` : 'Դատարկ է'}
                </span>
              </div>
            </div>

            <button
              ref={closeBtnRef}
              type="button"
              onClick={closeDrawer}
              aria-label="Փակել զամբյուղը"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-on-dark-muted hover:text-white rounded-control hover:bg-white/10 transition-colors cursor-pointer btn-tactile"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 overscroll-contain">
            {items.length === 0 ? (
              /* Empty state */
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-16 h-16 rounded-panel bg-canvas flex items-center justify-center text-faint">
                  <PackageOpen className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-ink">
                    Ձեր զամբյուղը դեռ դատարկ է
                  </h4>
                  <p className="text-xs text-muted max-w-xs leading-relaxed">
                    Ավելացրեք ապրանքներ tab.am կատալոգից:
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="min-h-[44px] px-6 py-2.5 rounded-control bg-ink hover:bg-accent text-white text-xs font-bold transition-all shadow-e1 cursor-pointer btn-tactile"
                >
                  Անցնել Կատալոգ
                </button>
              </div>
            ) : (
              <>
                {/* Items list */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-3.5 rounded-panel border border-line bg-surface flex gap-3.5 shadow-e1 relative group hover:border-line-strong transition-all"
                    >
                      {/* Thumbnail */}
                      <ProductImage
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="w-18 h-18 rounded-control bg-canvas border border-line shrink-0"
                      />

                      {/* Body */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-mono text-xs font-bold text-muted bg-canvas px-1.5 py-0.5 rounded">
                              Կոդ: {item.product.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeItem(item.product.id)}
                              aria-label={`Հեռացնել ${item.product.title}`}
                              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-muted hover:text-danger transition-colors cursor-pointer rounded-card hover:bg-danger/10 btn-tactile"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <h4 className="font-bold text-xs text-ink line-clamp-2 mt-1 leading-snug">
                            {item.product.title}
                          </h4>
                        </div>

                        {/* Quantity controls and item subtotal */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center border border-line rounded-control bg-canvas p-0.5">
                            <button
                              type="button"
                              onClick={() => stepQuantity(item.product.id, item.quantity - 1, 'down')}
                              aria-label="Նվազեցնել քանակը"
                              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-muted hover:bg-surface rounded-card transition-colors cursor-pointer btn-tactile"
                            >
                              <Minus className="w-4 h-4" />
                            </button>

                            <span
                              key={`${item.product.id}-${item.quantity}-${qtyRoll?.id === item.product.id ? qtyRoll.dir : 'idle'}`}
                              className={`block w-8 text-center text-xs font-bold text-ink tabular-nums ${
 qtyRoll?.id === item.product.id
 ? qtyRoll.dir === 'up'
 ? 'animate-qty-roll-up'
 : 'animate-qty-roll-down'
 : ''
 }`}
                            >
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => stepQuantity(item.product.id, item.quantity + 1, 'up')}
                              disabled={item.quantity >= stockCap(item.product.stockQuantity)}
                              aria-label="Ավելացնել քանակը"
                              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-muted hover:bg-surface disabled:opacity-30 rounded-card transition-colors cursor-pointer btn-tactile"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="text-right">
                            <div className="text-xs font-bold text-ink tabular-nums">
                              {formatAMD(item.product.price * item.quantity)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Same-section suggestions, picked from real assortment data */}
                {crossSellProducts.length > 0 && (
                  <div className="pt-4 border-t border-line space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-ink ">
                      <Sparkles className="w-4 h-4 text-accent" />
                      <span>{HY.SIMILAR_PRODUCTS}</span>
                    </div>

                    <div className="space-y-2.5">
                      {crossSellProducts.map((crossSell) => (
                        <div
                          key={crossSell.id}
                          className="p-3 rounded-panel bg-canvas border border-line flex items-center justify-between gap-3 hover:border-line-strong transition-colors"
                        >
                          <ProductImage
                            src={crossSell.images[0]}
                            alt={crossSell.title}
                            className="w-11 h-11 rounded-control bg-surface border border-line shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold text-ink truncate">
                              {crossSell.title}
                            </h5>
                            <div className="text-xs font-semibold text-accent tabular-nums">
                              {formatAMD(crossSell.price)}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              addItem(crossSell, 1);
                              showCartToast(crossSell, 1);
                            }}
                            className="px-3 py-2 rounded-control bg-ink hover:bg-accent text-white text-xs font-bold shrink-0 transition-all cursor-pointer shadow-e1 flex items-center gap-1 btn-tactile"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Ավելացնել</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Drawer Footer with Safe Area */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] sm:pb-5 border-t border-line bg-canvas space-y-3.5 shrink-0">
              {/* Interactive Promo Code Form */}
              <div className="space-y-2">
                {!appliedCoupon ? (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-4 h-4 text-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value);
                          setCouponError(null);
                        }}
                        placeholder="Պրոմոկոդ"
                        className="w-full h-11 pl-10 pr-3 rounded-control bg-surface border border-line text-base md:text-xs font-bold uppercase placeholder:normal-case placeholder:font-normal focus:border-accent focus:ring-2 focus:ring-accent/20"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 min-h-[44px] rounded-control bg-ink hover:bg-accent text-white text-xs font-bold transition-all cursor-pointer btn-tactile"
                    >
                      Կիրառել
                    </button>
                  </form>
                ) : (
                  <div className="p-3 rounded-control bg-success/10 border border-success/30 flex items-center justify-between text-xs text-ink">
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                      <div className="truncate">
                        <span className="font-semibold uppercase">{appliedCoupon.code}</span>
                        <span className="text-xs text-success ml-1.5">
                          ({appliedCoupon.description})
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="min-h-[44px] px-2 text-xs text-danger hover:underline font-bold ml-2 shrink-0 cursor-pointer flex items-center btn-tactile"
                    >
                      Հեռացնել
                    </button>
                  </div>
                )}

                {couponError && (
                  <p className="text-xs text-danger flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{couponError}</span>
                  </p>
                )}
              </div>

              {/* Showroom pickup badge */}
              <div className="flex items-center gap-2 p-2.5 rounded-control bg-accent/5 border border-accent/20 text-ink text-xs">
                <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
                <span className="font-semibold">
                  Անվճար ստացում {SHOWROOM_INFO.address} սրահից
                </span>
              </div>

              {/* Pricing breakdown */}
              <div className="space-y-1.5 text-xs text-muted">
                <div className="flex justify-between">
                  <span>Միջանկյալ գումար՝</span>
                  <span className="font-semibold text-ink tabular-nums">
                    {formatAMD(subtotal)}
                  </span>
                </div>

                {appliedCoupon && discountAmount > 0 && (
                  <div className="flex justify-between text-success font-bold">
                    <span>Զեղչ ({appliedCoupon.code})՝</span>
                    <span className="tabular-nums">-{formatAMD(discountAmount)}</span>
                  </div>
                )}

                {DELIVERY_CONFIG.yerevanFreeAlways && (
                <div className="flex justify-between">
                  <span>Առաքում (Երևան)՝</span>
                  <span className="font-semibold text-success">Անվճար</span>
                </div>
                )}

                <div className="flex justify-between text-sm pt-2 border-t border-line font-bold text-ink">
                  <span>Ընդամենը՝</span>
                  <span className="text-xl font-bold text-ink tabular-nums">
                    {formatAMD(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Checkout CTA: Deep Navy / Royal Blue */}
              <Link
                href="/checkout"
                onClick={closeDrawer}
                className="min-h-[50px] w-full flex items-center justify-center gap-2 px-5 py-3 rounded-panel bg-ink hover:bg-accent text-white text-sm font-semibold transition-colors duration-hover shadow-e2 cursor-pointer btn-tactile"
              >
                <span>Ձևակերպել Պատվերը</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Link>

              <div className="flex items-center justify-between text-xs text-muted">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-accent" />
                  {SHOWROOM_INFO.address}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}