import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes with clsx conditionals without class collisions.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Returns the customer-facing product title. Product records store an internal
 * title with a trailing "(ԿՈԴ 12345)" code suffix for staff convenience; the
 * code is shown separately as a "Կոդ" chip, so it is stripped from every
 * displayed title (cards, cart, checkout, PDP, breadcrumbs, search). The raw
 * value in the data is left untouched — this is display formatting only.
 */
export function displayTitle(title: string): string {
  return title
    .replace(/\s*[（(]\s*ԿՈԴ[^）)]*[）)]\s*$/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Showroom unit counts exist only where the price list really carries a number.
 * The assortment file prices the catalogue but does not publish per-address
 * stock, so `null` means "no unit claim may be shown" rather than "zero".
 */
export function stockUnits(stockQuantity: number | undefined | null): number | null {
  return typeof stockQuantity === 'number' && stockQuantity > 0 ? stockQuantity : null;
}

/**
 * Largest quantity the stock data still allows an order for. Infinity when the
 * data carries no count: nothing may be asserted about a limit that is unknown.
 */
export function stockCap(stockQuantity: number | undefined | null): number {
  return stockUnits(stockQuantity) ?? Infinity;
}

/**
 * Formats an amount into Armenian Dram (֏ / AMD) with tabular digits,
 * space thousand separators, and non-breaking space (\u00A0).
 * Money is always an integer amount; e.g. 2200 -> "2 200 ֏".
 */
export function formatAMD(price: number): string {
  if (!Number.isFinite(price)) return `0\u00A0֏`;
  const rounded = Math.round(price);
  const sign = rounded < 0 ? '-' : '';
  const grouped = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
  return `${sign}${grouped}\u00A0֏`;
}

/**
 * Extracts the 8 Armenian national digits from any raw input, robustly
 * stripping the international prefix (`+374`/`374`) and the common trunk
 * leading zero. Examples: "095530435" and "+37495530435" → "95530435".
 *
 * The trunk zero is dropped only when nine digits are left: `0` + 8 national
 * digits is how a number is written from inside the country. An eight-digit
 * national number keeps its own digits, even when the first happens to be a 0 —
 * otherwise the value the app formatted could never be re-read by the validator.
 */
function arNationalDigits(raw: string): string {
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('374')) d = d.slice(3); // international country code
  if (d.length === 9 && d.startsWith('0')) d = d.slice(1); // national trunk prefix
  return d.slice(0, 8);
}

/**
 * Progressive auto-formatter for Armenian phone numbers.
 * Accepts raw input (optionally with +374 country code or a leading trunk 0)
 * and renders the `+374 (XX) XX-XX-XX` grouping on the 8 local digits, e.g.
 * "095530435" -> "(95) 53-04-35".
 */
export function formatArPhone(raw: string): string {
  const d = arNationalDigits(raw);
  if (d.length === 0) return '';
  let out = `(${d.slice(0, 2)}`;
  if (d.length <= 2) return out;
  out += `) ${d.slice(2, 4)}`;
  if (d.length <= 4) return out;
  out += `-${d.slice(4, 6)}`;
  if (d.length <= 6) return out;
  out += `-${d.slice(6, 8)}`;
  return out;
}

/**
 * Normalizes an Armenian phone value to the canonical `+374 (XX) XX-XX-XX`
 * form for submission. Returns null when fewer than the required 8 local
 * digits are present (after stripping `+374` and any leading trunk `0`).
 */
export function normalizeArPhone(input: string): string | null {
  const d = arNationalDigits(input);
  if (d.length !== 8) return null;
  return `+374 (${d.slice(0, 2)}) ${d.slice(2, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
}

/**
 * Masks an E.164 Armenian number for display in shared UI (header, dropdowns,
 * any text that is rendered before the customer asked to see their own number).
 * Only the last 4 local digits survive; anything unrecognized degrades to a
 * fully masked token rather than leaking a partial string.
 *   '+37495530435' -> '+374 (**) **-04-35'
 */
export function maskPhone(e164: string | null | undefined): string {
  const d = (e164 ?? '').replace(/\D/g, '').replace(/^374/, '');
  if (d.length !== 8) return '+374 (**) **-**-**';
  return `+374 (**) **-${d.slice(4, 6)}-${d.slice(6, 8)}`;
}

/**
 * Fixed `dd.MM.yyyy` for order dates. Deliberately not `toLocaleString`: a
 * locale-dependent date changes between the server-rendered snapshot and the
 * client, and a customer comparing two orders should never see two formats.
 */
export function formatDateDDMMYYYY(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

