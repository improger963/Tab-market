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
import { formatAMD, displayTitle } from '@/lib/utils';
import ProductImage from '@/components/ui/ProductImage';
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
    <div className="bg-white p-6 sm:p-7 rounded-panel border border-line shadow-e1 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-canvas">
        <h2 className="text-base font-semibold text-ink">
          Ձեր Պատվերը
        </h2>
        <span className="text-xs bg-ink text-white font-bold px-2.5 py-0.5 rounded-full tabular-nums">
          {count} ապրանք
        </span>
      </div>

      {/* Compact Scrollable List of Items */}
      <div className="divide-y divide-line max-h-64 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.product.id} className="py-3 flex gap-3 text-xs">
            <ProductImage
              src={item.product.images[0]}
              alt={item.product.title}
              className="w-14 h-14 rounded-control bg-canvas border border-line shrink-0"
            />
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-muted bg-canvas px-1.5 py-0.2 rounded">
                  Կոդ: {item.product.code}
                </span>
                <h4 className="font-bold text-ink truncate mt-0.5 leading-snug">
                  {displayTitle(item.product.title)}
                </h4>
              </div>

              <div className="flex items-center justify-between text-muted text-xs mt-1">
                <span>
                  {formatAMD(item.product.price)} x {item.quantity}
                </span>
                <span className="font-semibold text-ink tabular-nums text-xs">
                  {formatAMD(item.product.price * item.quantity)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Promo Code Form */}
      <div className="p-3.5 rounded-panel bg-canvas border border-line space-y-2">
        <span id="co-promo-label" className="text-xs font-semibold text-muted block">
          Զեղչի կոդ
        </span>
        {!appliedCoupon ? (
          <form onSubmit={handleApplyPromo} className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="co-promo"
                value={couponInput}
                aria-labelledby="co-promo-label"
                aria-invalid={Boolean(couponError)}
                aria-describedby={couponError ? 'co-promo-error' : undefined}
                onChange={(e) => {
                  setCouponInput(e.target.value);
                  setCouponError(null);
                }}
                placeholder="Պրոմոկոդ"
                className="w-full h-9 pl-9 pr-3 rounded-control bg-white border border-line text-xs font-bold uppercase placeholder:normal-case placeholder:font-normal focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <button
              type="submit"
              className="btn-tactile px-4 h-9 rounded-control bg-ink hover:bg-accent text-white text-xs font-bold transition-colors duration-hover cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              Կիրառել
            </button>
          </form>
        ) : (
          <div className="p-2.5 rounded-control bg-success/10 border border-success flex items-center justify-between text-xs text-ink">
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
              className="text-xs text-danger hover:text-danger hover:underline font-bold ml-2 shrink-0 cursor-pointer rounded-control px-1 min-h-[32px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
            >
              Հեռացնել
            </button>
          </div>
        )}

        {couponError && (
          <p id="co-promo-error" role="alert" className="text-xs text-danger flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{couponError}</span>
          </p>
        )}
      </div>

      {/* Cost Breakdown */}
      <div className="border-t border-line pt-4 space-y-2 text-xs">
        <div className="flex justify-between text-body">
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

        <div className="flex justify-between text-body">
          <span>Առաքման արժեք՝</span>
          <span className="font-bold tabular-nums">
            {effectiveShipping === 0 ? (
              <span className="text-success bg-success/10 px-2 py-0.5 rounded font-bold">
                ԱՆՎՃԱՐ
              </span>
            ) : (
              <span className="text-ink">{formatAMD(effectiveShipping)}</span>
            )}
          </span>
        </div>

        <div className="flex justify-between text-sm font-bold text-ink pt-3 border-t border-line items-baseline">
          <span>Ընդհանուր գումար՝</span>
          <span className="text-2xl font-bold text-ink tabular-nums">
            {formatAMD(finalTotal)}
          </span>
        </div>
      </div>

      {/* Submit Button: High-contrast Deep Navy (bg-ink hover:bg-accent text-white font-bold py-4 rounded-control) */}
      <button
        type="button"
        disabled={isSubmitting || items.length === 0}
        onClick={onSubmit}
        aria-busy={isSubmitting}
        className="btn-tactile w-full min-h-[52px] py-4 px-6 rounded-control bg-ink hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 text-white font-bold text-sm transition-colors duration-hover shadow-e1 flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Գրանցվում է պատվերը...</span>
          </>
        ) : (
          <>
            <span>Հաստատել Պատվերը</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </>
        )}
      </button>

      {/* Trust Badges */}
      <div className="pt-2 border-t border-canvas space-y-2 text-xs text-muted">
        <div className="flex items-center gap-2 text-body">
          <Warehouse className="w-4 h-4 text-accent shrink-0" />
          <span>Ապրանքները ամրագրվում են Մելքումովի 40/1 պահեստում</span>
        </div>

        
      </div>
    </div>
  );
}
