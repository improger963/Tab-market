/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  const handleCopyOrder = () => {
    navigator.clipboard?.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPaymentName = () => {
    if (orderData.paymentMethod === 'idram') return 'Idram / Rocket Line (Ապառիկ)';
    if (orderData.paymentMethod === 'card') return 'Բանկային Քարտ (ArCa / Visa / Mastercard)';
    return 'Կանխիկ Վճարում (Սրահում կամ առաքիչին)';
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-[#E2E8F0] p-8 sm:p-12 shadow-sm text-center space-y-8 animate-in zoom-in-95 duration-200">
      <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-in fade-in zoom-in-50 duration-300">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F172A] text-blue-400 font-mono text-xs font-bold shadow-2xs">
          <span>ՊԱՏՎԵՐ № {orderNumber}</span>
          <button
            type="button"
            onClick={handleCopyOrder}
            className="hover:text-white p-0.5 transition-colors cursor-pointer"
            title="Պատճենել համարը"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
          Շնորհակալություն, Ձեր պատվերն ընդունված է!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Ապրանքներն արդեն իսկ ամրագրված են Կոդ () պահեստային համակարգում <b>{orderData.fullName}</b> անունով:
        </p>
      </div>

      {/* Details Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-left text-xs space-y-3.5">
        <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/70">
          <span className="text-slate-500 font-medium">Ստացող՝</span>
          <span className="font-bold text-[#0F172A]">{orderData.fullName} ({orderData.phone})</span>
        </div>

        <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/70">
          <span className="text-slate-500 font-medium">Վճարման եղանակ՝</span>
          <span className="font-bold text-[#0F172A]">{getPaymentName()}</span>
        </div>

        <div className="flex justify-between items-start pb-2.5 border-b border-slate-200/70">
          <span className="text-slate-500 font-medium shrink-0">Ստացման վայր՝</span>
          <div className="text-right font-bold text-[#0F172A]">
            {orderData.deliveryMethod === 'pickup' && (
              <span className="flex items-center gap-1.5 justify-end text-blue-700">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                ք. Երևան, Մելքումովի 40/1 (Խանութ-Սրահ)
              </span>
            )}
            {orderData.deliveryMethod === 'yerevan' && (
              <span className="flex items-center gap-1.5 justify-end text-emerald-700">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                Անվճար առաքում Երևանում ({orderData.addressStreet})
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center text-slate-500 text-[11px] pt-1">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Սրահի աշխատանքային ժամեր՝
          </span>
          <span className="font-semibold text-slate-800">Երկ - Կիրակի՝ 10:00 - 20:00</span>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 flex items-center justify-center gap-2">
        <Phone className="w-4 h-4 text-blue-600 shrink-0" />
        <span>
          Մեր մենեջերը <b>կզանգահարի Ձեզ 15 րոպեի ընթացքում</b>՝ պատվերը հաստատելու և
          առաքման ժամը ճշտելու համար:
        </span>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href={`/track-order?id=${orderNumber}`}
          className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98"
        >
          <span>Հետևել Պատվերի Ընթացքին</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          href="/catalog"
          className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#0F172A] font-extrabold text-xs uppercase tracking-wider transition-all shadow-xs"
        >
          <span>Շարունակել Գնումները</span>
        </Link>
      </div>
    </div>
  );
}
