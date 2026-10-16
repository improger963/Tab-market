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
 */
function arNationalDigits(raw: string): string {
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('374')) d = d.slice(3); // international country code
  if (d.startsWith('0')) d = d.slice(1); // national trunk prefix
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
