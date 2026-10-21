/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Catalog contract (Phase 3): the static taxonomy files bake their counts at
 * import time, while `server/catalog.ts` recomputes them live. This test is
 * the parity lock promised in `data/categories.ts` / `data/brands.ts` header
 * comments: baked truth and live truth must never disagree, and the gateway's
 * lookup semantics must keep matching the predicates the routes ship.
 */
import { describe, expect, it } from 'vitest';
import { products } from '@/data/products';
import { categories } from '@/data/categories';
import { brands, brandBySlug } from '@/data/brands';
import {
  allProducts,
  categoriesWithCounts,
  findBrandBySlug,
  findCategoryBySlug,
  findProductByKey,
  findProductBySlug,
} from '@/server/catalog';

function liveCategoryCounts(): Map<string, number> {
  const counts = new Map<string, number>();
  for (const p of products) {
    counts.set(p.categorySlug, (counts.get(p.categorySlug) ?? 0) + 1);
  }
  return counts;
}

function liveBrandCounts(): Map<string, number> {
  const counts = new Map<string, number>();
  for (const p of products) {
    if (p.brand) counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1);
  }
  return counts;
}

describe('static taxonomy parity', () => {
  it('baked category itemCount matches the live price list', () => {
    const live = liveCategoryCounts();
    for (const cat of categories) {
      expect(cat.itemCount, `category ${cat.slug}`).toBe(live.get(cat.slug) ?? 0);
    }
    // No orphan categories: the sums must both equal the full SKU count.
    const bakedSum = categories.reduce((s, c) => s + c.itemCount, 0);
    expect(bakedSum).toBe(products.length);
  });

  it('baked brand count matches the live price list', () => {
    const live = liveBrandCounts();
    for (const brand of brands) {
      expect(brand.count, `brand ${brand.name}`).toBe(live.get(brand.name) ?? 0);
    }
    // Every branded listing maps to a page that can actually render it.
    for (const name of live.keys()) {
      expect(brands.some((b) => b.name === name), `brand ${name} missing from brands.ts`).toBe(true);
    }
  });

  it('brand slugs are unique and brandBySlug resolves each consistently', () => {
    expect(brandBySlug.size).toBe(brands.length);
    for (const brand of brands) {
      expect(brandBySlug.get(brand.slug)?.name).toBe(brand.name);
    }
  });
});

describe('server/catalog gateway', () => {
  it('exposes the full dataset untouched', () => {
    expect(allProducts().length).toBe(products.length);
  });

  it('findProductBySlug is slug-exact only', () => {
    const sample = products.find((p) => p.slug !== p.code);
    expect(sample).toBeDefined();
    expect(findProductBySlug(sample!.slug)).toBe(sample);
    // A code must never resolve through the slug-only page lookup.
    expect(findProductBySlug(sample!.code)).toBeUndefined();
    // Unknown keys resolve to nothing (the page 404s from these).
    expect(findProductBySlug('no-such-slug')).toBeUndefined();
  });

  it('findProductByKey keeps the dual-mode API semantics', () => {
    const sample = products.find((p) => p.slug !== p.code);
    expect(findProductByKey(sample!.slug)).toBe(sample);
    expect(findProductByKey(sample!.code)).toBe(sample);
    expect(findProductByKey('no-such-key')).toBeUndefined();
  });

  it('categoriesWithCounts equals the live recount and the baked statics', () => {
    const enriched = categoriesWithCounts();
    expect(enriched.length).toBe(categories.length);
    const live = liveCategoryCounts();
    for (const cat of enriched) {
      expect(cat.itemCount, `enriched ${cat.slug}`).toBe(live.get(cat.slug) ?? 0);
    }
    // Enrichment must not mutate the static export it started from.
    expect(categories.every((c, i) => c.title === enriched[i].title)).toBe(true);
  });

  it('slug lookups agree with the taxonomy exports', () => {
    for (const cat of categories) {
      expect(findCategoryBySlug(cat.slug)?.slug).toBe(cat.slug);
    }
    for (const brand of brands) {
      expect(findBrandBySlug(brand.slug)?.slug).toBe(brand.slug);
    }
    expect(findCategoryBySlug('no-such-category')).toBeUndefined();
    expect(findBrandBySlug('no-such-brand')).toBeUndefined();
  });
});
