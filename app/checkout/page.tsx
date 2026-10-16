/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronRight, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/store/useCart';
import { generateOrderId } from '@/services/api';
import { normalizeArPhone } from '@/lib/utils';
import CheckoutForm, { CheckoutFormData } from '@/components/checkout/CheckoutForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import OrderSuccess from '@/components/checkout/OrderSuccess';
import RecentlyViewed from '@/components/product/RecentlyViewed';

export default function CheckoutPage() {
  const { items, totalPrice } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    phone: '',
    email: '',
    deliveryMethod: 'yerevan',
    addressStreet: '',
    addressApartment: '',
    paymentMethod: 'card',
    orderNotes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccessNumber, setOrderSuccessNumber] = useState<string | null>(null);
  // Idempotency token: guards against double-submit (including same-tick re-entry).
  const submitTokenRef = useRef<string | null>(null);

  const subtotal = useMemo(() => {
    return isMounted ? totalPrice() : 0;
  }, [isMounted, totalPrice, items]);

  // Free delivery in Yerevan or pickup (0 AMD)
  const shippingCost = 0;

  const handleSubmit = () => {
    if (isSubmitting || submitTokenRef.current) return; // prevent double-submit

    if (!formData.fullName.trim()) {
      alert('Խնդրում ենք լրացնել Ձեր անունը և ազգանունը:');
      return;
    }
    const normalizedPhone = normalizeArPhone(formData.phone);
    if (!normalizedPhone) {
      alert('Խնդրում ենք լրացնել հեռախոսահամարը ճիշտ ձևաչափով՝ +374 (XX) XX-XX-XX:');
      return;
    }
    if (formData.deliveryMethod === 'yerevan' && !formData.addressStreet.trim()) {
      alert('Խնդրում ենք լրացնել Երևանի առաքման հասցեն (փողոց, շենք):');
      return;
    }

    // Order number is owned by the API layer, generated once per submission.
    const orderId = generateOrderId();
    submitTokenRef.current = orderId;

    setIsSubmitting(true);
    setTimeout(() => {
      setOrderSuccessNumber(orderId);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 900);
  };

  if (orderSuccessNumber) {
    return (
      <div className="container-lux py-10">
        <OrderSuccess orderData={formData} orderNumber={orderSuccessNumber} />
      </div>
    );
  }

  if (isMounted && items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-panel bg-canvas text-faint flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-ink tracking-tight">
            Ձեր զամբյուղը դատարկ է
          </h1>
          <p className="text-xs sm:text-sm text-muted max-w-sm mx-auto leading-relaxed">
            Պատվեր ձևակերպելու համար ավելացրեք ապրանքներ tab.am կատալոգից կամ օգտագործեք Կոդ Կոդով որոնումը:
          </p>
        </div>
        <Link
          href="/catalog"
          className="min-h-[48px] inline-flex items-center gap-2 px-8 py-3 rounded-panel bg-ink hover:bg-accent text-white font-bold text-xs transition-all shadow-e1 active:scale-98"
        >
          <span>Անցնել Կատալոգ</span>
          <ArrowRight className="w-4 h-4 text-accent" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-lux py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted">
        <Link href="/" className="hover:text-accent transition-colors">
          Գլխավոր
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-muted" />
        <Link href="/catalog" className="hover:text-accent transition-colors">
          Կատալոգ
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-muted" />
        <span className="text-ink font-bold">Պատվերի Ձևակերպում (1-Step Checkout)</span>
      </nav>

      <div>
        <h1 className="text-2xl sm:text-4xl font-bold text-ink tracking-tight">
          Պատվերի Ձևակերպում
        </h1>
        <p className="text-xs sm:text-sm text-muted mt-1">
          Ապրանքները բրոնյա են արվում Կոդ համակարգում Մելքումովի 40/1 պահեստից (Անվճար առաքում Երևանում):
        </p>
      </div>

      {/* 2-Column Checkout Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          <CheckoutForm
            data={formData}
            onChange={setFormData}
            shippingCost={shippingCost}
          />
        </div>

        <div className="lg:col-span-5 lg:sticky lg:top-[calc(var(--topbar-h)+var(--header-h)+1rem)]">
          <OrderSummary
            shippingCost={shippingCost}
            deliveryMethod={formData.deliveryMethod}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        </div>
      </div>

      <RecentlyViewed />
    </div>
  );
}
