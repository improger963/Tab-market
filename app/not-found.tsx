/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Root 404 boundary. Server component: Next renders it with a 404 status for
 * any unmatched path, inside the shared Header/Footer shell. All copy comes
 * from lib/copy/routeHy.ts (corpus-extracted, homoglyph-safe) and mirrors the
 * catalog zero-state design so the page never looks like a foreign template.
 */
import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PackageOpen, Home, LayoutGrid, Phone } from 'lucide-react';
import { ROUTE_HY } from '@/lib/copy/routeHy';
import { PAGES_HY } from '@/lib/copy/pagesHy';
import { business } from '@/config/site';

export const metadata: Metadata = {
  title: ROUTE_HY.NOT_FOUND_DOC_TITLE,
  robots: { index: false, follow: false },
};

export default function NotFound() {
  const phone = business.phones[0];
  return (
    <div className="container-lux py-16 sm:py-24">
      <div className="bg-white rounded-panel border border-line p-10 sm:p-14 text-center max-w-xl mx-auto space-y-5 shadow-e1">
        <div className="w-20 h-20 rounded-panel bg-accent/5 text-accent flex items-center justify-center mx-auto">
          <PackageOpen className="w-10 h-10" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="text-lg sm:text-xl font-bold text-ink tracking-tight">{ROUTE_HY.NOT_FOUND_H1}</h1>
          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            {business.name} · {business.address.line}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3 pt-1">
          <Link
            href="/"
            className="min-h-[48px] px-8 py-3 rounded-control bg-ink hover:bg-accent-hover text-white text-xs font-semibold transition-all shadow-e1 active:scale-98 cursor-pointer inline-flex items-center justify-center gap-2 btn-tactile"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>{ROUTE_HY.BACK_TO_HOME}</span>
          </Link>
          <Link
            href="/catalog"
            className="min-h-[48px] px-8 py-3 rounded-control border border-line bg-white text-ink hover:border-ink text-xs font-semibold transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <LayoutGrid className="w-4 h-4" aria-hidden="true" />
            <span>{ROUTE_HY.CATALOG}</span>
          </Link>
          <a
            href={`tel:${phone.e164}`}
            className="min-h-[48px] px-6 py-3 text-xs font-semibold text-body hover:text-accent transition-colors inline-flex items-center justify-center gap-2 tabular-nums"
          >
            <Phone className="w-4 h-4" aria-hidden="true" />
            <span>{PAGES_HY.CALL_SHOWROOM}</span>
            <span>{phone.display}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
