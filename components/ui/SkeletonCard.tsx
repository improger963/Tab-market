/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 flex flex-col justify-between overflow-hidden shadow-xs animate-pulse">
      {/* Top Image Pedestal Placeholder */}
      <div className="relative aspect-square bg-slate-100 m-1.5 sm:m-2 rounded-xl overflow-hidden">
        {/* Top-left badge placeholder */}
        <div className="absolute top-2 left-2 w-12 h-5 bg-slate-200 rounded-md" />
        {/* Top-right icon placeholders */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <div className="w-8 h-8 rounded-full bg-slate-200" />
          <div className="w-8 h-8 rounded-full bg-slate-200" />
        </div>
      </div>

      {/* Info Body Area */}
      <div className="p-2.5 sm:p-4 pt-0 sm:pt-1 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Brand & Rating */}
          <div className="flex items-center justify-between">
            <div className="w-16 h-3 bg-slate-200 rounded" />
            <div className="w-10 h-3 bg-slate-200 rounded" />
          </div>

          {/* Title lines */}
          <div className="space-y-1.5 pt-1">
            <div className="w-full h-4 bg-slate-200 rounded" />
            <div className="w-2/3 h-4 bg-slate-200 rounded" />
          </div>

          {/* ArmSoft SKU Badge placeholder */}
          <div className="w-24 h-5 bg-slate-100 rounded-md mt-1" />
        </div>

        {/* Price & Action Bar */}
        <div className="pt-2 sm:pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="w-24 h-5 bg-slate-300 rounded" />
              <div className="w-16 h-3 bg-slate-200 rounded" />
            </div>
            <div className="w-10 h-10 sm:w-24 sm:h-10 rounded-xl bg-slate-200 shrink-0" />
          </div>

          {/* Rocket line estimate pill placeholder */}
          <div className="w-full h-6 bg-slate-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
