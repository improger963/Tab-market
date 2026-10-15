/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
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
  const urlOrderId = searchParams.get('id') || searchParams.get('orderId') || '';

  const [order, setOrder] = useState<TrackedOrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = async (orderId: string, phone: string) => {
    setIsLoading(true);
    setErrorMessage('');
    setOrder(null);

    try {
      const data = await trackOrder(orderId, phone);
      setOrder(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Պատվերը նշված համարով չի գտնվել:');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-search if `?id=TAB-XXXXX` is provided in query params on mount
  useEffect(() => {
    if (urlOrderId) {
      handleSearch(urlOrderId, '');
    }
  }, [urlOrderId]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-cyan-600 transition-colors"
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
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
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
        <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xs text-slate-500">
          Բեռնվում է...
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
