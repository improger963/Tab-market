/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

/**
 * Root error boundary for every segment without a closer `error.tsx`.
 *
 * Same rule as `/account`: the caught `error` object is never rendered. A
 * message thrown deep in a request or a serializer can carry a table name,
 * a token fragment or part of an address, and none of that belongs on a
 * customer-visible screen. The verified generic sentence from the auth copy
 * is shown instead, plus a real retry.
 */
import React from 'react';
import Link from 'next/link';
import { RotateCcw, Home } from 'lucide-react';
import { AUTH_HY } from '@/lib/copy/authHy';
import { ROUTE_HY } from '@/lib/copy/routeHy';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Kept for the debugger only; nothing here reaches the page.
  void error;
  return (
    <div className="container-lux py-16 sm:py-24">
      <div className="bg-white rounded-panel border border-line p-10 sm:p-14 text-center max-w-xl mx-auto space-y-5 shadow-e1">
        <div className="w-20 h-20 rounded-panel bg-accent/5 text-accent flex items-center justify-center mx-auto">
          <RotateCcw className="w-10 h-10" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <p className="text-sm sm:text-base font-bold text-ink tracking-tight leading-relaxed">
            {AUTH_HY.ERR_UNKNOWN}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => reset()}
            className="min-h-[48px] px-8 py-3 rounded-control bg-ink hover:bg-accent-hover text-white text-xs font-semibold transition-all shadow-e1 active:scale-98 cursor-pointer inline-flex items-center justify-center gap-2 btn-tactile"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>{AUTH_HY.RETRY}</span>
          </button>
          <Link
            href="/"
            className="min-h-[48px] px-8 py-3 rounded-control border border-line bg-white text-ink hover:border-ink text-xs font-semibold transition-colors inline-flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>{ROUTE_HY.BACK_TO_HOME}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
