'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCart } from '@/store/useCart';
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
    deliveryMethod: 'pickup',
    addressStreet: '',
    addressApartment: '',
    addressFloor: '',
    marz: '',
    city: '',
    paymentMethod: 'card',
    isB2B: false,
    companyName: '',
    companyTIN: '',
    orderNotes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccessNumber, setOrderSuccessNumber] = useState<string | null>(null);

  const subtotal = useMemo(() => {
    return isMounted ? totalPrice() : 0;
  }, [isMounted, totalPrice, items]);

  // Compute dynamic shipping cost
  const shippingCost = useMemo(() => {
    if (formData.deliveryMethod === 'pickup') return 0;
    if (formData.deliveryMethod === 'yerevan') {
      return subtotal >= 30000 ? 0 : 1500;
    }
    if (formData.deliveryMethod === 'regional') return 3000;
    return 0;
  }, [formData.deliveryMethod, subtotal]);

  const handleSubmit = () => {
    if (!formData.fullName.trim()) {
      alert('Խնդրում ենք լրացնել Ձեր անունը:');
      return;
    }
    if (!formData.phone.trim()) {
      alert('Խնդրում ենք լրացնել Ձեր հեռախոսահամարը:');
      return;
    }
    if (formData.deliveryMethod === 'yerevan' && !formData.addressStreet.trim()) {
      alert('Խնդրում ենք լրացնել Երևանի առաքման հասցեն (փողոց, շենք):');
      return;
    }
    if (formData.deliveryMethod === 'regional' && (!formData.marz || !formData.city.trim() || !formData.addressStreet.trim())) {
      alert('Խնդրում ենք լրացնել մարզային ամբողջական հասցեն:');
      return;
    }
    if (formData.isB2B && (!formData.companyName.trim() || !formData.companyTIN.trim())) {
      alert('Խնդրում ենք լրացնել կազմակերպության անվանումը և ՀՎՀՀ-ն:');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const generatedOrder = `TAB-${Math.floor(10000 + Math.random() * 90000)}`;
      setOrderSuccessNumber(generatedOrder);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 900);
  };

  // If order was successfully submitted, display confirmation view
  if (orderSuccessNumber) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <OrderSuccess orderData={formData} orderNumber={orderSuccessNumber} />
      </div>
    );
  }

  // Handle empty cart state gracefully
  if (isMounted && items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Ձեր զամբյուղը դատարկ է
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            Պատվեր ձևակերպելու համար ավելացրեք ապրանքներ tab.am կատալոգից կամ օգտագործեք ՀԾ կոդով որոնումը:
          </p>
        </div>
        <Link
          href="/catalog"
          className="min-h-[48px] inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98"
        >
          <span>Անցնել Կատալոգ</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-cyan-600 transition-colors">
          Գլխավոր
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/catalog" className="hover:text-cyan-600 transition-colors">
          Կատալոգ
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-bold">Պատվերի Ձևակերպում (1-Step Checkout)</span>
      </nav>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
          Պատվերի Ձևակերպում
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Ապրանքները բրոնյա են արվում ՀԾ համակարգում Մելքումովի 40/1 պահեստից:
        </p>
      </div>

      {/* 2-Column Checkout Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Checkout Form */}
        <div className="lg:col-span-7">
          <CheckoutForm
            data={formData}
            onChange={setFormData}
            shippingCost={shippingCost}
          />
        </div>

        {/* Right Column (5 cols): Order Summary */}
        <div className="lg:col-span-5">
          <OrderSummary
            shippingCost={shippingCost}
            deliveryMethod={formData.deliveryMethod}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        </div>
      </div>

      {/* Recently Viewed Carousel */}
      <RecentlyViewed />
    </div>
  );
}
