/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, MapPin, Phone, Store } from 'lucide-react';
import { SHOWROOM_INFO, SITE_CLAIMS, isShowroomOpen } from '@/lib/config';
import { HY } from '@/lib/copy/hy';

/**
 * Hero — asymmetric, text-left / visual-right on desktop, stacked on mobile.
 *
 * Rules honoured here:
 * - All copy renders from SITE_CLAIMS / HY only; badge and subtitle are
 *   HIDDEN when the config value is empty (no invented marketing claims).
 * - No auto-rotating carousel and no ambient animation: at most zero
 *   continuous animations on this screen (the only beacon in the app is the
 *   PDP WhatsApp button).
 * - Showroom open/closed is computed client-side AFTER mount from real hours
 *   in Asia/Yerevan (no hydration mismatch); the static hours line is the
 *   server-rendered fallback.
 * - Visual panel is the ice-chrome gradient placeholder — genuine showroom
 *   photography must be supplied by the owner before any image replaces it
 *   (no unrelated stock photos).
 */
export default function HeroBanner() {
  // null = not computed yet (SSR + first paint) -> only static hours render.
  const [openNow, setOpenNow] = useState<boolean | null>(null);

  useEffect(() => {
    setOpenNow(isShowroomOpen());
  }, []);

  const headline = SITE_CLAIMS.heroTitlePrefix || SITE_CLAIMS.heroTitleHighlight;
  const highlight =
    SITE_CLAIMS.heroTitlePrefix && SITE_CLAIMS.heroTitleHighlight
      ? SITE_CLAIMS.heroTitleHighlight
      : '';

  return (
    <section
      aria-label={HY.OUR_SHOWROOM}
      className="overflow-hidden rounded-panel border border-line bg-surface shadow-e1"
    >
      <div className="grid items-stretch lg:grid-cols-12">
        {/* ---- Copy column ---------------------------------------------------- */}
        <div className="flex flex-col justify-center gap-5 p-6 sm:p-10 lg:col-span-7 lg:p-12">
          {SITE_CLAIMS.seasonalBadgeLabel ? (
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-canvas px-3 py-1.5 text-xs font-semibold text-body">
              <SparkleDot />
              {SITE_CLAIMS.seasonalBadgeLabel}
            </span>
          ) : null}

          <h1 className="text-display text-ink">
            {headline}
            {highlight ? <span className="block">{highlight}</span> : null}
          </h1>

          {SITE_CLAIMS.heroSubtitle ? (
            <p className="max-w-2xl text-base leading-relaxed text-body sm:text-lg">
              {SITE_CLAIMS.heroSubtitle}
            </p>
          ) : null}

          {/* Max two CTAs: catalog (primary) + directions (secondary). */}
          <div className="flex flex-col items-stretch gap-3 pt-1 sm:flex-row sm:items-center">
            <Link
              href="/catalog"
              className="btn-tactile inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-control bg-ink px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-hover ease-precision hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              <span>{HY.VIEW_CATALOG}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>

            <a
              href={SHOWROOM_INFO.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-tactile inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-control border border-line bg-surface px-7 py-3.5 text-sm font-semibold text-ink transition-colors duration-hover ease-precision hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              <MapPin className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <span>{HY.OUR_SHOWROOM}</span>
            </a>
          </div>

          {/* ---- Glass "showroom" card (facts from config only) ------------ */}
          <div className="glass-surface mt-1 max-w-md rounded-card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
                <Store className="h-4 w-4 text-accent" aria-hidden="true" />
                {HY.OUR_SHOWROOM}
              </span>
              {openNow !== null ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-body">
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 rounded-full ${
 openNow ? 'bg-success' : 'bg-line-strong'
 }`}
                  />
                  {openNow ? HY.OPEN : HY.CLOSED}
                </span>
              ) : null}
            </div>

            <dl className="mt-3 space-y-2 text-xs text-body sm:text-sm">
              <div className="flex items-start gap-2">
                <dt className="sr-only">{HY.SHOWROOM}</dt>
                <dd className="inline-flex items-start gap-2">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
                  <a
                    href={SHOWROOM_INFO.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded underline-offset-4 transition-colors duration-hover hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                  >
                    {SHOWROOM_INFO.address}
                  </a>
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <dt className="sr-only">{SHOWROOM_INFO.hoursLabel}</dt>
                <dd className="inline-flex items-center gap-2 tabular-nums">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
                  {SHOWROOM_INFO.hoursLabel}
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <dt className="sr-only">{HY.CALL}</dt>
                <dd className="inline-flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
                  <a
                    href={`tel:+${SHOWROOM_INFO.phoneIntl}`}
                    className="rounded font-semibold text-ink tabular-nums underline-offset-4 transition-colors duration-hover hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                  >
                    {SHOWROOM_INFO.phone}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* ---- Visual column: ice-chrome placeholder panel -------------------
            Real showroom/product photography (owner-supplied) should replace
            this panel. Until then NO stock imagery is rendered. ------------- */}
        <div
          aria-hidden="true"
          className="relative flex min-h-[200px] items-center justify-center bg-ice-chrome ring-ice sm:min-h-[260px] lg:col-span-5 lg:min-h-full"
        >
          <span className="select-none text-5xl font-bold tracking-tight text-ink/80 sm:text-6xl">
            tab.am
          </span>
          <span className="pointer-events-none absolute inset-x-6 bottom-6 h-px bg-line-strong/60" />
        </div>
      </div>
    </section>
  );
}

/** Static decorative dot for the optional seasonal badge. */
function SparkleDot() {
  return (
    <span
      aria-hidden="true"
      className="h-1.5 w-1.5 rounded-full bg-accent"
    />
  );
}
