'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  MapPin,
  Truck,
  Phone,
  Clock,
  ArrowRight,
  FileCheck2,
  Copy,
  Check,
} from 'lucide-react';
import { useCart } from '@/store/useCart';
import { CheckoutFormData } from './CheckoutForm';

interface OrderSuccessProps {
  orderData: CheckoutFormData;
  orderNumber: string;
}

export default function OrderSuccess({ orderData, orderNumber }: OrderSuccessProps) {
  const { clearCart } = useCart();
  const [copied, setCopied] = useState(false);

  // Reset cart once the order is placed
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  const handleCopyOrder = () => {
    navigator.clipboard?.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPaymentName = () => {
    if (orderData.paymentMethod === 'idram') return 'Idram / Rocket';
    if (orderData.paymentMethod === 'telcell') return 'Telcell Wallet';
    if (orderData.paymentMethod === 'card') return 'Բանկային Քարտ (ArCa / Visa / Mastercard)';
    return 'Կանխիկ վճարում';
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-sm text-center space-y-8 animate-in zoom-in-95 duration-200">
      {/* Big Emerald Checkmark */}
      <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-in fade-in zoom-in-50 duration-300">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      {/* Headings */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-cyan-400 font-mono text-xs font-bold shadow-2xs">
          <span>ՊԱՏՎԵՐ № {orderNumber}</span>
          <button
            type="button"
            onClick={handleCopyOrder}
            className="hover:text-white p-0.5 transition-colors cursor-pointer"
            title="Պատճենել համարը"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
          Շնորհակալություն, Ձեր պատվերն ընդունված է!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Ապրանքներն արդեն իսկ ամրագրված են ՀԾ (ArmSoft) պահեստային համակարգում <b>{orderData.fullName}</b> անունով:
        </p>
      </div>

      {/* Details Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-left text-xs space-y-3.5">
        <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/70">
          <span className="text-slate-500 font-medium">Ստացող՝</span>
          <span className="font-bold text-slate-900">{orderData.fullName} ({orderData.phone})</span>
        </div>

        <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/70">
          <span className="text-slate-500 font-medium">Վճարման եղանակ՝</span>
          <span className="font-bold text-slate-900">{getPaymentName()}</span>
        </div>

        <div className="flex justify-between items-start pb-2.5 border-b border-slate-200/70">
          <span className="text-slate-500 font-medium shrink-0">Ստացման վայր՝</span>
          <div className="text-right font-bold text-slate-900">
            {orderData.deliveryMethod === 'pickup' && (
              <span className="flex items-center gap-1.5 justify-end text-cyan-700">
                <MapPin className="w-3.5 h-3.5" />
                ք. Երևան, Մելքումովի 40/1 (Խանութ-Սրահ)
              </span>
            )}
            {orderData.deliveryMethod === 'yerevan' && (
              <span>Երևան, {orderData.addressStreet} {orderData.addressApartment}</span>
            )}
            {orderData.deliveryMethod === 'regional' && (
              <span>ՀՀ {orderData.marz}, ք./գ. {orderData.city}, {orderData.addressStreet}</span>
            )}
          </div>
        </div>

        {orderData.isB2B && (
          <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/70 text-cyan-900 bg-cyan-50/50 p-2 rounded-xl">
            <span className="flex items-center gap-1.5 font-bold">
              <FileCheck2 className="w-3.5 h-3.5 text-cyan-600" />
              ՀԾ Էլեկտրոնային Հաշիվ՝
            </span>
            <span className="font-mono font-black">{orderData.companyName} (ՀՎՀՀ: {orderData.companyTIN})</span>
          </div>
        )}

        <div className="flex justify-between items-center text-slate-500 text-[11px] pt-1">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Սրահի աշխատանքային ժամեր՝
          </span>
          <span className="font-semibold text-slate-800">Երկ - Կիրակի՝ 09:00 - 19:00</span>
        </div>
      </div>

      {/* Confirmation notice */}
      <div className="p-4 rounded-2xl bg-cyan-50/80 border border-cyan-200/80 text-xs text-cyan-950 flex items-center justify-center gap-2">
        <Phone className="w-4 h-4 text-cyan-700 shrink-0" />
        <span>
          Մեր մենեջերը կկապվի Ձեզ հետ <b>15 րոպեի ընթացքում</b>՝ պատվերը վերջնական հաստատելու համար:
        </span>
      </div>

      {/* Return home CTA */}
      <div className="pt-2">
        <Link
          href="/"
          className="min-h-[48px] inline-flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98"
        >
          <span>Վերադառնալ Գլխավոր Էջ</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
