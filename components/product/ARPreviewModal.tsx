/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { X, Box, Sparkles, ShieldCheck, Check, QrCode, Smartphone, Layers, Droplets } from 'lucide-react';
import { Product } from '@/types';
import { formatAMD } from '@/lib/utils';
import { useCart } from '@/store/useCart';
import { useToast } from '@/store/useToast';

interface ARPreviewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function ARPreviewModal({ product, isOpen, onClose }: ARPreviewModalProps) {
  const [selectedFinish, setSelectedFinish] = useState<'chrome' | 'black' | 'gold' | 'gunmetal'>('chrome');
  const [activeTab, setActiveTab] = useState<'3d' | 'ar'>('3d');
  const [isWaterFlowActive, setIsWaterFlowActive] = useState(false);
  const { addItem, openDrawer } = useCart();
  const { showCartToast } = useToast();

  if (!isOpen) return null;

  const finishes = [
    { id: 'chrome', name: 'Հայելային Քրոմ', bg: 'bg-ice-chrome', border: 'border-slate-300' },
    { id: 'black', name: 'Մատե Սև (PVD)', bg: 'bg-slate-900', border: 'border-slate-700 text-white' },
    { id: 'gold', name: 'Խոզանակավոր Ոսկի', bg: 'bg-amber-400', border: 'border-amber-600' },
    { id: 'gunmetal', name: 'Գանմետալ / Gunmetal', bg: 'bg-slate-600', border: 'border-slate-500' },
  ];

  const handleAddWithFinish = () => {
    addItem(product, 1);
    showCartToast(product, 1);
    onClose();
    openDrawer();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AR / 3D Ցուցադրություն"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0F172A] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm tracking-tight">AR / 3D Լոգարանի Սիմուլյատոր</h3>
              <span className="text-[11px] text-slate-400 font-mono">
                ՀԾ: {product.code} • {product.title}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Փակել"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 py-2 gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('3d')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === '3d'
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Box className="w-4 h-4 text-blue-400" />
            <span>3D Սրահի Սիմուլյացիա</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ar')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'ar'
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>AR Բջջային Տեղադրում (Հեռախոսով)</span>
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === '3d' ? (
            <div className="space-y-6">
              {/* 3D Simulated Bathroom Stage */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-[#0F172A] border border-slate-700 shadow-xl flex items-center justify-center p-6 text-center">
                {/* Simulated Tile Wall Background */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

                <div className="relative z-10 space-y-4 max-w-md">
                  <div className="relative mx-auto w-40 h-40 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-4 flex items-center justify-center shadow-2xl group">
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Water flow simulation overlay */}
                    {isWaterFlowActive && (
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-blue-500/40 to-transparent pointer-events-none animate-pulse flex items-end justify-center pb-2">
                        <Droplets className="w-6 h-6 text-blue-300 animate-bounce" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-mono text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/30">
                      Մելքումովի 40/1 Սրահի 3D Մոդել
                    </span>
                    <h4 className="text-white text-sm font-bold line-clamp-1">{product.title}</h4>
                    <p className="text-xs text-slate-300">
                      Ընտրված երանգ՝ <b className="text-blue-300">{finishes.find(f => f.id === selectedFinish)?.name}</b>
                    </p>
                  </div>
                </div>

                {/* Floating simulation toggles */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20">
                  <button
                    type="button"
                    onClick={() => setIsWaterFlowActive(!isWaterFlowActive)}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Droplets className="w-3.5 h-3.5" />
                    <span>{isWaterFlowActive ? 'Անջատել ջրի հոսքը' : 'Փորձարկել ջրի հոսքը'}</span>
                  </button>

                  <span className="text-[11px] text-slate-400 bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-700">
                    Պտտել / Զում անել մկնիկով
                  </span>
                </div>
              </div>

              {/* Finish Selector */}
              <div className="space-y-3">
                <label className="text-xs font-black text-[#0F172A] uppercase tracking-wider block">
                  Ընտրեք Ծածկույթը / Երանգը (PVD Finish)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {finishes.map((finish) => {
                    const isSelected = selectedFinish === finish.id;
                    return (
                      <button
                        key={finish.id}
                        type="button"
                        onClick={() => setSelectedFinish(finish.id as any)}
                        className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-2 ring-blue-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full ${finish.bg} ${finish.border} shrink-0 shadow-inner flex items-center justify-center`}>
                          {isSelected && <Check className="w-3.5 h-3.5 text-current" />}
                        </div>
                        <div className="text-left min-w-0">
                          <div className="text-xs font-bold text-[#0F172A] truncate">{finish.name}</div>
                          <div className="text-[10px] text-slate-500">Առկա է</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* AR Mobile QR Code Tab */
            <div className="py-8 text-center space-y-6 max-w-md mx-auto">
              <div className="w-32 h-32 rounded-3xl bg-slate-100 border-2 border-dashed border-slate-300 mx-auto flex items-center justify-center p-4">
                <QrCode className="w-24 h-24 text-[#0F172A]" />
              </div>

              <div className="space-y-2">
                <h4 className="font-black text-base text-[#0F172A]">Բացեք AR ռեժիմը ձեր հեռախոսով</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Սկանավորեք այս QR կոդը ձեր iPhone-ով կամ Android սմարթֆոնով՝ տեսնելու համար, թե ինչպես կտեղադրվի <b>{product.title}</b>-ը ձեր լոգարանում իրական չափերով:
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Աշխատում է առանց հավելված ներբեռնելու (WebXR / QuickLook)</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <div className="text-[11px] text-slate-500">Գինը ներառյալ ԱԱՀ</div>
            <div className="text-lg font-black text-[#0F172A] tabular-nums">{formatAMD(product.price)}</div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
            >
              Փակել
            </button>

            <button
              type="button"
              onClick={handleAddWithFinish}
              className="px-6 py-2.5 rounded-xl bg-[#0F172A] hover:bg-blue-600 text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Ավելացնել Զամբյուղ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
