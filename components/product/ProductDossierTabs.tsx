/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  FileCheck2,
  Ruler,
  Wrench,
  Truck,
  MapPin,
  X,
  ZoomIn,
} from 'lucide-react';
import { Product } from '@/types';
import { resolveImageUrl } from '@/lib/config';
import { displayTitle } from '@/lib/utils';

interface ProductDossierTabsProps {
  product: Product;
}

/**
 * Single source of truth for the full technical specifications table,
 * CAD blueprint and delivery/installation guidance (below-the-fold tab section).
 */
export default function ProductDossierTabs({ product }: ProductDossierTabsProps) {
  const [dossierTab, setDossierTab] = useState<'specs' | 'blueprint' | 'delivery'>('specs');
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const hasBlueprint = !!resolveImageUrl(product.blueprintImage);
  // Only render spec rows that carry real customer data; the internal SKU row
  // (stored under key "code") is surfaced once as a "Կոդ" chip elsewhere and
  // must not appear in the technical table.
  const specRows = Object.entries(product.specs).filter(
    ([key, value]) =>
      key !== 'code' &&
      typeof value === 'string' &&
      value.trim().length > 0,
  );

  const tabs = [
    { id: 'specs', label: 'Տեխնիկական Բնութագիր', Icon: FileCheck2 },
    ...(hasBlueprint ? [{ id: 'blueprint', label: 'Գծագիր և Չափսեր (մմ)', Icon: Ruler }] : []),
    { id: 'delivery', label: 'Առաքում և Տեղադրում', Icon: Wrench },
  ] as const;

  return (
    <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-xs overflow-hidden">
      {/* Tab Headers */}
      <div className="flex items-center gap-1 p-1.5 bg-[#F8FAFC] border-b border-[#E2E8F0] overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const TabIcon = tab.Icon;
          const active = dossierTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setDossierTab(tab.id as 'specs' | 'blueprint' | 'delivery')}
              className={`min-h-[40px] px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer btn-tactile whitespace-nowrap ${
                active
                  ? 'bg-[#0F172A] text-white shadow-md'
                  : 'text-slate-600 hover:text-[#0F172A] hover:bg-white'
              }`}
            >
              <TabIcon className={`w-3.5 h-3.5 ${active ? 'text-blue-400' : 'text-blue-600'}`} />
              <span>{tab.label}</span>
              {/* Mechanical switch LED: lights up when the tab is engaged */}
              <span
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  active ? 'bg-blue-400 scale-100 shadow-[0_0_8px_rgba(96,165,250,0.9)]' : 'bg-slate-300 scale-50'
                }`}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        <motion.div
          key={dossierTab}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="p-5 sm:p-6"
        >
          {dossierTab === 'specs' && (
            <div className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <tbody className="divide-y divide-[#E2E8F0]">
                  {specRows.map(([key, value]) => (
                    <tr key={key} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-slate-600 bg-slate-50/50 w-2/5">
                        {key}
                      </td>
                      <td className="py-2.5 px-4 text-[#0F172A] font-bold">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {dossierTab === 'blueprint' && hasBlueprint && (
            <button
              type="button"
              onClick={() => setIsZoomOpen(true)}
              className="group w-full relative bg-[#0F172A] rounded-2xl overflow-hidden flex items-center justify-center min-h-[240px] cursor-zoom-in"
              aria-label="Բացել CAD գծագիրը խոշորացված"
            >
              <img
                src={resolveImageUrl(product.blueprintImage)!}
                alt={`${displayTitle(product.title)} CAD գծագիր`}
                className="max-h-[280px] w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-md text-blue-300 text-[10px] font-bold border border-white/20 transition-colors group-hover:bg-white/20 group-hover:text-blue-200">
                <ZoomIn className="w-3.5 h-3.5 transition-transform duration-300 ease-out group-hover:scale-125 group-hover:rotate-[-6deg]" />
                Սեղմե՛ք խոշորացնելու համար
              </span>
            </button>
          )}

          {dossierTab === 'delivery' && (
            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F8FAFC] border border-slate-200">
                <Truck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  <b className="text-[#0F172A]">Առաքում Երևանում.</b> Լրիվ անվճար՝ հենց
                  պատվերի օրը (ժամը 10:00-ից 20:00):
                </p>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F8FAFC] border border-slate-200">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  <b className="text-[#0F172A]">Վերցնել սրահից.</b> ք. Երևան,
                  Մելքումովի 40/1 սրահից՝ անվճար:
                </p>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-950">
                <Wrench className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  <b>Տեղադրման խորհուրդ.</b> Մոնտաժից առաջ խորհուրդ է տրվում լվանալ
                  ջրագծերը՝ խողովակի աղբից քարտրիջը պաշտպանելու համար:
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* CAD Zoom Spotlight Modal (click-to-zoom on blueprint tab) */}
      <AnimatePresence>
        {isZoomOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/80 backdrop-blur-sm"
            onClick={() => setIsZoomOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="CAD գծագիր"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-w-3xl w-full bg-[#0F172A] rounded-3xl border border-slate-700 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <div>
                  <h4 className="font-bold text-sm text-white">{displayTitle(product.title)}</h4>
                  <span className="font-mono text-blue-400 text-xs font-bold">
                    Կոդ: {product.code} • CAD Չափսեր (մմ)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsZoomOpen(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Փակել"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 flex items-center justify-center min-h-[320px]">
                <img
                  src={resolveImageUrl(product.blueprintImage)!}
                  alt={`${displayTitle(product.title)} CAD գծագիր խոշորացված`}
                  className="max-h-[60vh] w-auto object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
