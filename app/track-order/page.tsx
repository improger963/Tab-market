/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Package, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { trackOrder } from '@/services/api';
import { TrackedOrderDetails } from '@/types/api';
import TrackOrderForm from '@/components/track/TrackOrderForm';
import OrderStatusTimeline from '@/components/track/OrderStatusTimeline';
import OrderDetailsSummary from '@/components/track/OrderDetailsSummary';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<TrackedOrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [urlOrderId, setUrlOrderId] = useState<string>(() => {
    try {
      if (typeof window !== 'undefined') {
        const sp = new URLSearchParams(window.location.search);
        return sp.get('id') || sp.get('orderId') || '';
      }
    } catch {
      // ignore
    }
    return '';
  });

  const handleSearch = useCallback(async (orderId: string, phone: string) => {
    if (!orderId.trim()) return;
    setIsLoading(true);
    setErrorMessage('');
    setOrder(null);

    try {
      const data = await trackOrder(orderId, phone);
      setOrder(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Պատվերը նշված համարով չի գտնվել:';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync search parameters safely if available
  useEffect(() => {
    let id = searchParams?.get('id') || searchParams?.get('orderId') || '';
    if (!id && typeof window !== 'undefined') {
      try {
        const sp = new URLSearchParams(window.location.search);
        id = sp.get('id') || sp.get('orderId') || '';
      } catch {
        // ignore
      }
    }
    if (id) {
      setUrlOrderId(id);
      handleSearch(id, '');
    }
  }, [searchParams, handleSearch]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-body hover:text-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Վերադառնալ Գլխավոր Էջ</span>
        </Link>
      </div>

      {/* Search Form */}
      <TrackOrderForm
        onSearch={handleSearch}
        isLoading={isLoading}
        initialOrderId={urlOrderId}
      />

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-panel bg-danger/10 border border-danger/20 text-danger text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-danger shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Order Results (Timeline & Summary) */}
      {order && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <OrderStatusTimeline timeline={order.timeline} />
          <OrderDetailsSummary order={order} />
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xs text-muted">
          Բեռնվում է...
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
