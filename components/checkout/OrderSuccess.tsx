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
    <div className="max-w-2xl mx-auto bg-white rounded-panel border border-line p-8 sm:p-12 shadow-e1 text-center space-y-8 animate-in zoom-in-95 duration-200">
      <div className="w-20 h-20 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto animate-in fade-in zoom-in-50 duration-sheet">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ink text-accent font-mono text-xs font-bold shadow-e1">
          <span>ՊԱՏՎԵՐ № {orderNumber}</span>
          <button
            type="button"
            onClick={handleCopyOrder}
            className="hover:text-white p-0.5 transition-colors cursor-pointer"
            title="Պատճենել համարը"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
          Շնորհակալություն, Ձեր պատվերն ընդունված է!
        </h1>
        <p className="text-xs sm:text-sm text-muted max-w-md mx-auto leading-relaxed">
          Ապրանքներն արդեն իսկ ամրագրված են Կոդ () պահեստային համակարգում <b>{orderData.fullName}</b> անունով:
        </p>
      </div>

      {/* Details Card */}
      <div className="p-5 sm:p-6 rounded-panel bg-canvas border border-line text-left text-xs space-y-3.5">
        <div className="flex justify-between items-center pb-2.5 border-b border-line">
          <span className="text-muted font-medium">Ստացող՝</span>
          <span className="font-bold text-ink">{orderData.fullName} ({orderData.phone})</span>
        </div>

        <div className="flex justify-between items-center pb-2.5 border-b border-line">
          <span className="text-muted font-medium">Վճարման եղանակ՝</span>
          <span className="font-bold text-ink">{getPaymentName()}</span>
        </div>

        <div className="flex justify-between items-start pb-2.5 border-b border-line">
          <span className="text-muted font-medium shrink-0">Ստացման վայր՝</span>
          <div className="text-right font-bold text-ink">
            {orderData.deliveryMethod === 'pickup' && (
              <span className="flex items-center gap-1.5 justify-end text-accent-hover">
                <MapPin className="w-3.5 h-3.5 text-accent" />
                ք. Երևան, Մելքումովի 40/1 (Խանութ-Սրահ)
              </span>
            )}
            {orderData.deliveryMethod === 'yerevan' && (
              <span className="flex items-center gap-1.5 justify-end text-success">
                <Truck className="w-3.5 h-3.5 text-success" />
                Անվճար առաքում Երևանում ({orderData.addressStreet})
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center text-muted text-xs pt-1">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Սրահի աշխատանքային ժամեր՝
          </span>
          <span className="font-semibold text-ink">Երկ - Կիրակի՝ 10:00 - 20:00</span>
        </div>
      </div>

      <div className="p-4 rounded-panel bg-accent/5 border border-accent/15 text-xs text-ink flex items-center justify-center gap-2">
        <Phone className="w-4 h-4 text-accent shrink-0" />
        <span>
          Մեր մենեջերը <b>կզանգահարի Ձեզ 15 րոպեի ընթացքում</b>՝ պատվերը հաստատելու և
          առաքման ժամը ճշտելու համար:
        </span>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href={`/track-order?id=${orderNumber}`}
          className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-control bg-accent hover:bg-accent-hover text-white font-semibold text-xs transition-all shadow-e1 active:scale-98"
        >
          <span>Հետևել Պատվերի Ընթացքին</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          href="/catalog"
          className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-control bg-white border border-line hover:bg-canvas text-ink font-semibold text-xs transition-all shadow-e1"
        >
          <span>Շարունակել Գնումները</span>
        </Link>
      </div>
    </div>
  );
}
