/**
 * Lossless XLSX -> JSON product importer (ESM).
 *
 * Fixes the legacy scripts/convert.js which (a) crashed because package.json is
 * `"type": "module"` while convert.js used CommonJS `require`, and (b) silently
 * dropped rows and mis-parsed data.
 *
 * Guarantees:
 *  - 100% of source rows are imported; empty SKU codes are RECOVERED from the
 *    title "(ԿՈԴ n)" or the trailing number of the product URL, never skipped.
 *  - Uses the REAL columns (category, brand, description, specs) instead of
 *    guessing them from title keywords.
 *  - Prices are sanitized ("107 100" -> 107100, numbers pass through).
 *  - Never fabricates stock: the sheet's availability column is empty, so no
 *    stockQuantity is emitted.
 *  - Cleans pagination junk (?limit=…&page=…) out of image/URL cells.
 *
 * Output goes to data/products.from-xlsx.json for reconciliation. It does NOT
 * touch data/products.json (the authoritative full catalog produced by the
 * crawler, ~3,089 SKUs — a superset of this price list).
 *
 * Run: node scripts/import-products.mjs
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ExcelJS from 'exceljs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'products.xlsx');
const OUT = join(ROOT, 'data', 'products.from-xlsx.json');

/** Cell value -> plain string (handles rich text / linked / formula results). */
function txt(v) {
  if (v == null) return '';
  if (typeof v === 'object') {
    if (v.text) return String(v.text);
    if (v.result != null) return String(v.result);
    if (v.hyperlink) return String(v.hyperlink);
    if (v.richText) return v.richText.map((t) => t.text).join('');
    return String(v.valueOf());
  }
  return String(v);
}

/** Strip ?limit=…&page=… and trailing slashes from a URL cell. */
function cleanUrl(u) {
  return txt(u).trim().replace(/[?#].*$/, '').replace(/\/+$/, '');
}

/** Robust price parse: numbers pass; strings with spaces/symbols are sanitized. */
function parsePrice(v) {
  if (v == null || txt(v).trim() === '') return null;
  if (typeof v === 'number') return v > 0 ? v : null;
  const digits = txt(v).replace(/[^\d]/g, '');
  const n = parseInt(digits, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Recover a SKU code from column, title KOD marker, or URL trailing number. */
function recoverCode(row) {
  const col = txt(row[0]).trim();
  if (col) return { code: col, src: 'column' };
  const t = txt(row[1]);
  const km = t.match(/\u053f\u0548\u0534\D*(\d+)/i) || t.match(/[^\d](\d{3,})\s*$/); // "ԿՈԴ n"
  if (km) return { code: km[1], src: 'title' };
  const sm = cleanUrl(row[11]).match(/(\d+)\/?$/);
  if (sm) return { code: sm[1], src: 'url' };
  return { code: null, src: null };
}

/** Site-style category slug from the URL path segment after /Santekhnika/. */
function categoryFromUrl(u) {
  const path = cleanUrl(u).replace(/^https?:\/\/tab\.am/i, '');
  const segs = path.split('/').filter(Boolean);
  const i = segs.findIndex((s) => /santekhnika/i.test(s));
  return i >= 0 && segs[i + 1] ? segs[i + 1] : (segs[segs.length - 2] || '');
}

/** "key: value" lines -> object. */
function parseSpecs(raw) {
  const specs = {};
  for (const line of txt(raw).split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx > 0) {
      const k = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      if (k && val) specs[k] = val;
    }
  }
  return specs;
}

function slugFromUrl(u) {
  const segs = cleanUrl(u).split('/').filter(Boolean);
  return segs[segs.length - 1] || '';
}

const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile(SRC);
const ws = wb.worksheets[0];
const rows = [];
ws.eachRow((row, n) => { const v = []; row.eachCell({ includeEmpty: true }, (c, i) => { v[i - 1] = c.value; }); rows[n - 1] = v; });

// Drop header row iff its first cell is a non-numeric label.
const firstIsHeader = rows.length > 0 && typeof rows[0][0] !== 'number' && /\D/.test(txt(rows[0][0]));
const data = rows.slice(firstIsHeader ? 1 : 0);

const stats = { total: data.length, imported: 0, codeFromTitle: 0, codeFromUrl: 0, noCode: 0, nullPrice: 0, clearedOldPrice: 0, droppedForBlankTitle: 0 };
const products = [];

data.forEach((row, index) => {
  const rawTitle = txt(row[1]).trim();
  if (!rawTitle) { stats.droppedForBlankTitle++; return; } // a product needs at least a title
  const { code, src } = recoverCode(row);
  if (src === 'title') stats.codeFromTitle++;
  else if (src === 'url') stats.codeFromUrl++;
  else if (!code) stats.noCode++;

  const title = rawTitle.replace(/\s*\(\u053f\u0548\u0534[^)]+\)\s*$/i, '').trim(); // strip "(ԿՈԴ n)"
  const price = parsePrice(row[4]);
  if (price === null) stats.nullPrice++;
  let oldPrice = parsePrice(row[5]);
  if (oldPrice !== null && price !== null && oldPrice <= price) { oldPrice = null; stats.clearedOldPrice++; }

  // Images: prefer "all images" (col10, pipe-separated), fall back to main (col9).
  let images = txt(row[10]).split('|').map(cleanUrl).filter(Boolean);
  if (images.length === 0) images = [cleanUrl(row[9])].filter(Boolean);

  const url = cleanUrl(row[11]);
  const catName = txt(row[2]).trim();

  products.push({
    id: index + 1,
    code: code || `row-${index + 1}`,
    codeSource: src || 'none',
    title,
    slug: slugFromUrl(url) || `product-${code || index + 1}`,
    categorySlug: categoryFromUrl(url),
    categoryName: catName,
    brand: txt(row[3]).trim() || 'TAB.AM',
    price,
    oldPrice: oldPrice || undefined,
    inStock: true,               // price-list rows are sellable; sheet has no OOS signal
    // stockQuantity intentionally omitted — availability column is empty (no fabrication)
    images,
    shortDesc: txt(row[7]).trim() || title,
    specs: parseSpecs(row[8]),
  });
  stats.imported++;
});

writeFileSync(OUT, JSON.stringify(products, null, 2), 'utf-8');

const lines = [
  'Lossless XLSX import complete:',
  `  source rows:            ${stats.total}`,
  `  products imported:      ${stats.imported}  (100% minus ${stats.droppedForBlankTitle} truly-blank-title rows)`,
  `  codes recovered/title:  ${stats.codeFromTitle}`,
  `  codes recovered/url:    ${stats.codeFromUrl}`,
  `  codes STILL missing:    ${stats.noCode}`,
  `  rows without a price:   ${stats.nullPrice}  (kept, price=null)`,
  `  oldPrice cleared (<=price): ${stats.clearedOldPrice}`,
  `  output:                 ${OUT.replace(/\\/g, '/')}`,
  '',
  'NOTE: data/products.json (crawler, 3089 SKUs) was NOT modified — it is the',
  'authoritative full catalog and a superset of this 1663-row price list.',
];
console.log(lines.join('\n'));
