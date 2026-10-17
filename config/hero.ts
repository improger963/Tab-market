/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Hero banner — single source of truth for every value the homepage hero
 * renders (badge, headline, subtitle, CTA labels/targets, image, showroom
 * facts). The HeroBanner component imports ONLY from this file; nothing is
 * hardcoded in JSX.
 *
 * NOTE FOR THE FUTURE BACKEND: this module is the client-side mirror of the
 * settings payload and will later be hydrated from `GET /api/v1/settings`
 * with the exact same shape. Until then, values here are the only ones the
 * hero is allowed to show. Any field without real, owner-approved data stays
 * undefined/null and the corresponding UI is HIDDEN — never invent a claim.
 */

import { SHOWROOM_INFO, SITE_CLAIMS, isShowroomOpen } from '@/lib/config';
import { HY } from '@/lib/copy/hy';

// ---------------------------------------------------------------------------
// Shape
// ---------------------------------------------------------------------------

export interface HeroConfig {
  /** Short label chip above the headline. Empty/undefined -> chip hidden. */
  badge?: string;
  /** Headline, sentence case. Rendered as the page's single <h1>. */
  title: string;
  /** Optional accent part of the title, rendered in the brand blue. */
  highlight?: string;
  /** Supporting line under the headline. Empty/undefined -> hidden. */
  subtitle?: string;
  /** Main action. Label/href come from config, never from JSX. */
  primaryCta: { label: string; href: string };
  /** Optional second action. Undefined -> only one CTA renders. */
  secondaryCta?: { label: string; href: string };
  /**
   * Real showroom/product photography only (owner-supplied). Undefined ->
   * on-brand ice-chrome gradient fallback panel. No stock imagery, ever.
   */
  image?: {
    src: string;
    alt: string;
    width: number;
    height: number;
    blurDataURL?: string;
  };
  /** Physical-showroom facts driving the glass card. Undefined -> card hidden. */
  showroom?: {
    address: string;
    hours: { open: string; close: string };
    phone: string;
    /** Digits for the tel: href (E.164 without plus). Undefined -> tel hidden. */
    phoneIntl?: string;
    mapsUrl?: string;
    /** Static weekly hours line (SSR-safe fallback under the live status). */
    weeklyLabel?: string;
  };
}

// ---------------------------------------------------------------------------
// Values (until `GET /api/v1/settings` replaces this file)
// ---------------------------------------------------------------------------

/**
 * Current owner-provided values (mapped from lib/config's SITE_CLAIMS /
 * SHOWROOM_INFO, which remain the storage location for shared facts):
 * - title:      SITE_CLAIMS.heroTitlePrefix + heroTitleHighlight, decoded:
 *               "\u0548\u0580\u0561\u056f\u0575\u0561\u056c \u054d\u0561\u0576\u057f\u0565\u056d\u0576\u056b\u056f\u0561\u055d"
 *               + "\u0544\u0565\u056c\u0561\u0576\u0561\u056d\u056b \u0531\u0580\u056a\u0565\u0584\u0578\u057e"
 *               (existing neutral headline — owner review pending)
 * - subtitle:   assortment blurb (faucets / bathroom fittings / shower systems)
 * - badge:      NOT PROVIDED -> hidden. Discount figures, seasonal labels and
 *               similar marketing claims need an owner decision first.
 * - image:      NOT PROVIDED -> gradient fallback. Needs owner decision:
 *               genuine showroom photography (src/alt/dimensions).
 */
export const heroConfig: HeroConfig = {
  badge: SITE_CLAIMS.seasonalBadgeLabel || undefined,
  title: SITE_CLAIMS.heroTitlePrefix || '',
  highlight: SITE_CLAIMS.heroTitleHighlight || undefined,
  subtitle: SITE_CLAIMS.heroSubtitle || undefined,
  primaryCta: { label: HY.VIEW_CATALOG, href: '/catalog' },
  secondaryCta: {
    label: HY.OUR_SHOWROOM,
    href: SHOWROOM_INFO.mapsUrl,
  },
  image: undefined,
  showroom: (() => {
    // Reference schedule = Monday's hours (the published week is uniform;
    // per-day nulls are handled by the live status computation itself).
    const mon = SHOWROOM_INFO.hours[1];
    return {
      address: SHOWROOM_INFO.address,
      hours: { open: mon ? mon.open : '', close: mon ? mon.close : '' },
      phone: SHOWROOM_INFO.phone,
      phoneIntl: SHOWROOM_INFO.phoneIntl,
      mapsUrl: SHOWROOM_INFO.mapsUrl,
      weeklyLabel: SHOWROOM_INFO.hoursLabel,
    };
  })(),
};

// ---------------------------------------------------------------------------
// Live open/closed status (computed client-side only — see HeroBanner)
// ---------------------------------------------------------------------------

/**
 * Armenian status templates built from explicit Unicode codepoints to stay
 * immune to Cyrillic-homoglyph corruption (see scripts/_gen_hero_status_
 * strings.mjs). Interpolated times are ASCII "HH:MM".
 *   OPEN_SENTENCE:   Բաց է մինչև {close}
 *   CLOSED_SENTENCE: Փակ է, բացվում է {open}-ին
 */
const OPEN_SENTENCE = '\u0532\u0561\u0581 \u0567 \u0574\u056B\u0576\u0579\u0587 {close}';
const CLOSED_SENTENCE =
  '\u0583\u0561\u056F \u0567, \u0562\u0561\u0581\u057E\u0578\u0582\u0574 \u0567 {open}-\u056B\u0576';

/** Yerevan-local weekday/today's-time parts (Intl only, no date library). */
function yerevanNow(at: Date): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: SHOWROOM_INFO.timezone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(at);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const dayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  return {
    day: dayMap[get('weekday')] ?? NaN,
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  };
}

const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Full customer-facing status sentence for the hero glass card, evaluated in
 * Asia/Yerevan from SHOWROOM_INFO.hours. Must be called AFTER mount only
 * (client-only; the component renders a static line until then).
 * Returns null when the weekday data is missing so the chip stays hidden.
 */
export function getShowroomStatus(at: Date = new Date()): {
  open: boolean;
  message: string;
} | null {
  // Reuse the canonical boolean from lib/config for open/closed itself.
  const open = isShowroomOpen(at);
  const { day, minutes } = yerevanNow(at);
  const today = SHOWROOM_INFO.hours[day];
  if (!today) return null;

  if (open) {
    return { open: true, message: OPEN_SENTENCE.replace('{close}', today.close) };
  }
  // Before today's opening -> opens today. After closing -> next open day.
  if (minutes < toMin(today.open)) {
    return { open: false, message: CLOSED_SENTENCE.replace('{open}', today.open) };
  }
  for (let offset = 1; offset <= 7; offset += 1) {
    const next = SHOWROOM_INFO.hours[(day + offset) % 7];
    if (next) {
      return { open: false, message: CLOSED_SENTENCE.replace('{open}', next.open) };
    }
  }
  return { open: false, message: CLOSED_SENTENCE.replace('{open}', today.open) };
}
