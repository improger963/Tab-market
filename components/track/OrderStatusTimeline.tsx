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
    <div className="bg-white p-6 sm:p-8 rounded-panel border border-line shadow-e1 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-canvas">
        <div>
          <h2 className="text-base font-bold text-ink ">
            Պատվերի Ընթացքի Ժամանակացույց (Timeline)
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Իրական ժամանակում թարմացվող տվյալներ Մելքումովի 40/1 պահեստից
          </p>
        </div>
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-[11px] sm:before:left-[15px] before:top-3 before:bottom-3 before:w-0.5 before:bg-line-strong">
        {timeline.map((step, idx) => {
          const isCompleted = step.isCompleted;
          const isCurrent = step.isCurrent;

          return (
            <div key={step.id || idx} className="relative flex items-start gap-4 group">
              {/* Stepper Dot Icon */}
              <div
                className={`absolute -left-6 sm:-left-8 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all z-10 shadow-e1 ${
 isCurrent
 ? 'bg-accent text-white ring-4 ring-accent/20 scale-110'
 : isCompleted
 ? 'bg-success text-white'
 : 'bg-canvas text-muted border border-line'
 }`}
              >
                {isCurrent ? (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                ) : isCompleted ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" aria-hidden="true" />
                ) : (
                  <Circle className="w-3 h-3 text-muted" aria-hidden="true" />
                )}
              </div>

              {/* Step Info Content */}
              <div
                className={`flex-1 p-4 rounded-panel border transition-all ${
 isCurrent
 ? 'bg-accent/5 border-accent shadow-e1'
 : isCompleted
 ? 'bg-canvas border-line'
 : 'bg-white border-canvas opacity-60'
 }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <h3
                    className={`text-xs sm:text-sm font-bold ${
 isCurrent ? 'text-ink' : isCompleted ? 'text-ink' : 'text-muted'
 }`}
                  >
                    {step.title}
                  </h3>
                  {step.timestamp && (
                    <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-muted bg-white px-2 py-0.5 rounded border border-line">
                      <Clock className="w-3 h-3 text-accent" aria-hidden="true" />
                      {step.timestamp}
                    </span>
                  )}
                </div>
                <p className="text-xs text-body leading-relaxed">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
