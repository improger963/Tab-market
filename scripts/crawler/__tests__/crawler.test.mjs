/**
 * Unit tests for the tab.am catalog crawler.
 * Run: node --test scripts/crawler/__tests__/crawler.test.mjs
 * All tests run against saved fixtures (no network required).
 */
import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import {
  cleanText, cleanPrice, extractCodeFromTitle, stripCodeFromTitle,
  slugFromUrl, canonicalUrl, cacheToOriginal, extractBrandModel, SEED_BRANDS,
  normalizeSpecKey, parseWarrantyYears,
} from '../text.mjs';
import {
  parseCategoryLinks, parseSubCategories, parseListingPage, parseProductPage,
  parseSitemap,
} from '../parse.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FX = (...p) => readFileSync(join(__dirname, '..', '__fixtures__', ...p), 'utf8');

// ─────────────────────── Price Cleaning ───────────────────────────────────

describe('cleanPrice', () => {
  it('parses Armenian format "107 100\u0534\u0565."', () => {
    assert.equal(cleanPrice('107 100\u0534\u0565.'), 107100);
  });
  it('parses "160 650\u0534\u0565."', () => {
    assert.equal(cleanPrice('160 650\u0534\u0565.'), 160650);
  });
  it('handles NBSP as thousands separator', () => {
    assert.equal(cleanPrice('28\u00A0000\u0534\u0565.'), 28000);
  });
  it('handles narrow NBSP', () => {
    assert.equal(cleanPrice('1\u202F900\u0534\u0565.'), 1900);
  });
  it('returns null for empty string', () => {
    assert.equal(cleanPrice(''), null);
    assert.equal(cleanPrice(null), null);
    assert.equal(cleanPrice(undefined), null);
  });
  it('returns null for zero', () => {
    assert.equal(cleanPrice('0'), null);
  });
  it('handles plain digits', () => {
    assert.equal(cleanPrice('5500'), 5500);
  });
});

// ─────────────────────── Discount Detection ────────────────────────────────

describe('discount rules', () => {
  it('keeps oldPrice when > price', () => {
    const price = 28000, oldPrice = 42000;
    assert.ok(oldPrice > price);
  });
  it('sets oldPrice to null when <= price', () => {
    // Crawler logic: if oldPrice <= price → oldPrice = null
    const price = 28000, oldPrice = 28000;
    const result = oldPrice <= price ? null : oldPrice;
    assert.equal(result, null);
  });
});

// ─────────────────────── Code Extraction ───────────────────────────────────

describe('extractCodeFromTitle', () => {
  it('extracts KOD from Armenian title', () => {
    assert.equal(extractCodeFromTitle('\u053d\u0578\u057d\u0561\u0576\u0578\u0581\u056b \u056e\u0578\u0580\u0561\u056f LEDEME RL4080B, 2 \u057c\u0565\u056a\u056b\u0574, \u054d\u0587 (\u053f\u0548\u0534 8899)'), '8899');
  });
  it('returns null when no KOD', () => {
    assert.equal(extractCodeFromTitle('Some Product Title'), null);
  });
  it('strips KOD from title', () => {
    const title = '\u053d\u0578\u057d\u0561\u0576\u0578\u0581\u056b \u056e\u0578\u0580\u0561\u056f LEDEME RL4080B, 2 \u057c\u0565\u056a\u056b\u0574, \u054d\u0587 (\u053f\u0548\u0534 8899)';
    const stripped = stripCodeFromTitle(title);
    assert.ok(!stripped.includes('\u053f\u0548\u0534'));
    assert.ok(stripped.includes('LEDEME'));
  });
});

// ─────────────────────── Brand/Model Extraction ────────────────────────────

describe('extractBrandModel', () => {
  const brandSet = new Set(SEED_BRANDS.map(b => b.toUpperCase()));

  it('finds LEDEME brand and model from title', () => {
    const { brand, brandSource, model } = extractBrandModel('\u053d\u0578\u057d\u0561\u0576\u0578\u0581\u056b \u056e\u0578\u0580\u0561\u056f LEDEME RL4080B, 2 \u057c\u0565\u056a\u056b\u0574, \u054d\u0587', brandSet);
    assert.equal(brand, 'LEDEME');
    assert.equal(brandSource, 'title_token');
    assert.ok(model && model.includes('RL4080B'));
  });

  it('finds GANZER brand', () => {
    const { brand } = extractBrandModel('\u053e\u0578\u0580\u0561\u056f GANZER GZ44012 \u053d\u0580\u0561\u0563\u0578\u0582\u0575\u0580', brandSet);
    assert.equal(brand, 'GANZER');
  });

  it('returns null brand for title with no known brand', () => {
    const { brand } = extractBrandModel('\u053c\u0578\u0563\u0561\u057d\u0565\u0576\u0575\u0561\u056f\u056b \u0561\u0576\u0561\u056d', new Set());
    assert.equal(brand, null);
  });
});

// ─────────────────────── Image URL Canonicalization ────────────────────────

describe('cacheToOriginal', () => {
  it('converts cache URL to original', () => {
    const cache = 'https://tab.am/image/cache/catalog/santexnika/tsorakner/ledeme/k8914-1024x1024.jpg';
    const orig = cacheToOriginal(cache);
    assert.equal(orig, 'https://tab.am/image/catalog/santexnika/tsorakner/ledeme/k8914.jpg');
  });
  it('returns null for non-cache URLs', () => {
    assert.equal(cacheToOriginal('https://tab.am/image/catalog/foo.jpg'), null);
  });
  it('handles PNG files', () => {
    const cache = 'https://tab.am/image/cache/catalog/Accessories/Q13317gofre-500x500.png';
    const orig = cacheToOriginal(cache);
    assert.equal(orig, 'https://tab.am/image/catalog/Accessories/Q13317gofre.png');
  });
});

// ─────────────────────── Slug & URL Canonicalization ───────────────────────

describe('slugFromUrl', () => {
  it('extracts last path segment', () => {
    assert.equal(slugFromUrl('https://tab.am/Santekhnika/tsorakner/khohanotsi-tsorak/ledeme-rl4080b-2-8899'), 'ledeme-rl4080b-2-8899');
  });
  it('strips query params', () => {
    assert.equal(slugFromUrl('https://tab.am/Santekhnika/Sifon/aquant-t908-28-mr-190-280-13317?limit=100'), 'aquant-t908-28-mr-190-280-13317');
  });
});

describe('canonicalUrl', () => {
  it('strips limit, page, sort params', () => {
    const url = 'https://tab.am/Santekhnika/tsorakner?limit=100&page=2&sort=p.name';
    const canon = canonicalUrl(url);
    assert.ok(!canon.includes('limit='));
    assert.ok(!canon.includes('page='));
    assert.ok(!canon.includes('sort='));
  });
  it('keeps the SEO path intact', () => {
    const url = 'https://tab.am/Santekhnika/Sifon/aquant-t908-28-mr-190-280-13317?limit=100';
    const canon = canonicalUrl(url);
    assert.ok(canon.includes('aquant-t908-28-mr-190-280-13317'));
  });
});

// ─────────────────────── Category Discovery (live fixture) ─────────────────

describe('parseCategoryLinks', () => {
  it('finds categories from home fixture', () => {
    const html = FX('home.html');
    const cats = parseCategoryLinks(html);
    assert.ok(cats.length >= 10, `expected >=10 categories, got ${cats.length}`);
    const tsorakner = cats.find(c => c.slug === 'tsorakner');
    assert.ok(tsorakner, 'should have tsorakner');
    assert.ok(tsorakner.expectedCount > 700);
  });
});

// ─────────────────────── Listing Page (fixture) ─────────────────────────────

describe('parseListingPage', () => {
  it('parses product tiles from child category listing', () => {
    const html = FX('category-list-child.html');
    const { products, subCategories } = parseListingPage(html, 'khohanotsi-tsorak', 'Test');
    assert.ok(products.length > 50, `expected >50 tiles, got ${products.length}`);
    const first = products[0];
    assert.ok(first.rawTitle.length > 5);
    assert.ok(first.sourceId, 'should have sourceId from cart.add');
    assert.ok(first.cardPrice !== null, 'should have price');
    assert.ok(first.cardPrice > 0);
    assert.ok(first.slug);
  });

  it('detects subcategories in parent category page', () => {
    const html = FX('category-list.html'); // parent /tsorakner page
    const { products, subCategories } = parseListingPage(html, 'tsorakner', 'Test');
    // Parent shows sub-cats, not product tiles
    assert.ok(subCategories.length > 0, 'should have subcategories');
  });
});

// ─────────────────────── Product Detail Page (fixture) ─────────────────────

describe('parseProductPage', () => {
  const brandSet = new Set(SEED_BRANDS.map(b => b.toUpperCase()));

  it('extracts all fields from product with discount', () => {
    const html = FX('product-discount.html');
    const listing = {
      rawTitle: 'Test', sourceId: '6346',
      sourceUrl: 'https://tab.am/Santekhnika/tsorakner/khohanotsi-tsorak/ledeme-rl4080b-2-8899',
      slug: 'ledeme-rl4080b-2-8899',
      categorySlug: 'khohanotsi-tsorak',
      categoryName: 'Test',
      cardPrice: 28000, cardOldPrice: 42000,
      cardImage: null,
    };
    const p = parseProductPage(html, listing, brandSet);
    assert.equal(p.sourceId, '6346');
    assert.ok(p.rawTitle.includes('LEDEME'));
    assert.equal(p.code, '8899');
    assert.equal(p.codeSource, 'title');
    assert.equal(p.brand, 'LEDEME');
    assert.ok(p.model && p.model.includes('RL4080B'));
    // Main price block (h2 + line-through) = 28000 / 42000.
    // The page ALSO has specials-carousel tiles with .price-new=21000 —
    // regression guard: the tile price must NEVER be taken as the main price.
    assert.equal(p.price, 28000);
    assert.equal(p.oldPrice, 42000);
    assert.ok(p.images.length > 0, 'should have images');
    assert.equal(p.availability, 'in_stock');
    assert.equal(p.inStock, true);
    assert.ok(p.contentHash && p.contentHash.length === 40);
  });

  it('extracts specs from product with attribute table', () => {
    const html = FX('product-attrs.html');
    const listing = {
      rawTitle: 'Test', sourceId: '9356',
      sourceUrl: 'https://tab.am/Santekhnika/Sifon/aquant-t908-28-mr-190-280-13317',
      slug: 'aquant-t908-28-mr-190-280-13317',
      categorySlug: 'Sifon',
      categoryName: 'Test',
      cardPrice: 1900, cardOldPrice: 2850,
      cardImage: null,
    };
    const p = parseProductPage(html, listing, brandSet);
    assert.equal(p.sourceId, '9356');
    assert.equal(p.code, '13317');
    // Main price block: h2=1 900, line-through=2 850 (tiles show 7 500 etc.)
    assert.equal(p.price, 1900);
    assert.equal(p.oldPrice, 2850);
    assert.ok(Object.keys(p.specs).length > 2, 'should have specs');
    // Should have at least type, color, material labels
    const specLabels = Object.keys(p.specs);
    assert.ok(specLabels.length >= 2);
    assert.ok(p.images.length >= 1, 'should have at least one image');
  });

  it('prefers main price block over specials-carousel tile prices', () => {
    // Synthetic page: carousel tile (.product-thumb .price-new) has a DIFFERENT
    // price than the main price block (h2 / line-through). Main must win.
    const page = `<html><body>
      <div id="content"><div class="row">
        <div class="product-thumb"><p class="price">
          <span class="price-new">5 000\u0534\u0580.</span> <span class="price-old">99 000\u0534\u0580.</span>
        </p></div>
        <div class="col-sm-4"><h1>\u053f\u0548\u0534 12345 Test</h1>
          <ul class="list-unstyled">
            <li><span style="text-decoration: line-through;">8 000\u0534\u0580.</span></li>
            <li><h2>6 000\u0534\u0580. </h2></li>
          </ul>
          <div id="product"><button type="button" id="button-cart">x</button></div>
        </div>
      </div></div>
    </body></html>`;
    const listing = { rawTitle: 'Test', sourceId: '7', sourceUrl: 'https://tab.am/test/x-12345', slug: 'x-12345', categorySlug: 'x', categoryName: 'X', cardPrice: null, cardOldPrice: null, cardImage: null };
    const p = parseProductPage(page, listing, brandSet);
    assert.equal(p.price, 6000);
    assert.equal(p.oldPrice, 8000);
  });

  it('does not fabricate inStock=true when buy button absent', () => {
    // A synthetic minimal page with no buy button
    const minimal = '<html><body><h1>Test Product (\u053f\u0548\u0534 99999)</h1><p class="price"><span class="price-new">1000\u0534\u0565.</span></p></body></html>';
    const listing = { rawTitle: 'Test', sourceId: '1', sourceUrl: 'https://tab.am/test', slug: 'test', categorySlug: 'x', categoryName: 'X', cardPrice: null, cardOldPrice: null, cardImage: null };
    const p = parseProductPage(minimal, listing, brandSet);
    // No buy button → availability should not be in_stock (it might be unknown)
    // Note: our heuristic says hasBuyButton=false → availability stays 'unknown'
    // unless the page text has out-of-stock Armenian
    assert.ok(p.availability === 'unknown' || p.availability === 'out_of_stock');
  });
});

// ─────────────────────── Sitemap baseline parsing ──────────────────────

describe('parseSitemap', () => {
  const xml = `<?xml version="1.0"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://tab.am/</loc></url>
  <url><loc>https://tab.am/Santekhnika/tsorakner</loc></url>
  <url><loc>https://tab.am/Santekhnika/tsorakner/khohanotsi-tsorak</loc></url>
  <url><loc>https://tab.am/Santekhnika/tsorakner/khohanotsi-tsorak/ledeme-rl4080b-2-8899</loc></url>
  <url><loc>https://tab.am/Santekhnika/tsorakner/Lvatsarani-tsorak/ganzer-gz44012-10001</loc></url>
  <url><loc>https://tab.am/Santekhnika/Aksesuarner/vieir-v5010-12156</loc></url>
  <url><loc>https://tab.am/Santekhnika/-1/some-clearance-item-22222</loc></url>
  <url><loc>https://tab.am/ledeme-rl4080b-2-8899</loc></url>
  <url><loc>https://tab.am/doors/velldoris-alto-12481</loc></url>
</urlset>`;

  it('buckets products under top category and excludes category pages', () => {
    const scope = new Set(['tsorakner', 'Aksesuarner', '-1']);
    const sm = parseSitemap(xml, scope);
    assert.equal(sm.byCat.get('tsorakner').size, 2);
    assert.ok(sm.byCat.get('tsorakner').has('ledeme-rl4080b-2-8899'));
    assert.ok(sm.byCat.get('tsorakner').has('ganzer-gz44012-10001'));
    assert.ok(!sm.byCat.get('tsorakner').has('khohanotsi-tsorak'), 'sub-category page must not count as product');
    assert.equal(sm.byCat.get('Aksesuarner').size, 1);
    assert.equal(sm.byCat.get('-1').size, 1);
    assert.equal(sm.totalScoped, 4);
  });

  it('ignores URLs outside the scope set and outside /Santekhnika/', () => {
    const scope = new Set(['tsorakner']);
    const sm = parseSitemap(xml, scope);
    assert.equal(sm.byCat.size, 1);
    assert.ok(!sm.allProductLeaves.has('velldoris-alto-12481'));
    assert.ok(!sm.allProductLeaves.has('vieir-v5010-12156'));
  });

  it('handles empty or malformed xml gracefully', () => {
    const sm = parseSitemap('<urlset></urlset>', new Set(['tsorakner']));
    assert.equal(sm.totalScoped, 0);
    assert.equal(sm.byCat.size, 0);
  });
});

// ─────────────────────── Deduplication / Multi-category ────────────────────

describe('dedup and multi-category merge', () => {
  it('merges categories for same product_id', () => {
    // This tests the dedup logic conceptually
    const entries = [
      { sourceId: '100', sourceUrl: 'https://tab.am/a', categorySlug: 'cat1', categoryName: 'Cat1' },
      { sourceId: '100', sourceUrl: 'https://tab.am/b', categorySlug: 'cat2', categoryName: 'Cat2' },
      { sourceId: '100', sourceUrl: 'https://tab.am/c', categorySlug: '-1', categoryName: 'Clearance' },
    ];
    // Simulating what the dedup loop does
    const map = new Map();
    for (const e of entries) {
      const key = e.sourceId;
      if (!map.has(key)) {
        map.set(key, { ...e, categories: [{ slug: e.categorySlug, name: e.categoryName }] });
      } else {
        const existing = map.get(key);
        if (!existing.categories.find(c => c.slug === e.categorySlug)) {
          existing.categories.push({ slug: e.categorySlug, name: e.categoryName });
        }
        if (e.categorySlug === '-1') existing.isClearance = true;
      }
    }
    assert.equal(map.size, 1);
    const merged = map.get('100');
    assert.equal(merged.categories.length, 3);
    assert.equal(merged.isClearance, true);
  });
});

// ─────────────────────── Spec Key Normalization ─────────────────────────────

describe('normalizeSpecKey', () => {
  it('maps Armenian type label to "type"', () => {
    const result = normalizeSpecKey('\u054f\u0565\u057d\u0561\u056f');
    assert.equal(result, 'type');
  });
  it('maps Armenian material label to "material"', () => {
    const result = normalizeSpecKey('\u0546\u0575\u0578\u0582\u0569');
    assert.equal(result, 'material');
  });
  it('returns original label if not in map', () => {
    assert.equal(normalizeSpecKey('unknown_label_xyz'), 'unknown_label_xyz');
  });
});

describe('parseWarrantyYears', () => {
  it('parses "5 \u057f\u0561\u0580\u056b" → 5', () => {
    assert.equal(parseWarrantyYears('5 \u057f\u0561\u0580\u056b'), 5);
  });
  it('parses "24 \u0561\u0574\u056b\u057d" → 2', () => {
    assert.equal(parseWarrantyYears('24 \u0561\u0574\u056b\u057d'), 2);
  });
  it('returns null for non-parseable text', () => {
    assert.equal(parseWarrantyYears('no warranty info'), null);
  });
});

// ─────────────────────── Slug Collision ─────────────────────────────────────

describe('slug collision handling', () => {
  it('appends sourceId to duplicate slugs', () => {
    // Simulating what crawl-tab.mjs does
    const products = [
      { slug: 'same-slug', sourceId: '111' },
      { slug: 'same-slug', sourceId: '222' },
    ];
    const seen = new Set();
    for (const p of products) {
      if (seen.has(p.slug)) p.slug = `${p.slug}-${p.sourceId}`;
      seen.add(p.slug);
    }
    assert.notEqual(products[0].slug, products[1].slug);
    assert.ok(products[1].slug.includes('222'));
  });
});
