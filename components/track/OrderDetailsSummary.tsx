/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import { MapPin, Phone, MessageCircle, Truck, Package, CheckCircle2, Building, ShieldCheck } from 'lucide-react';
import { TrackedOrderDetails } from '@/types/api';
import { formatAMD } from '@/lib/utils';

interface OrderDetailsSummaryProps {
  order: TrackedOrderDetails;
}

export default function OrderDetailsSummary({ order }: OrderDetailsSummaryProps) {
  const getStatusBadge = () => {
    switch (order.currentStatus) {
      case 'ready_for_pickup':
        return (
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Պատրաստ է Ստացման Սրահում
          </span>
        );
      case 'in_transit':
        return (
          <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-black inline-flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-cyan-600" aria-hidden="true" />
            Ճանապարհին (Առաքվում է)
          </span>
        );
      case 'processing':
        return (
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black inline-flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
            Մշակման փուլում է
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-black inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
            Գրանցված է
          </span>
        );
    }
  };

  // WhatsApp pre-filled inquiry for order tracking
  const whatsappUrl = `https://wa.me/37495530435?text=${encodeURIComponent(
    `Բարև ձեզ, ինձ հետաքրքրում է #${order.orderId} պատվերի ընթացքը (${order.customerName}, հեռ: ${order.phone}):`
  )}`;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-black text-slate-950">№ {order.orderId}</span>
            {getStatusBadge()}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Գրանցված է՝ {new Date(order.createdAt).toLocaleString('hy-AM')}
          </p>
        </div>

        {/* Direct Showroom CTAs */}
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="tel:095530435"
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
            <span>Զանգահարել Սրահ</span>
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white text-emerald-600" aria-hidden="true" />
            <span>Ճշտել WhatsApp-ով</span>
          </a>
        </div>
      </div>

      {/* Customer & Delivery Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block">
            Գնորդի Տվյալներ
          </span>
          <div className="font-bold text-slate-900">{order.customerName}</div>
          <div className="font-mono text-slate-600">{order.phone}</div>
          <div className="text-emerald-700 font-semibold flex items-center gap-1 pt-1">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            Վճարված է ({order.paymentMethod})
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block">
            Ստացման Եղանակ
          </span>
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            {order.deliveryMethod === 'showroom_pickup' ? (
              <>
                <MapPin className="w-4 h-4 text-cyan-600 shrink-0" aria-hidden="true" />
                <span>Ինքնարտահանում Սրահից</span>
              </>
            ) : (
              <>
                <Truck className="w-4 h-4 text-cyan-600 shrink-0" aria-hidden="true" />
                <span>Առաքում Հասցեով</span>
              </>
            )}
          </div>
          <div className="text-slate-600 leading-normal">{order.deliveryAddress}</div>
        </div>
      </div>

      {/* Items Miniature List */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
          Պատվերում Ներառված Ապրանքներ ({order.items.length})
        </h3>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-2xl border border-slate-200/80 bg-white flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <span className="font-mono text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                    ԿՈԴ: {item.code}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 truncate mt-1">
                    {item.title}
                  </h4>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Քանակ՝ {item.quantity} հատ
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs sm:text-sm font-black text-slate-950 tabular-nums">
                  {formatAMD(item.price * item.quantity)}
                </div>
                <div className="text-[10px] text-slate-400 tabular-nums">
                  ({formatAMD(item.price)} / հատ)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total Amount Footer */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Ընդհանուր Գումար (ներառյալ ԱԱՀ)
        </span>
        <span className="text-lg sm:text-xl font-black text-cyan-400 tabular-nums">
          {formatAMD(order.totalAmount)}
        </span>
      </div>
    </div>
  );
}
