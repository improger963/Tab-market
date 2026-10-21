/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The only gateway to the raw catalog data (Phase 3 data/server boundary).
 *
 * `data/products.json` (2.2 MB, 1647 SKUs) may never reach a client bundle:
 * every consumer goes through this module (server runtime) or through the
 * `/api/v1/*` handlers + `lib/clientCatalog.ts` (browser). The ESLint
 * `no-restricted-imports` guard in `eslint.config.mjs` enforces it.
 *
 * Lookup semantics intentionally mirror the shipped predicates (first match in
 * price-list order over `slug || code`) so route behavior cannot drift.
 */
import 'server-only';
import type { BrandEntry } from '@/data/brands';
import type { Category, Product } from '@/types';
import { products } from '@/data/products';
import { categories as staticCategories } from '@/data/categories';
import { brands, brandBySlug } from '@/data/brands';

/** Full live price list, in catalogue (SKU) order. Do not mutate. */
export function allProducts(): readonly Product[] {
  return products;
}

/** Product page lookup: slug only (the page has always been slug-exact). */
export function findProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

/** Product API dual-mode lookup: slug first, then article code. */
export function findProductByKey(key: string): Product | undefined {
  return products.find((p) => p.slug === key || p.code === key);
}

/**
 * Category taxonomy with counts recomputed from the live catalog, so any
 * customer-facing count served from the network layer is true at render time.
 */
let enrichedCategories: Category[] | null = null;
export function categoriesWithCounts(): Category[] {
  if (!enrichedCategories) {
    const counts = new Map<string, number>();
    for (const p of products) {
      counts.set(p.categorySlug, (counts.get(p.categorySlug) ?? 0) + 1);
    }
    enrichedCategories = staticCategories.map((cat) => ({
      ...cat,
      itemCount: counts.get(cat.slug) ?? 0,
    }));
  }
  return enrichedCategories;
}

export function findCategoryBySlug(slug: string): Category | undefined {
  return categoriesWithCounts().find((c) => c.slug === slug);
}

/** Brand taxonomy (9 KB static file; safe for the client too). */
export function allBrands(): readonly BrandEntry[] {
  return brands;
}

export function findBrandBySlug(slug: string): BrandEntry | undefined {
  return brandBySlug.get(slug);
}
