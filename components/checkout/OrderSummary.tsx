'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Warehouse,
  ArrowRight,
  Loader2,
  Tag,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '@/store/useCart';
import { useToast } from '@/store/useToast';
import { formatAMD } from '@/lib/utils';
import { DeliveryType } from './CheckoutForm';

interface OrderSummaryProps {
  shippingCost: number;
  deliveryMethod: DeliveryType;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export default function OrderSummary({
  shippingCost,
  deliveryMethod,
  isSubmitting,
  onSubmit,
}: OrderSummaryProps) {
  const {
    items,
    totalPrice,
    totalCount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    getDiscountAmount,
    getEffectiveShippingCost,
    getFinalTotal,
  } = useCart();

  const { showToast } = useToast();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  const count = totalCount();
  const subtotal = totalPrice();
  const discountAmount = getDiscountAmount();
  const effectiveShipping = getEffectiveShippingCost(shippingCost);
  const finalTotal = getFinalTotal(shippingCost);

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
    <div className="sticky top-24 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 className="text-base font-extrabold uppercase tracking-wider text-slate-900">
          Ձեր Պատվերը
        </h2>
        <span className="text-xs bg-slate-900 text-cyan-300 font-bold px-2.5 py-0.5 rounded-full tabular-nums">
          {count} ապրանք
        </span>
      </div>

      {/* Compact Scrollable List of Items */}
      <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.product.id} className="py-3 flex gap-3 text-xs">
            <img
              src={item.product.images[0]}
              alt={item.product.title}
              className="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
            />
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                  Կոդ: {item.product.code}
                </span>
                <h4 className="font-bold text-slate-900 truncate mt-0.5 leading-snug">
                  {item.product.title}
                </h4>
              </div>

              <div className="flex items-center justify-between text-slate-500 text-[11px] mt-1">
                <span>
                  {formatAMD(item.product.price)} x {item.quantity}
                </span>
                <span className="font-extrabold text-slate-900 tabular-nums text-xs">
                  {formatAMD(item.product.price * item.quantity)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Promo Code Form */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 block">
          Պրոմոկոդ կամ Կուպոն
        </span>
        {!appliedCoupon ? (
          <form onSubmit={handleApplyPromo} className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={couponInput}
                onChange={(e) => {
                  setCouponInput(e.target.value);
                  setCouponError(null);
                }}
                placeholder="TAB10, VARPET, FREE"
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs font-bold uppercase placeholder:normal-case placeholder:font-normal focus-cobalt"
              />
            </div>
            <button
              type="submit"
              className="px-4 h-9 rounded-xl bg-slate-900 hover:bg-cyan-600 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Կիրառել
            </button>
          </form>
        ) : (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-950">
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
              className="text-[11px] text-rose-600 hover:underline font-bold ml-2 shrink-0 cursor-pointer"
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

      {/* Cost Breakdown */}
      <div className="border-t border-slate-200 pt-4 space-y-2 text-xs">
        <div className="flex justify-between text-slate-600">
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

        <div className="flex justify-between text-slate-600">
          <span>Առաքման արժեք՝</span>
          <span className="font-bold tabular-nums">
            {effectiveShipping === 0 ? (
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-black">
                {appliedCoupon?.freeShipping ? 'ԱՆՎՃԱՐ (FREE)' : 'ԱՆՎՃԱՐ'}
              </span>
            ) : (
              <span className="text-slate-900">{formatAMD(effectiveShipping)}</span>
            )}
          </span>
        </div>

        <div className="flex justify-between text-sm font-bold text-slate-900 pt-3 border-t border-slate-200 items-baseline">
          <span>Ընդհանուր գումար՝</span>
          <span className="text-2xl font-black text-cyan-700 tabular-nums">
            {formatAMD(finalTotal)}
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="button"
        disabled={isSubmitting || items.length === 0}
        onClick={onSubmit}
        className="w-full min-h-[52px] py-3.5 px-6 rounded-2xl bg-cyan-600 hover:bg-cyan-700 active:scale-98 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Գրանցվում է ՀԾ համակարգում...</span>
          </>
        ) : (
          <>
            <span>Հաստատել Պատվերը</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </>
        )}
      </button>

      {/* Trust Badges */}
      <div className="pt-2 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-2 text-slate-700">
          <Warehouse className="w-4 h-4 text-cyan-600 shrink-0" />
          <span>Ապրանքները բրոնյա են արվում Մելքումովի 40/1 պահեստում</span>
        </div>

        <div className="flex items-center gap-2 text-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>100% Պաշտոնական Գործարանային Երաշխիք</span>
        </div>
      </div>
    </div>
  );
}
