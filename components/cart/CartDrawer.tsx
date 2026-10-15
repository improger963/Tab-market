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
} from 'lucide-react';
import { useCart } from '@/store/useCart';
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
  } = useCart();

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
  }, [isDrawerOpen, isMounted, closeDrawer]);

  if (!isMounted || !isDrawerOpen) {
    return null;
  }

  const count = totalCount();
  const subtotal = totalPrice();

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Գնումների Զամբյուղ"
    >
      {/* Backdrop overlay */}
      <div
        onClick={closeDrawer}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div
          ref={drawerRef}
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300 border-l border-slate-200"
        >
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-950 text-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-600/30 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold tracking-tight">Գնումների Զամբյուղ</h2>
              <span className="text-xs bg-slate-800 text-cyan-300 px-2.5 py-0.5 rounded-full font-bold tabular-nums">
                {count} {count === 1 ? 'ապրանք' : 'ապրանք'}
              </span>
            </div>

            <button
              ref={closeBtnRef}
              type="button"
              onClick={closeDrawer}
              aria-label="Փակել զամբյուղը"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="text-center py-20 px-4 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <PackageOpen className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">Ձեր զամբյուղը դատարկ է</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Ավելացրեք ապրանքներ tab.am կատալոգից կամ օգտագործեք ՀԾ կոդով որոնումը:
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="min-h-[44px] px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  Շարունակել գնումները
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.product.id} className="py-4 flex gap-3.5 group">
                  {/* Product thumbnail */}
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          Կոդ: {item.product.code}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeItem(item.product.id)}
                          aria-label={`Հեռացնել ${item.product.title}`}
                          className="min-w-[44px] min-h-[44px] -mt-2 -mr-2 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 truncate mt-1">
                        {item.product.title}
                      </h4>

                      <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                        {formatAMD(item.product.price)} / միավոր
                      </div>
                    </div>

                    {/* Quantity controller & line total */}
                    <div className="flex items-center justify-between mt-2 pt-1">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          aria-label="Նվազեցնել քանակը"
                          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-600 hover:bg-white transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <span className="w-7 text-center text-xs font-bold text-slate-900 tabular-nums">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stockQuantity}
                          aria-label="Ավելացնել քանակը"
                          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-600 hover:bg-white disabled:opacity-30 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
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
            <div className="p-5 border-t border-slate-200 bg-slate-50/80 space-y-4 shrink-0">
              {/* Showroom pickup badge */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">
                  Անվճար ստացում Մելքումովի 40/1 սրահից
                </span>
              </div>

              {/* Pricing breakdown */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Ընդհանուր քանակ՝</span>
                  <span className="font-semibold text-slate-900 tabular-nums">{count} հատ</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Առաքում (Երևան)՝</span>
                  <span className="font-semibold text-emerald-700">Անվճար</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-slate-200 font-bold text-slate-900">
                  <span>Ընդամենը՝</span>
                  <span className="text-lg font-black text-cyan-700 tabular-nums">
                    {formatAMD(subtotal)}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                onClick={closeDrawer}
                className="min-h-[44px] w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 active:scale-98 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                <span>Ձևակերպել Պատվերը</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
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
