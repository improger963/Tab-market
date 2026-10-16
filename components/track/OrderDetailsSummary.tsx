/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import { MapPin, Phone, MessageCircle, Truck, Package, CheckCircle2, ShieldCheck } from 'lucide-react';
import { TrackedOrderDetails } from '@/types/api';
import { formatAMD } from '@/lib/utils';
import ProductImage from '@/components/ui/ProductImage';

interface OrderDetailsSummaryProps {
  order: TrackedOrderDetails;
}

export default function OrderDetailsSummary({ order }: OrderDetailsSummaryProps) {
  const getStatusBadge = () => {
    switch (order.currentStatus) {
      case 'ready_for_pickup':
        return (
          <span className="px-3 py-1 rounded-full bg-success text-ink text-xs font-bold inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success "></span>
            Պատրաստ է Ստացման Սրահում
          </span>
        );
      case 'in_transit':
        return (
          <span className="px-3 py-1 rounded-full bg-accent/80 text-accent-hover text-xs font-bold inline-flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
            Ճանապարհին (Առաքվում է)
          </span>
        );
      case 'processing':
        return (
          <span className="px-3 py-1 rounded-full bg-warning/10 text-warning text-xs font-bold inline-flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-warning" aria-hidden="true" />
            Մշակման փուլում է
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-canvas text-ink text-xs font-bold inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-body" aria-hidden="true" />
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
    <div className="bg-white p-6 sm:p-8 rounded-panel border border-line shadow-e1 space-y-6">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-canvas">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-bold text-ink">№ {order.orderId}</span>
            {getStatusBadge()}
          </div>
          <p className="text-xs text-muted mt-1">
            Գրանցված է՝ {new Date(order.createdAt).toLocaleString('hy-AM')}
          </p>
        </div>

        {/* Direct Showroom CTAs */}
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="tel:095530435"
            className="min-h-[44px] px-3.5 py-2 rounded-control bg-ink hover:bg-accent-hover text-white text-xs font-bold flex items-center gap-2 shadow-e1 transition-colors cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
            <span>Զանգահարել Սրահ</span>
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] px-3.5 py-2 rounded-control bg-success hover:bg-success text-white text-xs font-bold flex items-center gap-2 shadow-e1 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white text-success" aria-hidden="true" />
            <span>Ճշտել WhatsApp-ով</span>
          </a>
        </div>
      </div>

      {/* Customer & Delivery Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="p-4 rounded-panel bg-canvas border border-line space-y-2">
          <span className="text-xs font-semibold text-muted block">
            Գնորդի Տվյալներ
          </span>
          <div className="font-bold text-ink">{order.customerName}</div>
          <div className="font-mono text-body">{order.phone}</div>
          <div className="text-success font-semibold flex items-center gap-1 pt-1">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            Վճարված է ({order.paymentMethod})
          </div>
        </div>

        <div className="p-4 rounded-panel bg-canvas border border-line space-y-2">
          <span className="text-xs font-semibold text-muted block">
            Ստացման Եղանակ
          </span>
          <div className="font-bold text-ink flex items-center gap-1.5">
            {order.deliveryMethod === 'showroom_pickup' ? (
              <>
                <MapPin className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                <span>Ինքնարտահանում Սրահից</span>
              </>
            ) : (
              <>
                <Truck className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                <span>Առաքում Հասցեով</span>
              </>
            )}
          </div>
          <div className="text-body leading-normal">{order.deliveryAddress}</div>
        </div>
      </div>

      {/* Items Miniature List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-ink">
          Պատվերում Ներառված Ապրանքներ ({order.items.length})
        </h3>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-panel border border-line bg-white flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <ProductImage
                  src={item.image}
                  alt={item.title}
                  className="w-14 h-14 rounded-control bg-canvas border border-line shrink-0"
                />
                <div className="min-w-0">
                  <span className="font-mono text-xs font-bold text-ink bg-canvas px-2 py-0.5 rounded border border-line">
                    ԿՈԴ: {item.code}
                  </span>
                  <h4 className="text-xs font-bold text-ink truncate mt-1">
                    {item.title}
                  </h4>
                  <div className="text-xs text-muted font-medium">
                    Քանակ՝ {item.quantity} հատ
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs sm:text-sm font-bold text-ink tabular-nums">
                  {formatAMD(item.price * item.quantity)}
                </div>
                <div className="text-xs text-muted tabular-nums">
                  ({formatAMD(item.price)} / հատ)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total Amount Footer */}
      <div className="p-4 rounded-panel bg-ink text-white flex items-center justify-between">
        <span className="text-xs font-bold text-on-dark">
          Ընդհանուր Գումար (ներառյալ ԱԱՀ)
        </span>
        <span className="text-lg sm:text-xl font-bold text-accent tabular-nums">
          {formatAMD(order.totalAmount)}
        </span>
      </div>
    </div>
  );
}
