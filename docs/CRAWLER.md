# TAB.AM Catalog Crawler

Full-catalog crawler for migrating the tab.am OpenCart store into the storefront's server-side dataset.

## Quick Start

```bash
# Dry run: smallest category, 5 products, no cache
npm run crawl:dry

# Full crawl (respects all validation gates)
npm run crawl

# Override a failing gate (use with caution)
node scripts/crawl-tab.mjs --force
```

## CLI Flags

| Flag | Description | Default |
|------|-------------|---------|
| `--category <slug>` | Crawl only specified category (repeatable) | all |
| `--limit-products <n>` | Dry run: stop after N product pages | ∞ |
| `--concurrency <n>` | Max parallel requests | 3 |
| `--delay <ms>` | Min delay between requests (politeness) | 400 |
| `--refresh` | Force re-fetch, overwrite cache | off |
| `--no-cache` | Bypass cache reads | off |
| `--download-images` | Download originals to `public/products/` | off |
| `--force` | Promote output even if gates fail | off |
| `--ignore-robots` | Override robots.txt (owner use only) | off |
| `--out <dir>` | Output directory | `data/` |
| `--verbose` | Extra logging | off |

## Output Files

| File | Purpose |
|------|---------|
| `data/products.json` | Live catalog (promoted from `.next.json` on gate pass) |
| `data/products.next.json` | Intermediate output before promotion |
| `data/products.prev.json` | Backup of previous `products.json` |
| `data/products.original-backup.json` | Pristine pre-migration storefront catalog (manual safety copy) |
| `data/crawl-errors.json` | Products that failed zod validation |
| `data/crawl-report.json` | Full crawl metrics |
| `data/categories.json` | Category list with computed counts |
| `data/brands.json` | Brand frequency report |
| `data/products.xlsx` | Excel workbook: Products / Report / Issues sheets |

## Cache & Resumability

- Raw HTML is cached under `.cache/crawl/<sha1(url)>.html` (24h freshness window).
- Progress checkpoint at `.cache/crawl/state.json` — `Ctrl+C` flushes; re-running resumes without re-fetching.
- To clear: `rm -rf .cache/crawl/` (or equivalent on Windows).

## Validation Gates

The crawl fails (exit code 1, live dataset untouched) unless ALL gates pass:

1. **Category reconciliation**: each category found count within ±1% of the expected baseline.
   The baseline is **sitemap.xml** (owner decision): shortfall beyond −1% fails; overage is a warning (stale sitemap).
   Nav-badge counts are kept as `navBadge` for reference only (they are stale site-side).
2. **Title+sourceId coverage**: ≥ 99% of products have both
3. **Price coverage**: < 2% of products have `price = null`
4. **Slug uniqueness**: no duplicate slugs after collision resolution
5. **Valid prices**: no `price ≤ 0` or `oldPrice ≤ price`
6. **Clean titles**: no HTML tags in title fields
7. **Volume vs prev**: total products ≥ 90% of previous run
8. **Sitemap zero-loss coverage**: every in-scope product URL listed in sitemap.xml was captured (missed = 0)

Scope is **Plumbing (Santekhnika) only** (owner decision): doors, laminate, vinyl and wallpaper
products reachable outside the Santekhnika nav tree are intentionally not crawled.

Use `--force` to bypass (logged in report).

## Weekly Re-run (cron)

The crawl is idempotent: re-running with a warm cache produces an identical dataset. A cold run (cache older than 24h) re-fetches all pages.

Recommended weekly schedule:
```bash
# Monday 06:00 Armenia time
node scripts/crawl-tab.mjs --refresh --ignore-robots
```

## Known Limitations

1. **Main price source (critical)**: on detail pages the product's own price is rendered in a
   `ul.list-unstyled` block (`<li><h2>` = current, `<li><span style="line-through">` = old).
   All `.price-new`/`.price-old` spans on the page belong to specials/related **carousel tiles**
   (`.product-thumb`) and are shared across every product — extraction must never read them as
   the main price (guarded by unit tests). Products showing `0Դր.` are stored as `price: null`
   with `priceOnRequest: true` (no fabricated prices).
2. **No explicit stock quantity**: the site shows a "Buy" button but no numeric stock count. Products get `availability: "in_stock"` (heuristic) and `stockQuantity: null`.
3. **Brand detection**: relies on uppercase Latin tokens in titles. Unmatched tokens are reported for manual review in `crawl-report.json`.
4. **Out-of-stock detection**: the crawler has no confirmed out-of-stock page sample; if the site changes layout or removes the buy button, availability may default to `unknown`.
5. **Image originals**: the `/image/cache/` URLs (e.g. 1024×1024) are used directly. The original `/image/catalog/` path often returns 404; originals are not promoted.
6. **`--download-images`**: optional; downloads originals to `public/products/<sourceId>/`. Requires network access and is slow for large runs.
7. **ERP vendor terms**: no filtering is applied to brand stories in descriptions; owner review recommended before customer-facing publication.

## Architecture

```
scripts/
  crawl-tab.mjs              ← CLI entry point (all phases)
  crawler/
    text.mjs                 ← Armenian text utils, price parsing, SPEC_MAP
    http.mjs                 ← fetch, caching, retries, rate-limiter, state
    parse.mjs                ← Cheerio page parsers (listing + detail)
    selectors.md             ← documented CSS selectors (from live fixtures)
    __fixtures__/            ← saved HTML pages for offline testing
      robots.txt
      home.html
      category-list.html     (parent category with sub-cats)
      category-list-child.html (leaf category with 100 tiles)
      category-leaf-sifon.html
      category-clearance.html
      product-discount.html  (main price block + carousel tiles with DIFFERENT prices)
      product-attrs.html     (product with specs table)
    __tests__/
      crawler.test.mjs       ← node:test suite (40 tests, no network)
```

## Data Policy

- `data/products.json` is a **SERVER-ONLY** file. It must never be imported by client components.
- The `data/products.ts` module loads it server-side and exports the typed array.
- Verify no client imports: `grep -r "products.json" app/ components/ store/` must return only server files.

## Owner Input Needed

Please review and confirm:
1. **Brand list**: check `data/brands.json` output; add missing brand names
2. **Clearance display**: how should "Լիdel" (clearance) items appear on the new storefront?
3. **Excluded products**: any SKUs that should be skipped permanently?
4. **Image keyword rules**: confirm `cad|draw|scheme|chert|del` keyword set for blueprint images
5. **Third-party imagery**: permission for brand logo/product images from manufacturers
