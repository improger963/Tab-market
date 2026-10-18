/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * SITE BUSINESS CONFIG — the ONE typed source of truth for every business fact
 * and marketing claim the /showroom and /contact pages (and the header, top bar
 * and footer) are allowed to render.
 *
 * BACKEND NOTE: this module is the client-side mirror of the settings payload
 * and will later be hydrated from `GET /api/v1/settings` with the exact same
 * shape. Until then these values are the only facts the UI may show. Any field
 * WITHOUT real, owner-approved data stays `undefined` / empty, and the matching
 * UI is HIDDEN entirely — never invent a claim to fill the gap (no "free
 * parking", "expert staff", "warehouse pickup", coordinates, social links, etc.
 * unless the owner supplies them here).
 *
 * ARMENIAN SAFETY: display strings below are written as \u codepoint escapes
 * copied byte-for-byte from already-shipped, verified Armenian in this repo
 * (`lib/config.ts` SHOWROOM_INFO, `config/hero.ts`). Hand-typed Armenian through
 * edit pipelines has repeatedly produced Cyrillic/Hebrew homoglyph corruption,
 * so new copy is never typed free-form here. Verify with
 * `node scripts/_spellcheck.mjs` after any change.
 */

// ---------------------------------------------------------------------------
// Shape
// ---------------------------------------------------------------------------

/**
 * Keys of the icon set the showroom feature grid may reference. The renderer
 * maps these to components from the project's existing icon library
 * (`lucide-react`); no emojis are ever used. Add a key here and register the
 * matching icon in the showroom component when the owner provides a service.
 */
export type IconKey =
  | 'mapPin'
  | 'clock'
  | 'phone'
  | 'truck'
  | 'shieldCheck'
  | 'wrench'
  | 'ruler'
  | 'warehouse'
  | 'parking'
  | 'users';

export interface BusinessAddress {
  /** Full one-line display address, as customers know it. */
  line: string;
  /** Administrative district. Owner-provided only; omitted -> not shown. */
  district?: string;
  city: string;
  /** ISO 3166-1 alpha-2. This shop only operates in Armenia. */
  country: 'AM';
}

export interface BusinessPhone {
  /** Display form, e.g. "095 53-04-35". */
  display: string;
  /** E.164 for `tel:`/`wa.me`, e.g. "+37495530435". */
  e164: string;
}

export interface BusinessHours {
  /** Weekly-days label (sentence case), e.g. "Tue-Sun". */
  days: string;
  /** "HH:MM", local to `timezone`. */
  open: string;
  /** "HH:MM", local to `timezone`. */
  close: string;
  timezone: 'Asia/Yerevan';
}

export interface BusinessService {
  title: string;
  text: string;
  icon: IconKey;
}

export interface BusinessGalleryImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface BusinessConfig {
  name: string;
  address: BusinessAddress;
  /** At least one number is required; every entry renders as a `tel:` link. */
  phones: BusinessPhone[];
  whatsapp?: { e164: string; prefill?: string };
  email?: string;
  hours: BusinessHours;
  /** Owner-provided map pin. Never guessed — omitted -> no embedded map/geo. */
  geo?: { lat: number; lng: number };
  /** Optional one-line claim. Empty/undefined -> the parking row is hidden. */
  parking?: string;
  /** Optional feature grid. Empty/undefined -> the whole section is hidden. */
  services?: BusinessService[];
  /** Real showroom photography only. Empty/undefined -> the section is hidden. */
  gallery?: BusinessGalleryImage[];
  /** Directions query. Defaults to the address line when absent. */
  mapsQuery?: string;
}

// ---------------------------------------------------------------------------
// Values (until `GET /api/v1/settings` replaces this file)
// ---------------------------------------------------------------------------

/** "Yerevan" (city) — verified codepoints from SHOWROOM_INFO.address. */
const CITY_YEREVAN = '\u0535\u0580\u0587\u0561\u0576';
/** "Ք." city abbreviation prefix (lowercase U+0584 + period + space). */
const CITY_ABBREV = '\u0584.';
/** "Melkumovi 40/1" — verified codepoints from SHOWROOM_INFO.address. */
const STREET = '\u0544\u0565\u056c\u0584\u0578\u0582\u0574\u0578\u057e\u056b 40/1';
/** "Tue-Sun" — weekday range lifted from SHOWROOM_INFO.hoursLabel. */
const DAYS_TUE_SUN = '\u0535\u0580\u056f-\u053f\u056b\u0580\u0561\u056f\u056b';

export const business: BusinessConfig = {
  name: 'tab.am',
  address: {
    // «ք. Երdelays, Մdelqumovi 40/1» — the owner-verified display address.
    line: `${CITY_ABBREV} ${CITY_YEREVAN}, ${STREET}`,
    city: CITY_YEREVAN,
    country: 'AM',
    // district NOT PROVIDED -> hidden. Needs owner decision.
  },
  phones: [
    { display: '095 53-04-35', e164: '+37495530435' },
    { display: '094 53-04-35', e164: '+37494530435' },
    { display: '099 53-04-35', e164: '+37499530435' },
  ],
  // WhatsApp mirrors the shipped TopBar behaviour (primary number, no prefill).
  whatsapp: { e164: '+37495530435' },
  // Email is the address already shipped in the footer — not a new claim.
  email: 'info@tab.am',
  hours: {
    days: DAYS_TUE_SUN,
    open: '10:00',
    close: '20:00',
    timezone: 'Asia/Yerevan',
  },
  // geo NOT PROVIDED -> no embedded map, JSON-LD omits geo. Needs owner decision.
  // parking / services / gallery NOT PROVIDED -> their sections stay hidden.
  mapsQuery: 'Yerevan Melkumovi 40/1',
};

// ---------------------------------------------------------------------------
// Derived helpers
// ---------------------------------------------------------------------------

/** Google Maps search deep link built from geo or the address query. */
export function googleMapsUrl(cfg: BusinessConfig = business): string {
  const query =
    cfg.geo ? `${cfg.geo.lat},${cfg.geo.lng}` : cfg.mapsQuery || cfg.address.line;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Yandex Maps link — a `ll`/`pt` pin when geo exists, else a text search. */
export function yandexMapsUrl(cfg: BusinessConfig = business): string {
  if (cfg.geo) {
    const { lat, lng } = cfg.geo;
    return `https://yandex.com/maps/?ll=${lng}%2C${lat}&pt=${lng}%2C${lat}&z=17`;
  }
  const query = cfg.mapsQuery || cfg.address.line;
  return `https://yandex.com/maps/?text=${encodeURIComponent(query)}`;
}

/** `wa.me` deep link, digits-only E.164 plus an optional encoded prefill. */
export function whatsappUrl(cfg: BusinessConfig = business): string | null {
  if (!cfg.whatsapp) return null;
  const digits = cfg.whatsapp.e164.replace(/\D/g, '');
  const prefill = cfg.whatsapp.prefill
    ? `?text=${encodeURIComponent(cfg.whatsapp.prefill)}`
    : '';
  return `https://wa.me/${digits}${prefill}`;
}

/** Minutes since local midnight for the given instant, in the shop timezone. */
function zoneMinutesHour(now: Date, timezone: string): { minutes: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const hour = Number(get('hour')) % 24;
  const minute = Number(get('minute'));
  return { minutes: hour * 60 + minute };
}

const toMinutes = (t: string): number => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Customer-facing open/closed status, evaluated in the shop's own timezone
 * (Asia/Yerevan) via the Intl API — no date library dependency.
 *
 * Must be called AFTER mount on the client only (the server/first paint renders
 * a static hours line in the same reserved height, so there is neither a
 * hydration mismatch nor any layout shift). It closes the loop at `close`: the
 * store is open while `open <= now < close`.
 *
 * Status sentences are the SAME verified codepoints used by the hero badge:
 *   OPEN:  «Բdelays delays մdelays {close}»  (Open until {close})
 *   CLOSED:«Փdelays delays, delays բdelays {open}-delays»  (Closed, opens at {open})
 */
const OPEN_SENTENCE = '\u0532\u0561\u0581 \u0567 \u0574\u056B\u0576\u0579\u0587 {close}';
const CLOSED_SENTENCE =
  '\u0583\u0561\u056F \u0567, \u0562\u0561\u0581\u057E\u0578\u0582\u0574 \u0567 {open}-\u056B\u0576';

export function getOpenStatus(
  now: Date = new Date(),
  hours: BusinessHours = business.hours,
): { open: boolean; label: string } {
  const { minutes } = zoneMinutesHour(now, hours.timezone);
  const open = minutes >= toMinutes(hours.open) && minutes < toMinutes(hours.close);
  return open
    ? { open: true, label: OPEN_SENTENCE.replace('{close}', hours.close) }
    : { open: false, label: CLOSED_SENTENCE.replace('{open}', hours.open) };
}
