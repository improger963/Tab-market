/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { Search, Phone, Package, ArrowRight, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatArPhone } from '@/lib/utils';

interface TrackOrderFormProps {
  onSearch: (orderId: string, phone: string) => void;
  isLoading: boolean;
  initialOrderId?: string;
}

const ORDER_ID_PATTERN = /^TAB-\d{5}$/;

export default function TrackOrderForm({
  onSearch,
  isLoading,
  initialOrderId = '',
}: TrackOrderFormProps) {
  const [orderId, setOrderId] = useState(initialOrderId);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialOrderId) {
      setOrderId(initialOrderId);
    }
  }, [initialOrderId]);

  // Armenian phone auto-formatter — canonical +374 (XX) XX-XX-XX grouping
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatArPhone(e.target.value));
  };

  const handleOrderIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrderId(e.target.value.toUpperCase());
    if (error) setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = orderId.trim().toUpperCase();
    if (!value) {
      setError('Մուտքագրեք պատվերի համարը (օր.՝ TAB-84920):');
      return;
    }
    if (!ORDER_ID_PATTERN.test(value)) {
      setError('Պատվերի համարը պետք է ունենա TAB-XXXXX ձևաչափը (5 թիվ):');
      return;
    }
    setError(null);
    onSearch(value, phone.trim());
  };

  const loadDemoOrder = (demoId: string, demoPhone: string) => {
    setOrderId(demoId);
    setPhone(demoPhone);
    onSearch(demoId, demoPhone);
  };

  return (
    <div className="bg-white p-6 sm:p-10 rounded-panel border border-line shadow-e1 space-y-6">
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/5 border border-accent/15 text-accent-hover text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
          <span> Ինտեգրված Համակարգ</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
          Ստուգել Պատվերի Կարգավիճակը
        </h1>
        <p className="text-xs sm:text-sm text-muted max-w-lg leading-relaxed">
          Մուտքագրեք Ձեր պատվերի համարը (օր.՝ TAB-84920) և հեռախոսահամարը՝ ընթացքը տեսնելու համար։
        </p>
      </div>

      {/* Quick Demo Pill Buttons */}
      <div className="p-3.5 rounded-panel bg-canvas border border-line flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs font-bold text-body">Արագ փորձարկման օրինակներ.</span>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => loadDemoOrder('TAB-84920', '(95) 53-04-35')}
            className="px-3 py-1.5 rounded-control bg-white hover:bg-accent/5 border border-line-strong hover:border-accent text-xs font-bold text-ink transition-colors shadow-e1 cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-success" aria-hidden="true" />
            <span>Փորձել TAB-84920</span>
          </button>
          <button
            type="button"
            onClick={() => loadDemoOrder('TAB-11496', '(77) 12-34-56')}
            className="px-3 py-1.5 rounded-control bg-white hover:bg-accent/5 border border-line-strong hover:border-accent text-xs font-bold text-ink transition-colors shadow-e1 cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
            <span>Փորձել TAB-11496</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-body mb-1">
              Պատվերի համար <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={orderId}
                onChange={handleOrderIdChange}
                placeholder="օր.՝ TAB-84920"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'order-id-error' : undefined}
                className="w-full h-12 pl-10 pr-3 rounded-control bg-canvas border border-line text-base md:text-xs font-mono font-bold uppercase focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              />
              <Package className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            </div>
            {error && (
              <p
                id="order-id-error"
                role="alert"
                className="mt-1 flex items-center gap-1 text-xs font-semibold text-danger"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-body mb-1">
              Հեռախոսահամար <span className="text-muted font-normal">(ըստ ցանկության)</span>
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center gap-1.5 text-xs font-bold text-muted pointer-events-none">
                <span>+374</span>
                <span className="text-line-strong">|</span>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="95 53-04-35"
                className="w-full h-12 pl-22 pr-3 rounded-control bg-canvas border border-line text-base md:text-xs font-mono font-bold focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full min-h-[52px] py-3.5 rounded-control bg-ink hover:bg-accent active:scale-98 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-e1 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <span>Որոնվում է...</span>
          ) : (
            <>
              <Search className="w-4 h-4 text-accent" aria-hidden="true" />
              <span>Ստուգել Կարգավիճակը</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
