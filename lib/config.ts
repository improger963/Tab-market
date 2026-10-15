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
} as const;
