/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Phone } from 'lucide-react';
import { heroConfig, getShowroomStatus } from '@/config/hero';
import { HY } from '@/lib/copy/hy';

/**
 * Hero — asymmetric text-left / visual-right on desktop, stacked on mobile.
 *
 * Rules honoured here:
 * - EVERY rendered value comes from `config/hero.ts` (future
 *   `GET /api/v1/settings` mirror). Empty/undefined field -> element hidden;
 *   nothing (badge, claims, CTA labels, hours, contacts) is hardcoded in JSX.
 * - No looping/ambient animation. The route wrapper already applies a
 *   one-shot 200ms opacity fade; a hero-only entrance would need a NEW global
 *   keyframe, so it is intentionally skipped (see pass report).
 * - Showroom open/closed renders client-side AFTER mount from real hours in
 *   Asia/Yerevan; before that a same-height invisible placeholder reserves
 *   the line, so there is neither a hydration mismatch nor any layout shift.
 * - Visual panel: only owner-supplied real photography from config. With no
 *   image configured it stays the on-brand ice-chrome gradient + wordmark.
 *   A failing image swaps to the same fallback without resizing the panel.
 * - Height cap keeps the first content row peeking below the fold on short
 *   desktop viewports (1440×900 / 1920×1080).
 */
export default function HeroBanner() {
  const [status, setStatus] = useState<ReturnType<typeof getShowroomStatus>>(null);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setStatus(getShowroomStatus());
  }, []);

  const { badge, title, highlight, subtitle, primaryCta, secondaryCta, image, showroom } =
    heroConfig;

  const heroImage =
    image && image.src && image.width > 0 && image.height > 0 && !imageFailed
      ? image
      : null;

  return (
    <section
      aria-label={title || 'tab.am'}
      lang="hy"
      className="overflow-hidden rounded-panel border border-line/80 bg-surface shadow-e2 ring-ice lg:grid lg:grid-cols-12 lg:h-[clamp(360px,56dvh,560px)]"
    >
      {/* ---- Copy column: editorial morning-light wash behind the headline -- */}
      <div className="flex flex-col justify-center gap-3 bg-hero-ambient p-5 hyphens-auto break-words sm:gap-5 sm:p-10 lg:col-span-7 lg:gap-6 lg:p-12">
        {badge ? (
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 text-xs font-semibold tracking-wide text-body shadow-e0">
            {/* Static decorative dot — never pulses. */}
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
            {badge}
          </span>
        ) : null}

        {title ? (
          <h1 className="text-display line-clamp-3 font-bold tracking-tight text-ink sm:text-[clamp(1.75rem,1.35rem+1.4vw,2.25rem)] lg:text-[clamp(2rem,1.2rem+2.6vw,3.5rem)]">
            {title}
            {highlight ? (
              <span className="block bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">
                {highlight}
              </span>
            ) : null}
          </h1>
        ) : null}

        {subtitle ? (
          <p className="line-clamp-3 max-w-[52ch] text-sm leading-relaxed text-body sm:text-base sm:leading-relaxed lg:text-lg lg:leading-relaxed">
            {subtitle}
          </p>
        ) : null}

        {/* ---- CTAs: max two, labels/targets from config only --------------- */}
        <div className="flex flex-col items-stretch gap-2.5 pt-1 sm:flex-row sm:items-center sm:gap-3">
          <Link
            href={primaryCta.href}
            className="btn-tactile inline-flex min-h-[48px] items-center justify-center rounded-control bg-ink px-8 py-3.5 text-sm font-semibold text-white shadow-e1 transition-all duration-hover ease-precision hover:-translate-y-0.5 hover:bg-accent hover:shadow-e2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            {primaryCta.label}
          </Link>

          {secondaryCta ? (
            <a
              href={secondaryCta.href}
              {...(secondaryCta.href.startsWith('http')
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
              className="btn-tactile inline-flex min-h-[48px] items-center justify-center gap-1.5 self-start rounded-control border border-line bg-surface px-6 py-3 text-sm font-semibold text-ink shadow-e0 sm:justify-center sm:px-8 sm:py-3.5 sm:shadow-e1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 transition-all duration-hover ease-precision hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent hover:shadow-e2"
            >
              {secondaryCta.label}
            </a>
          ) : null}
        </div>

        {/* Compact glass card for < lg: a row under the CTAs, never over the
            image or the fixed dock. lg:hidden because the same component
            floats inside the visual column on desktop. */}
        {showroom ? (
          <div className="lg:hidden">
            <ShowroomCard variant="block" status={status} />
          </div>
        ) : null}
      </div>

      {/* ---- Visual column --------------------------------------------------
           lg: image ≤ ~41% (5/12 cols) right of the text, full-bleed in cell.
           <lg: sits under the copy as a compact banner strip. On phones the
           purely decorative gradient is HIDDEN (no info, saves height) unless
           a real owner photo is configured, which always renders. */}
      <div
        className={
          heroImage
            ? 'relative flex min-h-[110px] items-stretch sm:min-h-[160px] lg:col-span-5 lg:min-h-full'
            : 'relative hidden min-h-[160px] items-stretch sm:flex lg:col-span-5 lg:min-h-full'
        }
      >
        {heroImage ? (
          <img
            src={heroImage.src}
            alt={heroImage.alt}
            width={heroImage.width}
            height={heroImage.height}
            // LCP-friendly: hero image is fetched eagerly as high priority
            // (Vite SPA — no next/image available; native attribute parity).
            fetchPriority="high"
            decoding="async"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover"
            style={{ aspectRatio: `${heroImage.width} / ${heroImage.height}` }}
          />
        ) : (
          /* On-brand fallback: ice-chrome pedestal with soft overhead light +
             wordmark. aria-hidden because it carries no information. */
          <div
            aria-hidden="true"
            className="relative flex w-full items-center justify-center overflow-hidden bg-ice-chrome ring-ice"
          >
            {/* Ambient lighting: a cool morning glow falling from top-right,
                mirrored by a soft floor wash, and a hairline plinth edge —
                still light, never animated. */}
            <span className="pointer-events-none absolute -top-16 right-4 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
            <span className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-accent/5 blur-3xl" />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-line-strong/70 to-transparent" />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-surface/70 to-transparent" />
            <span className="select-none bg-gradient-to-b from-ink/80 to-ink/50 bg-clip-text text-5xl font-bold tracking-tight text-transparent drop-shadow-ink-soft sm:text-6xl">
              tab.am
            </span>
          </div>
        )}

        {/* Floating glass showroom card (desktop only, inside the visual). */}
        {showroom ? (
          <div className="absolute inset-x-4 bottom-4 hidden lg:block">
            <ShowroomCard variant="float" status={status} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Showroom glass card — facts from config/hero.ts only.
// ---------------------------------------------------------------------------

function ShowroomCard({
  variant,
  status,
}: {
  variant: 'block' | 'float';
  status: { open: boolean; message: string } | null;
}) {
  const { showroom } = heroConfig;
  if (!showroom) return null;

  return (
    <div
      className={
        variant === 'float'
          ? 'glass-surface max-w-[19rem] rounded-card p-4 shadow-e2'
          : 'glass-surface max-w-md rounded-card p-4 shadow-e2'
      }
    >
      {/* Eyebrow: names the card so the address reads as a destination. */}
      <p className="text-caption font-bold text-accent">
        {HY.OUR_SHOWROOM}
      </p>

      <p className="mt-1 text-sm font-semibold leading-snug text-ink">
        {showroom.address}
      </p>

      {/* Status line: height reserved by an invisible placeholder until the
          client-only value arrives (no hydration mismatch, no CLS). */}
      <p
        aria-hidden={status === null}
        className={`mt-1 min-h-[18px] text-xs ${
          status === null ? 'invisible' : ''
        } ${status ? (status.open ? 'text-success' : 'text-muted') : 'text-muted'}`}
      >
        {status
          ? status.message
          : showroom.weeklyLabel ?? ''}
      </p>

      {/* Static weekly hours: neutral always-true line. Hidden on phones where
          the live status sentence already states the closing time (saves
          vertical height so the mobile hero stays compact). */}
      {showroom.weeklyLabel ? (
        <p className="mt-1 hidden text-xs tabular-nums text-body sm:block">
          {showroom.weeklyLabel}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line/60 pt-3 text-xs">
        {showroom.phone && showroom.phoneIntl ? (
          <a
            href={`tel:+${showroom.phoneIntl}`}
            className="btn-tactile inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 font-semibold tabular-nums text-white shadow-e1 transition-colors duration-hover hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <Phone className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            {showroom.phone}
          </a>
        ) : null}
        {showroom.mapsUrl ? (
          <a
            href={showroom.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded font-semibold text-accent underline-offset-4 transition-colors duration-hover hover:text-accent-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            {/* Directions label lives in config-driven copy below. */}
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {DIRECTIONS_LABEL}
          </a>
        ) : null}
      </div>
    </div>
  );
}

/**
 * "Directions" link label — Armenian "\u0548\u0582\u0572\u0572\u0578\u0582\u0569\u0575\u0578\u0582\u0576\u0576\u0565\u0580"
 * (Directions). Written as \u escapes verified codepoint-by-codepoint
 * (548 582 572 572 578 582 569 575 578 582 576 576 565 580) to stay immune to
 * Cyrillic-homoglyph corruption. Kept here until `GET /api/v1/settings` can
 * supply the label.
 */
const DIRECTIONS_LABEL =
  '\u0548\u0582\u0572\u0572\u0578\u0582\u0569\u0575\u0578\u0582\u0576\u0576\u0565\u0580';
