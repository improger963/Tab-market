/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

/**
 * `/account/orders` — the customer's own order history.
 *
 * Everything here is read from `GET /me/orders`, which the backend answers from
 * the session cookie. Nothing is cached client-side beyond the fetched list: an
 * order status is a claim about the shop's fulfilment, so it is always the
 * server's version that is shown.
 *
 * "View status" deep-links into the tracking screen the customer already knows.
 * The order id travels in the query string — a number is not a secret, but a
 * phone number never appears in a URL.
 */
import React, { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, ReceiptText } from 'lucide-react';
import { listOrders } from '@/services/api';
import type { UserOrderSummary } from '@/types/api';
import { AUTH_HY, hy } from '@/lib/copy/authHy';
import { displayTitle, formatAMD, formatDateDDMMYYYY } from '@/lib/utils';
import { useAccountResource } from '@/lib/auth/useAccountResource';
import OrderStatusBadge from '@/components/account/OrderStatusBadge';
import { AccountEmptyState, AccountPanelError } from '@/components/account/AccountFeedback';
import { OrdersSkeleton } from '@/components/account/AccountSkeleton';
import ProductImage from '@/components/ui/ProductImage';

/** The list is capped at three thumbnails; the count line covers the rest. */
const MAX_THUMBNAILS = 3;

function OrderCard({ order }: { order: UserOrderSummary }) {
  const items = order.items.slice(0, MAX_THUMBNAILS);

  return (
    <article className="rounded-panel border border-line bg-surface shadow-e1 p-4 sm:p-5 space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="min-w-0">
          <h3 className="font-mono text-sm font-bold text-ink tabular-nums">{order.number}</h3>
          <p className="mt-1 text-xs text-muted">
            <span>{AUTH_HY.ORDER_PLACED_ON}</span>{' '}
            <time dateTime={order.createdAt} className="tabular-nums">
              {formatDateDDMMYYYY(order.createdAt)}
            </time>
            <span aria-hidden="true" className="px-1.5">
              ·
            </span>
            <span>{hy('ITEMS_COUNT', { count: order.items.length })}</span>
          </p>
        </div>
        <OrderStatusBadge status={order.status} className="shrink-0" />
      </header>

      {/* Line items: at most three, with the neutral placeholder when the data
          carries no genuine product photography. */}
      {items.length > 0 && (
        <ul className="space-y-2.5">
          {items.map((item, index) => (
            <li key={`${item.productId}-${index}`} className="flex items-center gap-3">
              <ProductImage
                src={item.image}
                alt={displayTitle(item.title)}
                className="h-14 w-14 shrink-0 rounded-control"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-ink sm:text-sm">
                  {displayTitle(item.title)}
                </p>
                <p className="mt-0.5 text-xs text-muted tabular-nums">
                  ×{item.quantity}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <span className="text-base font-bold text-ink tabular-nums sm:text-lg">
          {formatAMD(order.total)}
        </span>
        <Link
          // The tracking screen is keyed on the PRINTED number the customer also
          // sees on the confirmation and reads over the phone, not the internal id.
          href={`/track-order?id=${encodeURIComponent(order.number)}`}
          className="btn-tactile inline-flex min-h-[44px] items-center gap-2 rounded-control bg-ink px-4 py-2 text-xs font-semibold text-white transition-colors duration-hover hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <span>{AUTH_HY.VIEW_STATUS}</span>
          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
        </Link>
      </footer>
    </article>
  );
}

export default function OrdersPanel() {
  const { status, data, error, reload } = useAccountResource(listOrders);

  // Newest first, decided here rather than trusted from the transport: the
  // backend may page or re-sort later, and the list must stay readable.
  const orders = useMemo(
    () =>
      [...(data ?? [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [data]
  );

  if (status === 'loading') return <OrdersSkeleton />;

  if (status === 'error') {
    return <AccountPanelError message={error ?? AUTH_HY.ACCOUNT_LOAD_ERROR} onRetry={reload} />;
  }

  if (orders.length === 0) {
    return (
      <AccountEmptyState
        icon={<ReceiptText className="h-7 w-7" aria-hidden="true" />}
        title={AUTH_HY.ORDERS_EMPTY}
        hint={AUTH_HY.ORDERS_EMPTY_HINT}
        action={
          <Link
            href="/catalog"
            className="btn-tactile inline-flex min-h-[48px] items-center gap-2 rounded-control bg-ink px-6 py-3 text-sm font-semibold text-white transition-colors duration-hover hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <span>{AUTH_HY.BACK_TO_CATALOG}</span>
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
