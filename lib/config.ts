/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Centralized, single-source-of-truth configuration for values that appear
 * across the customer UI. Anything here is the ONLY place these facts are
 * defined so they can be adjusted, self-hosted, or removed in one edit.
 *
 * Values default to `null` / empty when there is no real backing data source
 * in the project. Consumers MUST hide the related UI when these are null/empty
 * (never invent a claim to fill the gap).
 */

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------

/**
 * Host/base for self-hosted product imagery. Product records store either a
 * full URL or a path relative to this base. Left empty means "the data already
 * contains a fully-resolved URL or no image at all". Set this to the tab.am
 * asset host once product photography is migrated to first-party storage.
 */
export const IMAGE_BASE: string = '';

/**
 * Third-party stock-photo hosts that are NOT real product photography. The
 * catalog was seeded with unrelated Unsplash placeholder pictures (a living-room
 * photo on a shower head, etc.). Rendering those would misrepresent the product,
 * so they are treated as "no image" everywhere and the neutral placeholder shows
 * until genuine tab.am photography replaces them.
 */
const UNTRUSTED_STOCK_HOSTS = ['images.unsplash.com', 'res.cloudinary.com/unsplash'];

/** Resolve a stored image reference against IMAGE_BASE. */
export function resolveImageUrl(src: string | undefined | null): string | null {
  if (!src) return null;
  if (UNTRUSTED_STOCK_HOSTS.some((host) => src.includes(host))) return null;
  if (/^(https?:)?\/\//.test(src) || src.startsWith('data:')) return src;
  if (!IMAGE_BASE) return src;
  return `${IMAGE_BASE.replace(/\/$/, '')}/${src.replace(/^\//, '')}`;
}

// ---------------------------------------------------------------------------
// Delivery
// ---------------------------------------------------------------------------

/**
 * Single source of truth for shipping logic. The live UI previously showed a
 * contradiction (a free-delivery progress bar, a "Անվճար" chip, and a TopBar
 * "free across Yerevan" claim all at once). This resolves it:
 *
 * - `yerevanFreeAlways: true`  -> local delivery has NO minimum, the cart
 *   progress bar and any "add more for free delivery" copy must be removed.
 * - `yerevanFreeAlways: false` -> a `threshold` (in AMD) applies and TopBar
 *   copy claiming blanket-free delivery is inaccurate.
 *
 * The showroom pickup option is always free regardless of the above.
 */
export const DELIVERY_CONFIG = {
  yerevanFreeAlways: true,
  /** Used only when yerevanFreeAlways === false. */
  threshold: null as number | null,
  /** Flat regional (outside Yerevan) courier cost, AMD. */
  regionalCost: 1500,
  /** Showroom pickup is free. */
  pickupCost: 0,
  pickupAddress: 'Մելքումովի 40/1',
} as const;

// ---------------------------------------------------------------------------
// Showroom facts (single source of truth for address / hours / contacts)
// ---------------------------------------------------------------------------

/**
 * Real-world showroom facts rendered in the hero card, TopBar, footer and
 * delivery copy. Hours drive the open/closed indicator, which is computed
 * client-side in Asia/Yerevan to avoid any hydration mismatch.
 */
export const SHOWROOM_INFO = {
  /** Display address (Armenian), as customers know it. */
  address: '\u0535\u0580\u0587\u0561\u0576, \u0544\u0565\u056c\u0584\u0578\u0582\u0574\u0578\u057e\u056b 40/1',
  /** Google Maps directions link. */
  mapsUrl: 'https://maps.google.com/?q=Yerevan+Melkumovi+40/1',
  /** Public phone (display form). */
  phone: '095 53-04-35',
  /** Phone in international dialing form, used for wa.me / tel links. */
  phoneIntl: '37495530435',
  /** IANA timezone the opening hours are defined in. */
  timezone: 'Asia/Yerevan',
  /**
   * Opening hours per weekday (JS getDay: 0 = Sunday … 6 = Saturday).
   * `null` = closed that day. Times are "HH:MM"–"HH:MM" local to `timezone`.
   * Mon–Sun 10:00–20:00 per the published TopBar schedule.
   */
  hours: {
    0: { open: '10:00', close: '20:00' },
    1: { open: '10:00', close: '20:00' },
    2: { open: '10:00', close: '20:00' },
    3: { open: '10:00', close: '20:00' },
    4: { open: '10:00', close: '20:00' },
    5: { open: '10:00', close: '20:00' },
    6: { open: '10:00', close: '20:00' },
  } as Record<number, { open: string; close: string } | null>,
  /** Human-readable hours line for static/fallback rendering. */
  hoursLabel: '\u0535\u0580\u056f-\u053f\u056b\u0580\u0561\u056f\u056b\u055d 10:00 - 20:00',
} as const;

/**
 * Whether the showroom is open at the given instant, evaluated in the
 * showroom's own timezone (Intl API — no date library dependency).
 */
export function isShowroomOpen(at: Date = new Date()): boolean {
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
  const day = dayMap[get('weekday')] ?? NaN;
  const today = SHOWROOM_INFO.hours[day];
  if (!today) return false;
  const minutes = Number(get('hour')) * 60 + Number(get('minute'));
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  return minutes >= toMin(today.open) && minutes < toMin(today.close);
}

// ---------------------------------------------------------------------------
// Site-level claims (no per-product data source -> hidden until provided)
// ---------------------------------------------------------------------------

/**
 * Marketing/timing claims that are NOT backed by product data. They are kept
 * here so the owner can enable them from one place. When a value is null or an
 * empty string, the corresponding UI is hidden entirely.
 */
export const SITE_CLAIMS = {
  /** Hero seasonal badge label. Empty -> badge hidden. */
  seasonalBadgeLabel: '',
  /** Hero headline discount percentage. null -> no discount headline. */
  heroDiscountPct: null as number | null,
  /** Promised Yerevan dispatch window in hours. null -> copy hidden. */
  deliveryTimeHours: null as number | null,
  /** Hero headline prefix. Empty -> component falls back to a neutral title. */
  heroTitlePrefix: '\u0548\u0580\u0561\u056f\u0575\u0561\u056c \u054d\u0561\u0576\u057f\u0565\u056d\u0576\u056b\u056f\u0561\u055d',
  /** Hero headline highlight (second line). */
  heroTitleHighlight: '\u0544\u0565\u056e\u0561\u056e\u0561\u056d\u056b \u0531\u0580\u056a\u0565\u0584\u0578\u057e',
  /** Hero subtitle. Empty -> hidden. */
  heroSubtitle:
    '\u0535\u057e\u0580\u0578\u057a\u0561\u056f\u0561\u0576 \u057d\u057f\u0561\u0576\u0564\u0561\u0580\u057f\u056b \u056e\u0578\u0580\u0561\u056f\u0576\u0565\u0580, \u0581\u0576\u0581\u0578\u0582\u0572\u0561\u0575\u056b\u0576 \u0570\u0561\u0574\u0561\u056f\u0561\u0580\u0563\u0565\u0580 \u0587 \u056c\u0578\u0563\u0561\u0580\u0561\u0576\u056b \u056f\u0561\u0570\u0578\u0582\u0575\u0584\u055d \u0561\u0576\u0574\u056b\u057b\u0561\u057a\u0565\u057d \u0576\u0565\u0580\u0574\u0578\u0582\u056e\u0578\u0572\u056b\u0581\u0589 \u054a\u0561\u0577\u057f\u0578\u0576\u0561\u056f\u0561\u0576 \u0565\u0580\u0561\u0577\u056d\u056b\u0584\u0578\u057e \u0587 \u0561\u0576\u057e\u0573\u0561\u0580 \u0561\u057c\u0561\u0584\u0578\u0582\u0574\u0578\u057e \u0535\u0580\u0587\u0561\u0576\u0578\u0582\u0574\u0589',
} as const;

