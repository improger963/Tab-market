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
  Truck,
  Sparkles,
} from 'lucide-react';
import { useCart } from '@/store/useCart';
import { useToast } from '@/store/useToast';
import { formatAMD } from '@/lib/utils';
import { products } from '@/data/products';
import type { Product } from '@/types';

/* Installation essentials pushed as 1-click cross-sell when a faucet or vanity is in the cart. */
const INSTALL_ESSENTIALS: Product[] = [
  {
    id: -1001,
    code: '90001',
    title: 'Ճկուն խողովակներ 45սմ (զույգ)',
    slug: 'flexible-hoses-45cm-pair',
    categorySlug: 'accessories',
    categoryName: 'Լոգարանի Աքսեսուարներ',
    brand: 'ACCOONA',
    price: 2500,
    inStock: true,
    stockQuantity: 50,
    images: [
      'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=400&q=80',
    ],
    shortDesc: 'Արագ միացման երկու ճկուն խողովակ՝ 45սմ, ծորակների և սիֆոնների տեղադրման համար:',
    specs: {
      'Երկարություն': '45 սմ',
      'Միացում': '1/2"',
      'Հավաքածու': '2 հատ (զույգ)',
    },
  },
  {
    id: -1002,
    code: '90002',
    title: 'Լատունե սիֆոն 1 1/4"',
    slug: 'brass-siphon-1-1-4',
    categorySlug: 'accessories',
    categoryName: 'Լոգարանի Աքսեսուարներ',
    brand: 'ACCOONA',
    price: 4000,
    inStock: true,
    stockQuantity: 40,
    images: [
      'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=400&q=80',
    ],
    shortDesc: 'Լատունե ծորած սիֆոն 1 1/4" լվացարանների համար՝ հերմետիկ անվամբ:',
    specs: {
      'Տրամերսը': '1 1/4"',
      'Նյութ': 'Լատուն',
      'Հավաքածու': 'Անվ + խողովակ',
    },
  },
];

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
      document.body.style.overflow = 'hidden';
      closeBtnRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeDrawer();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isDrawerOpen, closeDrawer, isMounted]);

  if (!isMounted) return null;

  const count = totalCount();
  const subtotal = totalPrice();
  const discountAmount = getDiscountAmount();
  const finalTotal = getFinalTotal(0);

  // Free delivery threshold in Yerevan: 50,000 AMD
  const freeDeliveryThreshold = 50000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));
  const remainingForFree = Math.max(0, freeDeliveryThreshold - subtotal);

  // Frequently bought together: faucet/vanity in cart → push 1-click installation essentials,
  // otherwise suggest complementary featured items not already in the cart.
  const cartProductIds = new Set(items.map((i) => i.product.id));
  const hasFaucetOrVanity = items.some(
    (i) => i.product.categorySlug === 'faucets' || i.product.categorySlug === 'cabinets'
  );
  const essentialPair = INSTALL_ESSENTIALS.filter((e) => !cartProductIds.has(e.id));
  const genericCrossSell = products
    .filter((p) => !cartProductIds.has(p.id) && p.isFeatured)
    .slice(0, 2);
  const crossSellProducts =
    hasFaucetOrVanity && essentialPair.length > 0 ? essentialPair : genericCrossSell;

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
      className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ${
        isDrawerOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
      }`}
    >
      {/* Dark backdrop with blur */}
      <div
        onClick={closeDrawer}
        aria-hidden="true"
        className={`fixed inset-0 bg-[#0F172A]/70 backdrop-blur-sm transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div className="fixed inset-x-0 bottom-0 md:inset-y-0 md:left-auto md:right-0 max-w-full flex md:pl-10 justify-end items-end md:items-stretch">
        <div
          ref={drawerRef}
          className={`w-full md:w-screen md:max-w-md bg-white shadow-2xl flex flex-col max-h-[92vh] md:max-h-full h-auto md:h-full rounded-t-3xl md:rounded-t-none md:border-l border-[#E2E8F0] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isDrawerOpen
              ? 'translate-y-0 md:translate-x-0'
              : 'translate-y-full md:translate-y-0 md:translate-x-full'
          }`}
        >
          {/* Mobile pull handle */}
          <div className="md:hidden flex justify-center pt-2.5 pb-1 bg-[#0F172A] rounded-t-3xl">
            <div className="w-12 h-1.5 rounded-full bg-slate-700" />
          </div>

          {/* Drawer Header: Deep Navy */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#0F172A] text-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight">Զամբյուղ</h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  {count > 0 ? `${count} ապրանք ՀԾ պահեստից` : 'Դատարկ է'}
                </span>
              </div>
            </div>

            <button
              ref={closeBtnRef}
              type="button"
              onClick={closeDrawer}
              aria-label="Փակել զամբյուղը"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer btn-tactile"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Yerevan Delivery Progress Meter */}
          {items.length > 0 && (
            <div className="bg-blue-50 border-b border-blue-100 p-3 px-5 text-xs text-blue-950 shrink-0 space-y-1.5">
              <div className="flex items-center justify-between font-semibold">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-blue-600 animate-pulse" />
                  {subtotal >= freeDeliveryThreshold ? (
                    <span className="text-emerald-700 font-bold">Անվճար առաքումը Երևանում ակտիվ է! 🚚</span>
                  ) : (
                    <span>Անվճար առաքում Երևանում</span>
                  )}
                </span>
                <span className="font-mono text-[11px]">
                  {subtotal >= freeDeliveryThreshold ? '100%' : `${progressPercent}%`}
                </span>
              </div>

              {subtotal < freeDeliveryThreshold && (
                <p className="text-[11px] text-slate-600">
                  Ավելացրեք ևս <b className="text-blue-700">{formatAMD(remainingForFree)}</b> արժողությամբ ապրանք անվճար առաքման համար:
                </p>
              )}

              <div className="w-full h-2 rounded-full bg-blue-200/60 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Drawer Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              /* Empty state */
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 shadow-inner">
                  <PackageOpen className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-[#0F172A]">
                    Ձեր զամբյուղը դեռ դատարկ է
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                    Ավելացրեք ապրանքներ tab.am կատալոգից կամ որոնեք ՀԾ արտիկուլներով:
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#2563EB] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer btn-tactile shimmer-glint"
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
                      className="p-3.5 rounded-2xl border border-[#E2E8F0] bg-white flex gap-3.5 shadow-2xs relative group hover:border-slate-300 transition-all"
                    >
                      {/* Thumbnail */}
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="w-18 h-18 rounded-xl object-cover bg-[#F8FAFC] border border-slate-200 shrink-0"
                      />

                      {/* Body */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              Կոդ: {item.product.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeItem(item.product.id)}
                              aria-label={`Հեռացնել ${item.product.title}`}
                              className="min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors cursor-pointer rounded-lg hover:bg-rose-50 btn-tactile"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <h4 className="font-bold text-xs text-[#0F172A] line-clamp-2 mt-1 leading-snug">
                            {item.product.title}
                          </h4>
                        </div>

                        {/* Quantity controls and item subtotal */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center border border-[#E2E8F0] rounded-xl bg-[#F8FAFC] p-0.5">
                            <button
                              type="button"
                              onClick={() => stepQuantity(item.product.id, item.quantity - 1, 'down')}
                              aria-label="Նվազեցնել քանակը"
                              className="min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-600 hover:bg-white rounded-lg transition-colors cursor-pointer btn-tactile"
                            >
                              <Minus className="w-4 h-4" />
                            </button>

                            <span
                              key={`${item.product.id}-${item.quantity}-${qtyRoll?.id === item.product.id ? qtyRoll.dir : 'idle'}`}
                              className={`block w-8 text-center text-xs font-bold text-[#0F172A] tabular-nums ${
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
                              disabled={item.quantity >= item.product.stockQuantity}
                              aria-label="Ավելացնել քանակը"
                              className="min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-600 hover:bg-white disabled:opacity-30 rounded-lg transition-colors cursor-pointer btn-tactile"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="text-right">
                            <div className="text-xs font-black text-[#0F172A] tabular-nums">
                              {formatAMD(item.product.price * item.quantity)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Frequently Bought Together (Cross-Sell) Section */}
                {crossSellProducts.length > 0 && (
                  <div className="pt-4 border-t border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black text-[#0F172A] uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>Հաճախ գնվում է միասին</span>
                    </div>

                    <div className="space-y-2.5">
                      {crossSellProducts.map((crossSell) => (
                        <div
                          key={crossSell.id}
                          className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 hover:border-blue-300 transition-colors"
                        >
                          <img
                            src={crossSell.images[0]}
                            alt={crossSell.title}
                            className="w-11 h-11 rounded-xl object-cover bg-white border border-slate-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold text-[#0F172A] truncate">
                              {crossSell.title}
                            </h5>
                            <div className="text-xs font-extrabold text-blue-600 tabular-nums">
                              {formatAMD(crossSell.price)}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              addItem(crossSell, 1);
                              showCartToast(crossSell, 1);
                            }}
                            className="px-3 py-2 rounded-xl bg-[#0F172A] hover:bg-blue-600 text-white text-xs font-bold shrink-0 transition-all cursor-pointer shadow-md flex items-center gap-1 btn-tactile"
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
            <div className="p-4 sm:p-5 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] sm:pb-5 border-t border-[#E2E8F0] bg-slate-50/90 space-y-3.5 shrink-0">
              {/* Interactive Promo Code Form */}
              <div className="space-y-2">
                {!appliedCoupon ? (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value);
                          setCouponError(null);
                        }}
                        placeholder="Պրոմոկոդ (TAB10, VARPET, FREE)"
                        className="w-full h-11 pl-10 pr-3 rounded-xl bg-white border border-[#E2E8F0] text-base md:text-xs font-bold uppercase placeholder:normal-case placeholder:font-normal focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 min-h-[44px] rounded-xl bg-[#0F172A] hover:bg-[#2563EB] text-white text-xs font-bold transition-all cursor-pointer btn-tactile"
                    >
                      Կիրառել
                    </button>
                  </form>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-950">
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <span className="font-extrabold uppercase">{appliedCoupon.code}</span>
                        <span className="text-[11px] text-emerald-700 ml-1.5">
                          ({appliedCoupon.description})
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="min-h-[36px] px-2 text-[11px] text-rose-600 hover:underline font-bold ml-2 shrink-0 cursor-pointer flex items-center btn-tactile"
                    >
                      Հեռացնել
                    </button>
                  </div>
                )}

                {couponError && (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{couponError}</span>
                  </p>
                )}
              </div>

              {/* Showroom pickup badge */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-semibold">
                  Անվճար ստացում Մելքումովի 40/1 սրահից
                </span>
              </div>

              {/* Pricing breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Միջանկյալ գումար՝</span>
                  <span className="font-semibold text-[#0F172A] tabular-nums">
                    {formatAMD(subtotal)}
                  </span>
                </div>

                {appliedCoupon && discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Զեղչ ({appliedCoupon.code})՝</span>
                    <span className="tabular-nums">-{formatAMD(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Առաքում (Երևան)՝</span>
                  <span className="font-semibold text-emerald-700">Անվճար</span>
                </div>

                <div className="flex justify-between text-sm pt-2 border-t border-[#E2E8F0] font-bold text-[#0F172A]">
                  <span>Ընդամենը՝</span>
                  <span className="text-xl font-black text-[#0F172A] tabular-nums">
                    {formatAMD(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Checkout CTA: Deep Navy / Royal Blue */}
              <Link
                href="/checkout"
                onClick={closeDrawer}
                className="min-h-[50px] w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#0F172A] hover:bg-[#2563EB] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg cursor-pointer btn-tactile shimmer-glint"
              >
                <span>Ձևակերպել Պատվերը</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Link>

              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-blue-600" />
                  Երևան, Մելքումովի 40/1
                </span>
                <span>ՀԾ (ArmSoft) Սինք</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
