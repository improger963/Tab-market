/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Route contract (Phase 2): the shipped route surface is a lockable asset.
 * Any added/removed page, any slug engine drift, or any missing boundary file
 * fails this test before it can fail a customer.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { categories } from '@/data/categories';
import { products } from '@/data/products';
import { brands, brandBySlug } from '@/data/brands';

const APP_DIR = join(process.cwd(), 'app');

/** Walk app/ and derive the public route pattern for every page.tsx. */
function collectRoutes(dir: string, prefix: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const abs = join(dir, entry.name);
    const name = entry.name.replace(/[[\].]/g, '');
    const segment = entry.name.startsWith('[') ? `/:${name}` : `/${entry.name}`;
    const path = `${prefix}${segment}`;
    if (existsSync(join(abs, 'page.tsx'))) out.push(path);
    out.push(...collectRoutes(abs, path));
  }
  return out;
}

// '/' comes from app/page.tsx itself, which the walk skips (it only lists dirs).
const actualRoutes = ['/', ...collectRoutes(APP_DIR, '')].sort();

describe('route surface', () => {
  it('matches the locked Phase 2 manifest exactly', () => {
    const expected = [
      '/',
      '/account',
      '/account/addresses',
      '/account/orders',
      '/account/profile',
      '/brand/:slug',
      '/catalog',
      '/category/:slug',
      '/checkout',
      '/compare',
      '/contact',
      '/product/:slug',
      '/showroom',
      '/track-order',
      '/wishlist',
    ].sort();
    expect(actualRoutes).toEqual(expected);
  });

  it('ships all three root boundaries', () => {
    expect(existsSync(join(APP_DIR, 'not-found.tsx'))).toBe(true);
    expect(existsSync(join(APP_DIR, 'error.tsx'))).toBe(true);
    expect(existsSync(join(APP_DIR, 'global-error.tsx'))).toBe(true);
  });

  it('keeps legacy ?tab= targets as real routes', () => {
    // AccountShell redirects /account?tab=X onto /account/X sub-routes.
    for (const tab of ['orders', 'addresses', 'profile']) {
      expect(actualRoutes).toContain(`/account/${tab}`);
    }
  });
});

describe('slug engines', () => {
  it('/category/:slug resolves every known category and 404s unknown slugs', () => {
    const slugs = categories.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(categories.find((c) => c.slug === slug)).toBeDefined();
    }
    expect(categories.find((c) => c.slug === 'no-such-category')).toBeUndefined();
  });

  it('/product/:slug works in both param modes (slug and article code)', () => {
    const find = (key: string) =>
      products.find((p) => p.slug === key || p.code === key);
    const sample = products[0];
    expect(find(sample.slug)?.code).toBe(sample.code);
    expect(find(sample.code)?.slug).toBe(sample.slug);
    expect(find('no-such-product')).toBeUndefined();
    expect(find('')).toBeUndefined();
  });

  it('product slugs are unique and non-empty', () => {
    const slugs = products.map((p) => p.slug);
    expect(slugs.every((s) => s.length > 0)).toBe(true);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('/brand/:slug resolves every brand through the shipped map', () => {
    for (const brand of brands) {
      expect(brandBySlug.get(brand.slug)?.slug).toBe(brand.slug);
    }
    expect(brandBySlug.get('no-such-brand')).toBeUndefined();
  });
});

describe('scroll policy (locked in Phase 2)', () => {
  it('no page forces scrollTo on route mount', () => {
    // The Next router owns navigation scrolling; template.tsx must stay clean.
    const template = readFileSync(join(APP_DIR, 'template.tsx'), 'utf8');
    expect(template).not.toContain('window.scrollTo');
  });

  it('no global smooth scroll in the stylesheet', () => {
    let css = readFileSync(join(APP_DIR, 'globals.css'), 'utf8');
    // Strip comments: the policy note in globals.css mentions the forbidden
    // declaration by name, and `overscroll-behavior` contains the substring.
    css = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
    expect(css).not.toMatch(/(^|[^a-z-])scroll-behavior:\s*smooth/);
  });
});
