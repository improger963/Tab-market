/**
 * Text utilities for the tab.am catalog crawler.
 * Handles Armenian UTF-8 text, NBSP normalization, price parsing, slug generation.
 */

/** Normalize text: NFC, collapse whitespace, replace NBSP and narrow NBSP. */
export function cleanText(s) {
  if (!s) return '';
  return s
    .normalize('NFC')
    .replace(/\u00A0/g, ' ')       // NBSP → space
    .replace(/\u202F/g, ' ')       // narrow NBSP → space
    .replace(/\u2009/g, ' ')       // thin space → space
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parse an Armenian-formatted price string to an integer (AMD).
 * Handles: "28 000Դր.", "1 900Դր.", "160 650Դր.", "107 100 Դր.", "42000֏", "35 500"
 * Returns null for empty/unparseable/zero.
 */
export function cleanPrice(raw) {
  if (!raw) return null;
  // Strip everything except digits and space-like separators
  const s = raw
    .normalize('NFC')
    .replace(/[\u00A0\u202F\u2009]/g, ' ')
    .replace(/[^\d]/g, '')   // keep only digits
    ;
  const n = parseInt(s, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Extract the KOD number from a title like "… (ԿՈԴ 8899)" or "…(ԿՈԴ 13317)".
 * Returns the string digits or null.
 */
export function extractCodeFromTitle(title) {
  if (!title) return null;
  const m = title.match(/\(ԿՈԴ\s*(\d+)\)/);
  return m ? m[1] : null;
}

/**
 * Remove trailing "(ԿՈԴ NNNNN)" from a title and clean extra spaces.
 */
export function stripCodeFromTitle(title) {
  if (!title) return '';
  return cleanText(title.replace(/\s*\(ԿՈԴ\s*\d+\)\s*$/, ''));
}

/**
 * Generate a URL-friendly slug from a product URL path.
 * e.g. "/Santekhnika/tsorakner/khohanotsi-tsorak/ledeme-rl4080b-2-8899"
 *   → "ledeme-rl4080b-2-8899"
 * If slug collides, append "-<sourceId>".
 */
export function slugFromUrl(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] || null;
  } catch {
    // handle relative or malformed
    const parts = url.replace(/[?#].*$/, '').split('/').filter(Boolean);
    return parts[parts.length - 1] || null;
  }
}

/**
 * Canonicalize a product URL: strip query params like limit, page, sort, path,
 * and trailing slashes/hash. Keep the SEO path intact.
 */
export function canonicalUrl(url) {
  try {
    const u = new URL(url);
    u.hash = '';
    // remove known tracking/pagination params
    for (const k of ['limit', 'page', 'sort', 'order', 'path', 'search', 'description']) {
      u.searchParams.delete(k);
    }
    let s = u.toString();
    // remove trailing slash before query
    s = s.replace(/\/(\?|$)/, '$1');
    return s;
  } catch {
    return url.replace(/[?#].*$/, '').replace(/\/$/, '');
  }
}

/**
 * Extract OpenCart product_id from various sources on the page.
 */
export function extractProductId(html) {
  // hidden input
  const inp = html.match(/name="product_id"\s+value="(\d+)"/);
  if (inp) return inp[1];
  // cart.add('NNNN', ...)
  const cart = html.match(/cart\.add\('(\d+)'/);
  if (cart) return cart[1];
  // data-product-id
  const dp = html.match(/data-product-id="(\d+)"/);
  if (dp) return dp[1];
  return null;
}

/**
 * Convert an OpenCart cache image URL to the original catalog URL.
 * "https://tab.am/image/cache/catalog/PATH-1024x1024.jpg"
 *   → "https://tab.am/image/catalog/PATH.jpg"
 * Returns null if input doesn't match the cache pattern.
 */
export function cacheToOriginal(url) {
  if (!url) return null;
  const m = url.match(/^(https?:\/\/[^/]+)\/image\/cache\/(catalog\/.+?)-\d+x\d+\.(jpg|jpeg|png|webp|gif)$/i);
  if (!m) return null;
  return `${m[1]}/image/${m[2]}.${m[3]}`;
}

/**
 * Pick the best (largest) image URL from a set of cache/original candidates.
 * Prefers the 1024x1024 cache version (it's confirmed available).
 */
export function bestImageUrl(urls) {
  // prefer 1024x1024
  const hi = urls.find(u => /1024x1024/.test(u));
  if (hi) return hi;
  // then next largest
  const sized = urls
    .map(u => ({ url: u, size: parseInt((u.match(/-(\d+)x\d+\./) || [0, '0'])[1], 10) }))
    .sort((a, b) => b.size - a.size);
  return sized[0]?.url || urls[0] || null;
}

/**
 * Detect if an image is a blueprint/drawing based on filename/alt keywords.
 */
export function isBlueprintImage(url, alt) {
  const keywords = /\b(cad|draw|scheme|chert|գծագdel)\b/i;
  const name = (url || '') + ' ' + (alt || '');
  return keywords.test(name) ? url : null;
}

/** Seed brand list (uppercase). Dynamically expanded during crawl. */
export const SEED_BRANDS = [
  'GANZER', 'VIEIR', 'LEDEME', 'HANSEN', 'GERHANS', 'YAGA', 'ACCOONA',
  'LEMARK', 'BRAVAT', 'VALTEC', 'BAXI', 'CERSANIT', 'GEBERIT', 'AQUANT',
  'RADOX', 'KARCHER', 'RANDY', 'WATERFALL', 'SALAT', 'TOTO', 'GUSTAV',
  'JEMY', 'SHUI', 'PRIXMO', 'MOON', 'BAIN', 'SILAVAS', 'GSI', 'ROCA',
  'JEVA', 'ANELING', 'IDEAL', 'SCARAB', 'VITRA', 'BELIT', 'MILLANO',
  'CONordo', 'NEOULA', 'ALAVANT', 'APPOLLG', 'AQUA', 'BETYLR',
];

/**
 * Try to extract brand from a title using the known brand set.
 * Returns { brand, brandSource, model } or nulls.
 */
export function extractBrandModel(title, brandSet) {
  if (!title) return { brand: null, brandSource: null, model: null };
  // Find uppercase Latin tokens (2+ chars) in title
  const tokens = title.match(/\b[A-Z][A-Za-z0-9]{1,}(?:-[A-Za-z0-9]+)*\b/g) || [];
  let brand = null;
  let brandSource = null;
  let model = null;

  for (const tok of tokens) {
    const upper = tok.toUpperCase();
    if (brandSet.has(upper)) {
      brand = upper;
      brandSource = 'title_token';
      // model = alphanumeric token(s) after brand in the token list
      const idx = tokens.indexOf(tok);
      const afterBrand = tokens.slice(idx + 1).filter(t => !brandSet.has(t.toUpperCase()));
      // model is next 1-2 tokens that look model-like (contain digits or are all-caps with numbers)
      const modelToks = [];
      for (const t of afterBrand.slice(0, 3)) {
        if (/\d/.test(t) || /^[A-Z0-9-]+$/.test(t)) {
          modelToks.push(t);
          if (modelToks.length >= 2) break;
        } else break;
      }
      if (modelToks.length) model = modelToks.join(' ');
      break;
    }
  }

  return { brand, brandSource, model };
}

/**
 * Armenian label → normalized English key map.
 * Keys are Armenian Unicode block U+0530–U+058F.
 */
export const SPEC_MAP = Object.freeze({
  'Տեսակ': 'type',          // Տեսակ = Tesak
  'Նյութ': 'material',          // Նյութ = Nyut
  'Գույն': 'color',             // Գույն = Ghuyn
  'Լայնություն': 'width', // Լայնություն = Laynutyun
  'Եերխարություն': 'length', // Եերխարություն = Yerkarutyun
  'Բարձրություն': 'height', // Բարձրություն = Barzrootyun
  'Տրամագիծ': 'diameter',  // Տրամագիծ = Dramagitse
  'Երաշխիք': 'warrantyYears',   // Երաշխիք = Yerashqik
  'Արտադրող': 'manufacturer', // Արտադրող = Artadzhogh
});

/**
 * Normalize an Armenian spec label to an English key if recognized.
 * Falls back to the original label.
 */
export function normalizeSpecKey(label) {
  return SPEC_MAP[label] ?? label;
}

/**
 * Parse warranty years from Armenian text like "5 տարի" (tari = year)
 * or "24 ամիս" (amis = month). Returns integer years or null.
 */
export function parseWarrantyYears(text) {
  if (!text) return null;
  const y = text.match(/(\d+)\s*տարի/);  // "tari" = year
  if (y) return parseInt(y[1], 10);
  const mo = text.match(/(\d+)\s*ամիս/);  // "amis" = month
  if (mo) return Math.floor(parseInt(mo[1], 10) / 12) || null;
  return null;
}

/**
 * Try to parse a numeric value with unit (e.g. "600 մմ" = 600mm).
 * Returns {value, unit} or null.
 */
export function parseValueUnit(text) {
  if (!text) return null;
  const m = text.match(/^([d.,-]+)s*(.+)$/);
  if (m) return { value: m[1], unit: m[2].trim() };
  return null;
}
