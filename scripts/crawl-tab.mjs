#!/usr/bin/env node
/**
 * crawl-tab.mjs – Full-catalog crawler for tab.am (OpenCart, Armenian locale).
 * Owner-operated migration tool. Zero-fabrication policy.
 *
 * Usage:
 *   node scripts/crawl-tab.mjs [flags]
 *
 * Flags:
 *   --category <slug|url>   Limit crawl to specific category (repeatable)
 *   --limit-products <n>    Dry run: stop after N product pages
 *   --concurrency <n>       Max parallel requests (default 3, max 5)
 *   --delay <ms>            Min delay between requests (default 400)
 *   --refresh               Force re-fetch, overwrite cache
 *   --no-cache              Bypass cache reads
 *   --download-images       Download originals to public/products/
 *   --force                 Promote output even if gates fail
 *   --ignore-robots         Crawl despite robots.txt disallow (owner use only)
 *   --out <dir>             Output directory (default: data)
 *   --verbose               Extra logging
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import * as cheerio from 'cheerio';
import pLimit from 'p-limit';
import { z } from 'zod';
import ExcelJS from 'exceljs';

import { fetchHtml, checkRobots, RateLimiter, loadState, saveState, initCache } from './crawler/http.mjs';
import {
  cleanText, cleanPrice, extractCodeFromTitle, stripCodeFromTitle,
  slugFromUrl, canonicalUrl, SEED_BRANDS, extractBrandModel,
} from './crawler/text.mjs';
import {
  parseCategoryLinks, parseSubCategories, parseListingPage, parseProductPage,
  parseSitemap,
} from './crawler/parse.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ORIGIN = 'https://tab.am';

// ──────────────────────────── CLI Flags ───────────────────────────────────

function parseArgs(argv) {
  const flags = {
    categories: [], limitProducts: Infinity, concurrency: 3, delay: 400,
    refresh: false, noCache: false, downloadImages: false, force: false,
    ignoreRobots: false, out: join(ROOT, 'data'), verbose: false,
  };
  const args = argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--category') flags.categories.push(args[++i]);
    else if (a === '--limit-products') flags.limitProducts = parseInt(args[++i], 10);
    else if (a === '--concurrency') flags.concurrency = Math.min(5, Math.max(1, parseInt(args[++i], 10)));
    else if (a === '--delay') flags.delay = Math.max(200, parseInt(args[++i], 10));
    else if (a === '--refresh') flags.refresh = true;
    else if (a === '--no-cache') flags.noCache = true;
    else if (a === '--download-images') flags.downloadImages = true;
    else if (a === '--force') flags.force = true;
    else if (a === '--ignore-robots') flags.ignoreRobots = true;
    else if (a === '--out') flags.out = resolve(args[++i]);
    else if (a === '--verbose') flags.verbose = true;
  }
  return flags;
}
function resolve(p) { return p.startsWith('/') || /^[A-Z]:/i.test(p) ? p : join(ROOT, p); }

// ──────────────────────────── Seed Categories ─────────────────────────────

const SEED_CATEGORIES = [
  { name: '\u053e\u0578\u0580\u0561\u056f\u0576\u0565\u0580',           slug: 'tsorakner',                 expectedCount: 772 },
  { name: '\u0551\u0576\u0581\u0578\u0582\u0572\u056b \u0570\u0561\u057e\u0561\u0584\u0561\u056e\u057d\u0578\u0582\u0576\u0565\u0580', slug: 'Tsntsughi-havakatsuner',    expectedCount: 361 },
  { name: '\u053c\u0578\u0563\u2024 \u0561\u0584\u057d\u0565\u057d\u0578\u0582\u0561\u0580\u0576\u0565\u0580', slug: 'Aksesuarner',               expectedCount: 742 },
  { name: '\u054d\u0561\u0576\u056f\u0565\u0580\u0561\u0574\u056b\u056f\u0561',    slug: 'Sankeramika',               expectedCount: 224 },
  { name: '\u056d\u0578\u0570\u0561\u0576\u0578\u0581\u056b \u056c\u057e\u0561\u05e1\u0561\u0580\u0561\u0576', slug: 'khohanotsi-lvatsaran',       expectedCount: 236 },
  { name: '\u053c\u057e\u0561\u05e1\u0561\u0580\u0561\u0576 \u057a\u0561\u056d\u0561\u0580\u0561\u0576\u0578\u057e', slug: 'Lvatsaran-paharanov',      expectedCount: 149 },
  { name: '\u054d\u056b\u0586\u0578\u0576\u0576\u0565\u0580',              slug: 'Sifon',                    expectedCount: 145 },
  { name: '\u0551\u0576\u0581\u0578\u0582\u0572 \u0565\u0582 \u056d\u0578\u0572\u0578\u057e\u0561\u056f', slug: 'Tsntsugh_yev_khoghovak',   expectedCount: 346 },
  { name: '\u053c\u056b\u056f\u057e\u056b\u0564\u0561\u0581\u056b\u0561',        slug: '-1',                       expectedCount: 216 },
  { name: '\u0540\u056b\u0563\u056b\u0565\u0576\u0561\u0575\u056b \u057a\u0561\u0580\u0561\u0563\u0561\u0576\u0565\u0580', slug: 'Higiyenayi-paraganer',     expectedCount: 179 },
  { name: '\u0540\u0561\u0575\u0565\u056c\u056b\u0576\u0565\u0580',          slug: 'Hayeliner',                expectedCount: 81 },
  { name: '\u0556\u0561\u056f\u0561\u0576\u0576\u0565\u0580',              slug: 'Pakan',                    expectedCount: 73 },
  { name: '\u0549\u0578\u0580\u0561\u0576\u0578\u05e1\u0576\u0565\u0580',        slug: 'Choranotsner',             expectedCount: 69 },
  { name: '\u0540\u0578\u057d\u0561\u056f\u0576\u0565\u0580',             slug: 'Hosakner1',                expectedCount: 63 },
  { name: '\u053c\u0578\u0563\u0561\u057d\u0565\u0576\u0575\u0561\u056f\u056b \u057e\u0561\u0580\u0561\u0563\u0578\u0582\u0575\u0580\u056b \u0571\u0578\u0572\u0565\u0580', slug: 'Logasenyaki-varaguyri-dzogher', expectedCount: 32 },
  { name: '\u0555\u0564\u0561\u0583\u0578\u056d\u056b\u0579\u0576\u0565\u0580',   slug: 'odapvokhichner',           expectedCount: 24 },
];

// ──────────────────────────── Zod Schema ──────────────────────────────────

const ProductSchema = z.object({
  id:           z.number().int().positive(),
  code:         z.string().min(1),
  title:        z.string().min(1),
  slug:         z.string().min(1),
  categorySlug: z.string().min(1),
  categoryName: z.string().min(1),
  brand:        z.string().default(''),
  price:        z.number().int().positive().nullable().default(null),
  oldPrice:     z.number().int().positive().nullable().optional(),
  inStock:      z.boolean().nullable().default(null),
  stockQuantity: z.number().int().nonnegative().nullable().optional(),
  images:       z.array(z.string()).default([]),
  blueprintImage: z.string().nullable().optional(),
  shortDesc:    z.string().default(''),
  specs:        z.record(z.string()).default({}),
  isFeatured:   z.boolean().optional(),
  rating:       z.number().min(0).max(5).optional(),
  reviewsCount: z.number().int().nonnegative().optional(),
  finish:       z.enum(['chrome','gold','black','gunmetal','white','mirror']).optional(),
  isNew:        z.boolean().optional(),
  clearance:    z.boolean().optional(),
  // Crawler metadata (additive, server-only)
  sourceId:     z.string().nullable().optional(),
  sourceUrl:    z.string().nullable().optional(),
  rawTitle:     z.string().nullable().optional(),
  codeSource:   z.enum(['title','model_field','fallback_product_id']).nullable().optional(),
  brandSource:  z.string().nullable().optional(),
  model:        z.string().nullable().optional(),
  availability: z.enum(['in_stock','out_of_stock','preorder','unknown']).default('unknown'),
  priceOnRequest: z.boolean().optional(),
  currency:     z.string().default('AMD'),
  crawledAt:    z.string().nullable().optional(),
  contentHash:  z.string().nullable().optional(),
  categories:   z.array(z.object({ slug: z.string(), name: z.string() })).optional(),
  isClearance:  z.boolean().optional(),
});

// ──────────────────────────── Crawl Orchestrator ──────────────────────────

async function main() {
  const t0 = Date.now();
  const flags = parseArgs(process.argv);
  const log = flags.verbose ? console.log : () => {};
  let reqCount = 0;
  let cacheHits = 0;

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  TAB.AM CATALOG CRAWL`);
  console.log(`  ${new Date().toISOString()}`);
  console.log(`${'═'.repeat(60)}\n`);

  // ── Robots check ──
  const limiter = new RateLimiter(flags.delay);
  const robots = await checkRobots(ORIGIN, limiter);
  if (robots.disallowed) {
    console.warn('⚠  robots.txt DISALLOWS crawling.');
    if (!flags.ignoreRobots) {
      console.error('✖  Aborting. Use --ignore-robots (owner use only).');
      process.exit(1);
    }
    console.warn('   --ignore-robots is set (owner-operated migration). Proceeding.\n');
  }

  // ── Phase 0: Discovery ──
  console.log('▶ Phase 0: Category discovery...');
  let categories;
  if (flags.categories.length > 0) {
    // Manual category filter
    categories = SEED_CATEGORIES.filter(c =>
      flags.categories.includes(c.slug) || flags.categories.some(f => c.slug === f.split('/').pop())
    );
    console.log(`  Using ${categories.length} specified categories.`);
  } else {
    // Discover from live site
    const homeRes = await fetchHtml(ORIGIN + '/', { limiter, noCache: flags.noCache, refresh: flags.refresh });
    reqCount++;
    if (homeRes.fromCache) cacheHits++;
    categories = parseCategoryLinks(homeRes.html);
    if (categories.length === 0) {
      console.warn('  Live discovery returned 0 categories; using seed list.');
      categories = SEED_CATEGORIES.map(c => ({ ...c, url: `${ORIGIN}/Santekhnika/${c.slug}` }));
    }
    // Merge seed expectedCount where discovery missed it
    for (const cat of categories) {
      if (!cat.expectedCount) {
        const seed = SEED_CATEGORIES.find(s => s.slug === cat.slug);
        if (seed) cat.expectedCount = seed.expectedCount;
      }
    }
  }
  console.log(`  Found ${categories.length} top-level categories.`);
  log(JSON.stringify(categories.map(c => ({ slug: c.slug, expectedCount: c.expectedCount })), null, 2));

  // ── Sitemap baseline (authoritative expected counts) ──
  // The site's nav badges are known to be stale (verified 2026-10: the bathroom
  // accessories badge shows 741 but the category contains 122 products). Use
  // sitemap.xml per-category product URLs as the reconciliation baseline.
  let sitemapByCat = null;
  let sitemapTotal = 0;
  try {
    const smRes = await fetchHtml(ORIGIN + '/sitemap.xml', { limiter, noCache: flags.noCache, refresh: flags.refresh });
    reqCount++;
    if (smRes.fromCache) cacheHits++;
    const scope = new Set(categories.map(c => c.slug));
    const sm = parseSitemap(smRes.html, scope);
    sitemapByCat = sm.byCat;
    sitemapTotal = sm.totalScoped;
    console.log(`  Sitemap baseline: ${sitemapTotal} in-scope product URLs across ${sitemapByCat.size} categories.`);
    for (const cat of categories) {
      cat.navBadge = cat.expectedCount || null;
      const smCount = sitemapByCat.get(cat.slug)?.size || 0;
      if (smCount > 0) cat.expectedCount = smCount;
      if (cat.navBadge && Math.abs(cat.navBadge - smCount) / cat.navBadge > 0.01) {
        console.log(`    note: ${cat.slug} nav badge=${cat.navBadge} vs sitemap=${smCount} (using sitemap)`);
      }
    }
  } catch (e) {
    console.warn(`  ⚠ Could not fetch/parse sitemap.xml (${e.message}); falling back to nav-badge counts.`);
  }

  // ── Phase 1: Listing crawl ──
  console.log('\n▶ Phase 1: Listing crawl...');
  const allListing = []; // { product entries from listing pages }
  const categoryReport = []; // { category, expected, found, subcats: [] }

  for (const cat of categories) {
    const catUrl = cat.url || `${ORIGIN}/Santekhnika/${cat.slug}`;
    console.log(`  [${cat.slug}] crawling...`);
    const catEntry = { category: cat.slug, name: cat.name, expected: cat.expectedCount || null, navBadge: cat.navBadge ?? null, found: 0, subcategories: [], pages: 0 };

    // Recursively crawl this category (and sub-categories)
    const entries = await crawlCategory(catUrl, cat.slug, cat.name, flags, limiter, log, (n) => { reqCount++; }, (n) => { cacheHits += n; });
    allListing.push(...entries);
    catEntry.found = new Set(entries.map(e => e.sourceId || e.sourceUrl)).size;

    // Discover sub-cats from first page
    const firstRes = await fetchHtml(catUrl + '?limit=1&page=1', { limiter, noCache: flags.noCache, refresh: flags.refresh });
    reqCount++;
    const subs = parseSubCategories(firstRes.html);
    catEntry.subcategories = subs.map(s => ({ slug: s.slug, expected: s.expectedCount }));
    categoryReport.push(catEntry);

    const diff = catEntry.expected && catEntry.expected > 0
      ? ((catEntry.found - catEntry.expected) / catEntry.expected * 100)
      : 0;
    const status = Math.abs(diff) <= 1 ? '✓' : '⚠';
    console.log(`    ${status} expected=${catEntry.expected} found=${catEntry.found} diff=${diff.toFixed(1)}%`);
  }

  console.log(`  Total listing entries: ${allListing.length}`);

  // ── Deduplicate globally by product_id (fallback: canonicalUrl) ──
  console.log('\n▶ Deduplicating...');
  const bySourceId = new Map();
  const byUrl = new Map();
  const deduped = [];

  for (const entry of allListing) {
    const key = entry.sourceId || canonicalUrl(entry.sourceUrl || '');
    if (bySourceId.has(key)) {
      // merge categories
      const existing = bySourceId.get(key);
      if (!existing.categories) existing.categories = [{ slug: existing.categorySlug, name: existing.categoryName }];
      if (!existing.categories.find(c => c.slug === entry.categorySlug)) {
        existing.categories.push({ slug: entry.categorySlug, name: entry.categoryName });
      }
      // clearance membership
      if (entry.categorySlug === '-1') existing.isClearance = true;
      continue;
    }
    const item = { ...entry };
    if (item.categorySlug === '-1') item.isClearance = true;
    bySourceId.set(key, item);
    deduped.push(item);
  }
  console.log(`  Unique products: ${deduped.length}`);

  // ── Phase 2: Product detail extraction ──
  console.log(`\n▶ Phase 2: Product detail extraction (${deduped.length} products)...`);
  const brandSet = new Set(SEED_BRANDS.map(b => b.toUpperCase()));
  // Collect all brand tokens from titles so far for dynamic brand discovery
  for (const entry of deduped) {
    const tokens = (entry.rawTitle || '').match(/\b[A-Z][A-Za-z0-9]{2,}\b/g) || [];
    for (const tok of tokens) brandSet.add(tok.toUpperCase());
  }

  const limit = pLimit(flags.concurrency);
  const products = [];
  let processed = 0;
  const maxProducts = flags.limitProducts;

  // Resume from checkpoint
  const state = loadState();
  const doneSet = new Set(Object.keys(state.doneProducts || {}));
  console.log(`  Resuming: ${doneSet.size} products already cached.`);

  const errors = [];

  await Promise.all(deduped.slice(0, maxProducts).map(entry => limit(async () => {
    const key = entry.sourceId || canonicalUrl(entry.sourceUrl || '');
    if (doneSet.has(key)) {
      products.push(state.doneProducts[key]);
      processed++;
      return;
    }
    const url = entry.sourceUrl;
    if (!url) { errors.push({ url, reason: 'no source URL', entry }); return; }

    try {
      const { html, fromCache } = await fetchHtml(url, {
        limiter, noCache: flags.noCache, refresh: flags.refresh,
      });
      reqCount++;
      if (fromCache) cacheHits++;

      if (!html || html.length < 200) {
        errors.push({ url, reason: 'empty page', entry });
        return;
      }

      const product = parseProductPage(html, entry, brandSet);
      // Carry over multi-category and clearance
      product.categories = entry.categories || [{ slug: entry.categorySlug, name: entry.categoryName }];
      product.isClearance = entry.isClearance || false;

      products.push(product);
      state.doneProducts[key] = product;
      processed++;
      if (processed % 25 === 0) {
        console.log(`    ${processed}/${deduped.length} (${Math.round(processed / deduped.length * 100)}%) ETA: ${eta(t0, processed, deduped.length)}`);
        saveState(state);
      }
    } catch (e) {
      errors.push({ url, reason: e.message, entry });
    }
  })));

  saveState(state);
  console.log(`  Extracted: ${products.length} products, errors: ${errors.length}`);
  if (errors.length) console.log('  First 5 errors:', errors.slice(0, 5).map(e => `${e.url}: ${e.reason}`).join('\n'));

  // ── Phase 3: Validation & Gates ──
  console.log('\n▶ Phase 3: Validation...');
  // Deterministic pre-sort so id assignment / collision resolution are stable across runs
  // (extraction order depends on network completion order, which is not stable).
  products.sort((a, b) => String(a.slug).localeCompare(String(b.slug)) || String(a.sourceId).localeCompare(String(b.sourceId)));
  const validProducts = [];
  const invalidProducts = [];
  const existingJsonPath = join(ROOT, 'data', 'products.json');
  const existingData = existsSync(existingJsonPath) ? JSON.parse(readFileSync(existingJsonPath, 'utf8')) : [];

  // Build ID sequence: continue from existing max id
  let nextId = (existingData.length ? Math.max(...existingData.map(p => p.id || 0)) : 0) + 1;

  for (const p of products) {
    // Map crawler fields to the Product interface shape
    const record = toProductRecord(p, nextId++);
    const result = ProductSchema.safeParse(record);
    if (result.success) {
      validProducts.push(record);
    } else {
      invalidProducts.push({ record, errors: result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`) });
    }
  }

  console.log(`  Valid: ${validProducts.length}, Invalid: ${invalidProducts.length}`);

  // Slug collision check
  const slugMap = new Map();
  for (const p of validProducts) {
    if (slugMap.has(p.slug)) {
      p.slug = `${p.slug}-${p.sourceId || p.code}`;
      log(`  Slug collision resolved: ${p.slug}`);
    }
    slugMap.set(p.slug, true);
  }

  // Code collision check
  const codeMap = new Map();
  let codeCollisions = 0;
  for (const p of validProducts) {
    if (p.code && codeMap.has(p.code)) codeCollisions++;
    if (p.code) codeMap.set(p.code, true);
  }
  if (codeCollisions > 0) console.warn(`  Code collisions: ${codeCollisions}`);

  // Quality gates
  const gates = runGates(validProducts, categoryReport, existingData, flags, log, sitemapByCat);
  const gatesPassed = gates.every(g => g.pass);
  console.log('\n  Gate results:');
  for (const g of gates) console.log(`    ${g.pass ? '✓' : '✖'} ${g.name}: ${g.detail}`);

  // ── Phase 4: Output ──
  console.log('\n▶ Phase 4: Writing outputs...');
  mkdirSync(flags.out, { recursive: true });

  // Deterministic sort: primaryCategory.slug, then title, then sourceId
  validProducts.sort((a, b) => {
    const as = (a.primaryCategorySlug || a.categorySlug || '').toLowerCase();
    const bs = (b.primaryCategorySlug || b.categorySlug || '').toLowerCase();
    if (as !== bs) return as.localeCompare(bs);
    if (a.title !== b.title) return a.title.localeCompare(b.title);
    return String(a.sourceId).localeCompare(String(b.sourceId));
  });

  const outFile = join(flags.out, 'products.next.json');
  const jsonStr = JSON.stringify(validProducts, null, 2);
  writeFileSync(outFile, jsonStr, 'utf8');
  console.log(`  Wrote ${outFile} (${validProducts.length} products, ${(Buffer.byteLength(jsonStr) / 1024 / 1024).toFixed(1)} MB)`);

  if (gatesPassed || flags.force) {
    const prevFile = join(flags.out, 'products.prev.json');
    const liveFile = join(flags.out, 'products.json');
    if (existsSync(liveFile)) copyFileSync(liveFile, prevFile);
    renameSync(outFile, liveFile);
    console.log(`  ✓ Promoted to ${liveFile} (backup at products.prev.json)`);
  } else {
    console.log(`  ✖ Gates failed. Output kept at products.next.json (live not touched).`);
  }

  // Invalid products report
  if (invalidProducts.length) {
    writeFileSync(join(flags.out, 'crawl-errors.json'), JSON.stringify(invalidProducts, null, 2), 'utf8');
  }

  // Categories derived from dataset
  const catCounts = {};
  for (const p of validProducts) catCounts[p.categorySlug] = (catCounts[p.categorySlug] || 0) + 1;
  const categoriesOut = categories.map(c => ({ name: c.name, slug: c.slug, sourceUrl: c.url, productCount: catCounts[c.slug] || 0 }));
  writeFileSync(join(flags.out, 'categories.json'), JSON.stringify(categoriesOut, null, 2), 'utf8');

  // Brands derived
  const brandCounts = {};
  for (const p of validProducts) if (p.brand) brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
  const brandsOut = Object.entries(brandCounts).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
  writeFileSync(join(flags.out, 'brands.json'), JSON.stringify(brandsOut, null, 2), 'utf8');
  console.log(`  Brands found: ${brandsOut.length} (top: ${brandsOut.slice(0, 5).map(b => `${b.name}:${b.count}`).join(', ')})`);

  // XLSX
  await writeXlsx(join(flags.out, 'products.xlsx'), validProducts, categoryReport, invalidProducts);
  console.log(`  Wrote products.xlsx`);

  // Diff report vs prev dataset
  const diffReport = buildDiff(validProducts, existingData);
  console.log('\n  Diff vs prev dataset:');
  for (const [k, v] of Object.entries(diffReport)) console.log(`    ${k}: ${v}`);

  // Crawl report
  const runtime = Date.now() - t0;
  const report = {
    timestamp: new Date().toISOString(),
    runtime: `${Math.round(runtime / 1000)}s`,
    requests: reqCount,
    cacheHits,
    categories: categoryReport,
    totalUnique: validProducts.length,
    skipped: deduped.length - validProducts.length,
    errors: errors.length,
    withImage: validProducts.filter(p => p.images?.length > 0).length,
    withPrice: validProducts.filter(p => p.price != null).length,
    withBrand: validProducts.filter(p => p.brand).length,
    withSpecs: validProducts.filter(p => Object.keys(p.specs || {}).length > 0).length,
    fallbackCodes: validProducts.filter(p => p.codeSource === 'fallback_product_id').length,
    clearanceOnly: validProducts.filter(p => p.isClearance).length,
    sitemap: sitemapByCat ? {
      inScopeTotal: sitemapTotal,
      categoriesWithBaseline: sitemapByCat.size,
    } : null,
    gates: gates.map(g => ({ name: g.name, pass: g.pass })),
    diff: diffReport,
  };
  writeFileSync(join(flags.out, 'crawl-report.json'), JSON.stringify(report, null, 2), 'utf8');

  // Print summary table
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  Category                  Expected   Found   Diff   NavBadge`);
  console.log(`  ${'─'.repeat(56)}`);
  for (const r of categoryReport) {
    const diff = r.expected ? ((r.found - r.expected) / r.expected * 100) : 0;
    const flag = Math.abs(diff) <= 1 ? '✓' : '⚠';
    console.log(`  ${(r.category + ' (' + r.name.slice(0, 10) + ')').padEnd(26)} ${String(r.expected).padStart(8)} ${String(r.found).padStart(7)} ${flag}${diff.toFixed(1)}%`.padEnd(48) + String(r.navBadge ?? '-').padStart(6));
  }

  console.log(`\n  Total unique products: ${validProducts.length}`);
  console.log(`  With price: ${report.withPrice}  With image: ${report.withImage}  With brand: ${report.withBrand}  With specs: ${report.withSpecs}`);
  console.log(`  Fallback codes: ${report.fallbackCodes}  Clearance: ${report.clearanceOnly}`);
  console.log(`  Requests: ${reqCount}  Cache hits: ${cacheHits}  Runtime: ${Math.round(runtime / 1000)}s`);

  if (!gatesPassed && !flags.force) {
    console.error('\n✖ Gates failed. Use --force to promote anyway.');
    process.exit(1);
  }
  console.log('\n✓ Done.');
}

// ──────────────────────────── Category Crawl ───────────────────────────────

async function crawlCategory(catUrl, catSlug, catName, flags, limiter, log, onReq, onCache) {
  const entries = [];
  const seenIds = new Set();
  const PAGE_LIMIT = 100;
  const MAX_PAGES = 200;
  let page = 1;
  let consecutiveRepeats = 0;

  while (page <= MAX_PAGES) {
    const url = `${catUrl}?limit=${PAGE_LIMIT}&page=${page}`;
    let res;
    try {
      res = await fetchHtml(url, { limiter, noCache: flags.noCache, refresh: flags.refresh });
    } catch (e) {
      log(`    Error fetching page ${page} of ${catSlug}: ${e.message}`);
      break;
    }
    onReq(1);
    if (res.fromCache) onCache(1);

    if (res.status === 404 || !res.html || res.html.length < 200) break;

    const { products, subCategories, hasNextPage } = parseListingPage(res.html, catSlug, catName);

    // If this page has sub-categories instead of products, recurse into them
    if (products.length === 0 && subCategories.length > 0) {
      for (const sub of subCategories) {
        log(`    Sub-category: ${sub.slug} (${sub.expectedCount})`);
        const subEntries = await crawlCategory(sub.url, sub.slug, sub.name, flags, limiter, log, onReq, onCache);
        entries.push(...subEntries.map(e => ({ ...e, categorySlug: catSlug, categoryName: catName })));
      }
      break; // done with this parent category
    }

    if (products.length === 0) break; // no more products

    let newCount = 0;
    for (const p of products) {
      const key = p.sourceId || canonicalUrl(p.sourceUrl);
      if (key && seenIds.has(key)) continue;
      if (key) seenIds.add(key);
      entries.push(p);
      newCount++;
    }

    // Stop if all IDs were repeats
    if (newCount === 0) {
      consecutiveRepeats++;
      if (consecutiveRepeats >= 2) break;
    } else {
      consecutiveRepeats = 0;
    }

    if (!hasNextPage) break;
    page++;
  }
  return entries;
}

// ──────────────────────────── Record Mapping ───────────────────────────────

function toProductRecord(crawler, seqId) {
  const primary = (crawler.categories || [])
    .filter(c => c.slug !== '-1')  // non-clearance
    .sort((a, b) => {
      const order = SEED_CATEGORIES.findIndex(s => s.slug === a.slug) - SEED_CATEGORIES.findIndex(s => s.slug === b.slug);
      return order;
    });
  const primaryCat = primary[0] || (crawler.categories || [])[0] || { slug: crawler.categorySlug, name: crawler.categoryName };

  return {
    id: seqId,
    code: crawler.code || '',
    title: crawler.title || '',
    slug: crawler.slug || '',
    categorySlug: primaryCat.slug,
    categoryName: primaryCat.name,
    brand: crawler.brand || '',
    price: crawler.price ?? null,
    oldPrice: crawler.oldPrice ?? undefined,
    inStock: crawler.inStock,
    stockQuantity: crawler.stockQuantity ?? undefined,
    images: crawler.images || [],
    blueprintImage: crawler.blueprintImage ?? undefined,
    shortDesc: crawler.shortDesc || '',
    specs: crawler.specs || {},
    clearance: crawler.isClearance || undefined,
    // Crawler metadata
    sourceId: crawler.sourceId ?? undefined,
    sourceUrl: crawler.sourceUrl ?? undefined,
    rawTitle: crawler.rawTitle ?? undefined,
    codeSource: crawler.codeSource ?? undefined,
    brandSource: crawler.brandSource ?? undefined,
    model: crawler.model ?? undefined,
    availability: crawler.availability || 'unknown',
    priceOnRequest: crawler.priceOnRequest || undefined,
    currency: crawler.currency || 'AMD',
    crawledAt: crawler.crawledAt,
    contentHash: crawler.contentHash,
    categories: crawler.categories,
    isClearance: crawler.isClearance || undefined,
    // Aliases for sorting
    primaryCategorySlug: primaryCat.slug,
  };
}

// ──────────────────────────── Gates ───────────────────────────────────────

function runGates(products, catReport, prevData, flags, log, sitemapByCat) {
  const gates = [];

  // 1. Category reconciliation (expected baseline = sitemap.xml counts when available)
  //    Only a SHORTFALL (found < expected beyond tolerance) can indicate lost
  //    products and fails the run. An OVERAGE (found > expected) just means the
  //    site's sitemap/badge is stale (a newly-listed product) and is a warning.
  const shortCats = [];
  const overCats = [];
  for (const r of catReport) {
    if (!r.expected || r.expected <= 0) continue;
    const rel = (r.found - r.expected) / r.expected;
    if (rel < -0.01) shortCats.push(r);
    else if (rel > 0.01) overCats.push(r);
  }
  const baseline = sitemapByCat ? 'sitemap' : 'nav-badge';
  gates.push({
    name: `Category reconciliation (${baseline} baseline)`,
    pass: shortCats.length === 0,
    detail: shortCats.length === 0
      ? (overCats.length ? `all covered; ${overCats.length} over (stale baseline): ${overCats.map(c => c.category).join(', ')}` : 'all within 1%')
      : `${shortCats.length} categories SHORT (possible loss): ${shortCats.map(c => `${c.category}(${c.found}/${c.expected})`).join(', ')}`,
  });

  // 2. ≥99% have title and sourceId
  const titledPct = products.length ? products.filter(p => p.title && p.sourceId).length / products.length * 100 : 0;
  gates.push({ name: 'Title+sourceId coverage', pass: titledPct >= 99, detail: `${titledPct.toFixed(1)}%` });

  // 3. Price coverage < 2% missing
  const nullPrice = products.filter(p => p.price === null).length;
  const nullPricePct = products.length ? nullPrice / products.length * 100 : 0;
  gates.push({ name: 'Price coverage', pass: nullPricePct < 2, detail: `${nullPrice} null prices (${nullPricePct.toFixed(1)}%)` });

  // 4. Slug/sourceId/code collisions
  const slugs = new Set(); let slugDupes = 0;
  for (const p of products) { if (slugs.has(p.slug)) slugDupes++; slugs.add(p.slug); }
  gates.push({ name: 'Slug uniqueness', pass: slugDupes === 0, detail: slugDupes ? `${slugDupes} dupes` : 'none' });

  // 5. No price <= 0
  const badPrices = products.filter(p => p.price !== null && p.price <= 0).length;
  gates.push({ name: 'Valid prices', pass: badPrices === 0, detail: badPrices ? `${badPrices} bad prices` : 'none' });

  // 6. No HTML in titles
  const htmlTitles = products.filter(p => /<[a-z]/i.test(p.title)).length;
  gates.push({ name: 'Clean titles', pass: htmlTitles === 0, detail: htmlTitles ? `${htmlTitles} contain HTML` : 'none' });

  // 7. Total >= 90% of prev run
  if (prevData.length > 0) {
    const pct = products.length / prevData.length * 100;
    gates.push({ name: 'Volume vs prev', pass: pct >= 90, detail: `${products.length}/${prevData.length} = ${pct.toFixed(1)}%` });
  } else {
    gates.push({ name: 'Volume vs prev', pass: true, detail: 'no prev dataset (first run)' });
  }

  // 8. Zero-loss: every in-scope sitemap product URL must have been captured.
  if (sitemapByCat) {
    const captured = new Set();
    for (const p of products) {
      if (p.slug) captured.add(p.slug);
      if (p.sourceUrl) captured.add(slugFromUrl(p.sourceUrl));
    }
    const missed = [];
    for (const [cat, leaves] of sitemapByCat) {
      for (const leaf of leaves) if (!captured.has(leaf)) missed.push(`${cat}/${leaf}`);
    }
    gates.push({
      name: 'Sitemap zero-loss coverage',
      pass: missed.length === 0,
      detail: missed.length === 0 ? 'all in-scope sitemap products captured'
        : `${missed.length} sitemap products not captured: ${missed.slice(0, 50).join(', ')}`,
    });
  }

  return gates;
}

// ──────────────────────────── Diff Report ──────────────────────────────────

function buildDiff(products, prevData) {
  const prevByCode = new Map();
  for (const p of prevData) if (p.code) prevByCode.set(p.code, p);
  const currByCode = new Map();
  for (const p of products) if (p.code) currByCode.set(p.code, p);

  const added = [...currByCode.keys()].filter(c => !prevByCode.has(c));
  const removed = [...prevByCode.keys()].filter(c => !currByCode.has(c));
  const priceChanged = [...currByCode.keys()].filter(c => {
    const prev = prevByCode.get(c);
    const curr = currByCode.get(c);
    return prev && curr && prev.price !== curr.price;
  });
  const availabilityChanged = [...currByCode.keys()].filter(c => {
    const prev = prevByCode.get(c);
    const curr = currByCode.get(c);
    return prev && curr && prev.inStock !== curr.inStock;
  });
  const imageChanged = [...currByCode.keys()].filter(c => {
    const prev = prevByCode.get(c);
    const curr = currByCode.get(c);
    return prev && curr && prev.image !== curr.image;
  });

  return {
    added: `${added.length}${added.length ? ': ' + added.slice(0, 10).join(', ') : ''}`,
    removed: `${removed.length}${removed.length ? ': ' + removed.slice(0, 10).join(', ') : ''}`,
    priceChanged: `${priceChanged.length}${priceChanged.length ? ': ' + priceChanged.slice(0, 10).join(', ') : ''}`,
    availabilityChanged: `${availabilityChanged.length}`,
    imageChanged: `${imageChanged.length}`,
  };
}

// ──────────────────────────── XLSX Output ──────────────────────────────────

async function writeXlsx(path, products, catReport, errors) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'TabCatalogMigration';
  wb.created = new Date();

  // Sheet: Products
  const ws = wb.addWorksheet('Products');
  const headers = ['Կոdel', 'Del', 'Del', 'Del', 'Del', 'Del', 'Del', 'Del', 'Del', 'Del', 'Del', 'Del', 'Del', 'Del'];
  ws.columns = headers.map((h, i) => ({ header: h, key: `col${i}`, width: i === 0 ? 12 : i === 1 ? 50 : 20 }));

  for (const p of products) {
    ws.addRow({
      col0: p.code || '',
      col1: p.title || '',
      col2: (p.categories || []).map(c => c.name).join(' | '),
      col3: p.categoryName || '',
      col4: p.brand || '',
      col5: p.model || '',
      col6: p.price ?? '',
      col7: p.oldPrice ?? '',
      col8: p.availability || '',
      col9: p.shortDesc || '',
      col10: Object.entries(p.specs || {}).map(([k, v]) => `${k}: ${v}`).join('\n'),
      col11: p.image || '',
      col12: (p.images || []).join('\n'),
      col13: p.sourceUrl || '',
    });
  }

  // Style header row
  ws.getRow(1).font = { bold: true };
  ws.getRow(1).alignment = { vertical: 'middle', wrapText: true };
  ws.views = [{ state: 'frozen', ySplit: 1 }];
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: headers.length } };

  // Sheet: Report
  const rws = wb.addWorksheet('Report');
  rws.columns = [
    { header: 'Category', key: 'cat', width: 30 },
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Expected', key: 'exp', width: 12 },
    { header: 'Found', key: 'found', width: 10 },
    { header: 'Diff', key: 'diff', width: 10 },
  ];
  for (const r of catReport) {
    const diff = r.expected ? ((r.found - r.expected) / r.expected * 100) : 0;
    rws.addRow({ cat: r.category, name: r.name, exp: r.expected, found: r.found, diff: diff.toFixed(1) + '%' });
  }

  // Sheet: Issues
  const iws = wb.addWorksheet('Issues');
  iws.columns = [
    { header: 'Type', key: 'type', width: 20 },
    { header: 'Code', key: 'code', width: 12 },
    { header: 'Title', key: 'title', width: 40 },
    { header: 'Details', key: 'details', width: 50 },
  ];
  iws.getRow(1).font = { bold: true };
  for (const p of products) {
    if (p.price === null) iws.addRow({ type: 'no_price', code: p.code, title: p.title, details: 'price is null' });
    if (!p.images?.length) iws.addRow({ type: 'no_image', code: p.code, title: p.title, details: '' });
    if (!p.brand) iws.addRow({ type: 'no_brand', code: p.code, title: p.title, details: '' });
    if (p.codeSource === 'fallback_product_id') iws.addRow({ type: 'fallback_code', code: p.code, title: p.title, details: 'used product_id as code' });
  }
  for (const e of (errors?.slice?.(0, 50) || [])) {
    iws.addRow({ type: 'invalid', code: e.record?.code || '', title: e.record?.title || '', details: (e.errors || []).join('; ') });
  }

  await wb.xlsx.writeFile(path);
}

// ──────────────────────────── Helpers ──────────────────────────────────────

function eta(startMs, processed, total) {
  if (!processed) return '--';
  const elapsed = Date.now() - startMs;
  const perItem = elapsed / processed;
  const remaining = Math.round((total - processed) * perItem / 1000);
  if (remaining < 60) return `${remaining}s`;
  return `${Math.round(remaining / 60)}m`;
}

// ──────────────────────────── Run ──────────────────────────────────────────

main().catch(e => { console.error('\n✖ Fatal:', e); process.exit(1); });
