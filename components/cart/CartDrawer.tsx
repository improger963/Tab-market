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
} from 'lucide-react';
import { useCart } from '@/store/useCart';
import { useToast } from '@/store/useToast';
import { formatAMD } from '@/lib/utils';

export default function CartDrawer() {
  const {
    items,
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

  const { showToast } = useToast();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  // Prevent SSR hydration mismatch for localStorage persisted Zustand store
  const [isMounted, setIsMounted] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
  const finalTotal = getFinalTotal(0); // in Yerevan default base shipping is free

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
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div className="fixed inset-x-0 bottom-0 md:inset-y-0 md:left-auto md:right-0 max-w-full flex md:pl-10 justify-end items-end md:items-stretch">
        <div
          ref={drawerRef}
          className={`w-full md:w-screen md:max-w-md bg-white shadow-2xl flex flex-col max-h-[92vh] md:max-h-full h-auto md:h-full rounded-t-3xl md:rounded-t-none md:border-l border-slate-200 transform transition-transform duration-300 ease-out ${
            isDrawerOpen
              ? 'translate-y-0 md:translate-x-0'
              : 'translate-y-full md:translate-y-0 md:translate-x-full'
          }`}
        >
          {/* Mobile pull handle */}
          <div className="md:hidden flex justify-center pt-2.5 pb-1 bg-slate-950 rounded-t-3xl">
            <div className="w-12 h-1.5 rounded-full bg-slate-700" />
          </div>

          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-950 text-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-white" />
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
              className="min-h-[48px] min-w-[48px] flex items-center justify-center text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              /* Empty state */
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 shadow-inner">
                  <PackageOpen className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-900">
                    Ձեր զամբյուղը դատարկ է
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                    Ավելացրեք ապրանքներ tab.am կատալոգից կամ որոնեք ՀԾ արտիկուլներով:
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="min-h-[44px] px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-cyan-600 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                >
                  Դիտել Կատալոգը
                </button>
              </div>
            ) : (
              /* Items list */
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-white flex gap-3.5 shadow-2xs relative group hover:border-slate-300 transition-colors"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.product.images[0]}
                    alt={item.product.title}
                    className="w-18 h-18 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
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
                          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors cursor-pointer rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h4 className="font-bold text-xs text-slate-900 line-clamp-2 mt-1 leading-snug">
                        {item.product.title}
                      </h4>
                    </div>

                    {/* Quantity controls and item subtotal */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          aria-label="Նվազեցնել քանակը"
                          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <span className="w-8 text-center text-xs font-bold text-slate-900 tabular-nums">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stockQuantity}
                          aria-label="Ավելացնել քանակը"
                          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-600 hover:bg-white disabled:opacity-30 rounded-lg transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-black text-slate-900 tabular-nums">
                          {formatAMD(item.product.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/90 space-y-3.5 shrink-0">
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
                        className="w-full h-12 pl-10 pr-3 rounded-xl bg-white border border-slate-200 text-xs font-bold uppercase placeholder:normal-case placeholder:font-normal focus-cobalt"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 min-h-[48px] rounded-xl bg-slate-900 hover:bg-cyan-600 text-white text-xs font-bold transition-all cursor-pointer"
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
                      className="min-h-[44px] px-2 text-[11px] text-rose-600 hover:underline font-bold ml-2 shrink-0 cursor-pointer flex items-center"
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
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-cyan-50/70 border border-cyan-200 text-cyan-900 text-xs">
                <ShieldCheck className="w-4 h-4 text-cyan-700 shrink-0" />
                <span className="font-semibold">
                  Անվճար ստացում Մելքումովի 40/1 սրահից
                </span>
              </div>

              {/* Pricing breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Միջանկյալ գումար՝</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
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

                <div className="flex justify-between text-sm pt-2 border-t border-slate-200 font-bold text-slate-900">
                  <span>Ընդամենը՝</span>
                  <span className="text-xl font-black text-cyan-700 tabular-nums">
                    {formatAMD(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                onClick={closeDrawer}
                className="min-h-[52px] w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-700 active:scale-98 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                <span>Ձևակերպել Պատվերը</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-cyan-600" />
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
