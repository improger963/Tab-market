/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { Search, Phone, Package, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface TrackOrderFormProps {
  onSearch: (orderId: string, phone: string) => void;
  isLoading: boolean;
  initialOrderId?: string;
}

export default function TrackOrderForm({
  onSearch,
  isLoading,
  initialOrderId = '',
}: TrackOrderFormProps) {
  const [orderId, setOrderId] = useState(initialOrderId);
  const [phone, setPhone] = useState('');

  // Armenian phone auto-formatter
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const digits = raw.startsWith('374') ? raw.slice(3) : raw;
    const trimmed = digits.slice(0, 8);

    let formatted = trimmed;
    if (trimmed.length > 2 && trimmed.length <= 5) {
      formatted = `(${trimmed.slice(0, 2)}) ${trimmed.slice(2)}`;
    } else if (trimmed.length > 5 && trimmed.length <= 7) {
      formatted = `(${trimmed.slice(0, 2)}) ${trimmed.slice(2, 5)}-${trimmed.slice(5)}`;
    } else if (trimmed.length > 7) {
      formatted = `(${trimmed.slice(0, 2)}) ${trimmed.slice(2, 5)}-${trimmed.slice(5, 7)}-${trimmed.slice(7)}`;
    } else if (trimmed.length > 2) {
      formatted = `(${trimmed.slice(0, 2)}) ${trimmed.slice(2)}`;
    }

    setPhone(formatted);
  };

  const handleOrderIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrderId(e.target.value.toUpperCase());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    onSearch(orderId.trim(), phone.trim());
  };

  const loadDemoOrder = (demoId: string, demoPhone: string) => {
    setOrderId(demoId);
    setPhone(demoPhone);
    onSearch(demoId, demoPhone);
  };

  return (
    <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-600" aria-hidden="true" />
          <span>ArmSoft ERP Ինտեգրված Համակարգ</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
          Ստուգել Պատվերի Կարգավիճակը
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg leading-relaxed">
          Մուտքագրեք Ձեր պատվերի համարը (օր.՝ TAB-84920) և հեռախոսահամարը՝ ընթացքը տեսնելու համար։
        </p>
      </div>

      {/* Quick Demo Pill Buttons */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs font-bold text-slate-700">Արագ փորձարկման օրինակներ.</span>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => loadDemoOrder('TAB-84920', '(95) 53-04-35')}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 text-xs font-bold text-slate-800 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
            <span>Փորձել TAB-84920</span>
          </button>
          <button
            type="button"
            onClick={() => loadDemoOrder('TAB-11496', '(77) 12-34-56')}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 text-xs font-bold text-slate-800 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" aria-hidden="true" />
            <span>Փորձել TAB-11496</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Պատվերի համար <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={orderId}
                onChange={handleOrderIdChange}
                placeholder="օր.՝ TAB-84920"
                className="w-full h-12 pl-10 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold uppercase focus:bg-white focus-cobalt transition-all"
              />
              <Package className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Հեռախոսահամար <span className="text-slate-400 font-normal">(ըստ ցանկության)</span>
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center gap-1.5 text-xs font-bold text-slate-500 pointer-events-none">
                <span>🇦🇲 +374</span>
                <span className="text-slate-300">|</span>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="95 53-04-35"
                className="w-full h-12 pl-22 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold focus:bg-white focus-cobalt transition-all"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full min-h-[52px] py-3.5 rounded-2xl bg-cyan-600 hover:bg-cyan-700 active:scale-98 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <span>Որոնվում է...</span>
          ) : (
            <>
              <Search className="w-4 h-4" aria-hidden="true" />
              <span>Ստուգել Կարգավիճակը</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
