/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import { CheckCircle2, ClipboardList, Package, Store, Truck } from 'lucide-react';
import { ORDER_STATUS, type OrderStatus } from '@/types/api';
import { AUTH_HY } from '@/lib/copy/authHy';
import { cn } from '@/lib/utils';

/**
 * The one order-status badge in the app, driven by the single `OrderStatus` enum
 * the tracking screen already uses. Colour always travels with text — a status
 * is never communicated by colour alone — and every pairing is tint-on-white with
 * AA text, because this badge is read at 12px.
 */
const STATUS_UI: Record<
  OrderStatus,
  { label: string; className: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  [ORDER_STATUS.RECEIVED]: {
    label: AUTH_HY.STATUS_RECEIVED,
    className: 'bg-canvas text-body border-line',
    Icon: ClipboardList,
  },
  [ORDER_STATUS.PROCESSING]: {
    label: AUTH_HY.STATUS_PROCESSING,
    className: 'bg-warning/10 text-warning border-warning/25',
    Icon: Package,
  },
  [ORDER_STATUS.READY_FOR_PICKUP]: {
    label: AUTH_HY.STATUS_READY_FOR_PICKUP,
    className: 'bg-accent/10 text-accent-hover border-accent/25',
    Icon: Store,
  },
  [ORDER_STATUS.IN_TRANSIT]: {
    label: AUTH_HY.STATUS_IN_TRANSIT,
    className: 'bg-accent/10 text-accent-hover border-accent/25',
    Icon: Truck,
  },
  [ORDER_STATUS.DELIVERED]: {
    label: AUTH_HY.STATUS_DELIVERED,
    className: 'bg-success/10 text-success border-success/25',
    Icon: CheckCircle2,
  },
};

export default function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  // An unknown value degrades to the "received" styling rather than crashing the
  // list: the backend may add a state before this file is updated.
  const ui = STATUS_UI[status] ?? STATUS_UI[ORDER_STATUS.RECEIVED];
  const Icon = ui.Icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold',
        ui.className,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{ui.label}</span>
    </span>
  );
}
