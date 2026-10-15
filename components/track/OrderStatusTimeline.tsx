/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import { Check, Clock, Circle } from 'lucide-react';
import { OrderTrackingStep } from '@/types/api';

interface OrderStatusTimelineProps {
  timeline: OrderTrackingStep[];
}

export default function OrderStatusTimeline({ timeline }: OrderStatusTimelineProps) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E8F0] shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-black text-[#0F172A] uppercase tracking-wider">
            Պատվերի Ընթացքի Ժամանակացույց (Timeline)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Իրական ժամանակում թարմացվող տվյալներ Մելքումովի 40/1 պահեստից
          </p>
        </div>
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-[11px] sm:before:left-[15px] before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {timeline.map((step, idx) => {
          const isCompleted = step.isCompleted;
          const isCurrent = step.isCurrent;

          return (
            <div key={step.id || idx} className="relative flex items-start gap-4 group">
              {/* Stepper Dot Icon */}
              <div
                className={`absolute -left-6 sm:-left-8 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all z-10 shadow-xs ${
                  isCurrent
                    ? 'bg-[#2563EB] text-white ring-4 ring-blue-500/20 scale-110'
                    : isCompleted
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-400 border border-slate-300'
                }`}
              >
                {isCurrent ? (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                ) : isCompleted ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" aria-hidden="true" />
                ) : (
                  <Circle className="w-3 h-3 text-slate-400" aria-hidden="true" />
                )}
              </div>

              {/* Step Info Content */}
              <div
                className={`flex-1 p-4 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-blue-50/70 border-blue-300 shadow-xs'
                    : isCompleted
                    ? 'bg-[#F8FAFC] border-[#E2E8F0]'
                    : 'bg-white border-slate-100 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <h3
                    className={`text-xs sm:text-sm font-black ${
                      isCurrent ? 'text-[#0F172A]' : isCompleted ? 'text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    {step.title}
                  </h3>
                  {step.timestamp && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      <Clock className="w-3 h-3 text-blue-600" aria-hidden="true" />
                      {step.timestamp}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
