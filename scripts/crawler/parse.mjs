/**
 * parse.mjs – Cheerio-based page parsers for tab.am OpenCart store.
 * All selectors are documented in selectors.md and confirmed via live fixtures.
 */
import * as cheerio from 'cheerio';
import { createHash } from 'node:crypto';
import {
  cleanText, cleanPrice, extractCodeFromTitle, stripCodeFromTitle,
  slugFromUrl, canonicalUrl, extractProductId, bestImageUrl,
  cacheToOriginal, SEED_BRANDS, extractBrandModel,
} from './text.mjs';

const ORIGIN = 'https://tab.am';

// ─────────────────────────── Category Discovery ───────────────────────────

/**
 * Parse the homepage or a top-category page to discover all leaf category URLs.
 * Returns an array of { name, slug, url, expectedCount }.
 */
export function parseCategoryLinks(html) {
  const $ = cheerio.load(html);
  const cats = [];
  // nav / sidebar list-group links under /Santekhnika
  $('a[href*="/Santekhnika"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const text = cleanText($(el).text());
    const m = text.match(/^(.+?)\s*\((\d+)\)\s*$/);
    if (!m) return;
    const name = m[1].trim();
    const expectedCount = parseInt(m[2], 10);
    const url = href.startsWith('http') ? href : ORIGIN + href;
    // slug = last path segment
    const parts = url.replace(/[?#].*/, '').split('/').filter(Boolean);
    const slug = parts[parts.length - 1] || null;
    if (!slug) return;
    // skip the top-level "Santekhnika/Other" link itself
    if (slug === 'Santekhnika') return;
    cats.push({ name, slug, url, expectedCount });
  });
  // deduplicate by slug keeping first occurrence
  const seen = new Set();
  return cats.filter(c => { if (seen.has(c.slug)) return false; seen.add(c.slug); return true; });
}

/**
 * Discover sub-categories from a category listing page (for parent categories
 * that show .catalog-section links rather than product tiles).
 */
export function parseSubCategories(html) {
  const $ = cheerio.load(html);
  const subs = [];
  $('div.catalog-section, a.catalog-section').each((_, el) => {
    const $el = $(el);
    const href = $el.attr('href') || $el.find('a').first().attr('href') || '';
    const cap = $el.find('.catalog-section__caption').text() || $el.text();
    const text = cleanText(cap);
    const m = text.match(/^(.+?)\s*\((\d+)\)\s*$/);
    if (!m || !href) return;
    const name = m[1].trim();
    const expectedCount = parseInt(m[2], 10);
    const url = href.startsWith('http') ? href : ORIGIN + href;
    const parts = url.replace(/[?#].*/, '').split('/').filter(Boolean);
    const slug = parts[parts.length - 1] || null;
    if (slug) subs.push({ name, slug, url, expectedCount });
  });
  const seen = new Set();
  return subs.filter(c => { if (seen.has(c.slug)) return false; seen.add(c.slug); return true; });
}

/**
 * Parse tab.am's sitemap.xml into an AUTHORITATIVE per-category product map.
 * The site's nav-menu badge counts are unreliable (e.g. the bathroom-accessories
 * badge advertises 741 while the category truly contains 122 products). The
 * sitemap is machine-generated and lists every public product URL, so we use
 * it as the reconciliation baseline and zero-loss guard.
 *
 * Product URLs look like `/Santekhnika/<topCat>/[<sub>/...]<product-slug>`.
 * Category pages also appear; a segment that is a non-terminal ancestor of any
 * other URL is a category, not a product, and is excluded.
 *
 * @param {string} xml sitemap.xml contents
 * @param {Set<string>} [scopeSlugs] if provided, only bucket these top categories
 * @returns {{ byCat: Map<string,Set<string>>, totalScoped: number, allProductLeaves: Set<string> }}
 */
export function parseSitemap(xml, scopeSlugs) {
  const urls = [...xml.matchAll(/<loc>\s*([^\s<]+)\s*<\/loc>/g)].map(m => m[1]);
  // First pass: collect every non-terminal path segment = a category ancestor.
  const ancestors = new Set();
  const parsed = [];
  for (const raw of urls) {
    let path;
    try { path = new URL(raw).pathname; } catch { continue; }
    const segs = path.split('/').filter(Boolean);
    parsed.push(segs);
    for (let i = 0; i < segs.length - 1; i++) ancestors.add(segs[i]);
  }
  const byCat = new Map();
  const allProductLeaves = new Set();
  for (const segs of parsed) {
    const idx = segs.indexOf('Santekhnika');
    if (idx === -1 || segs.length <= idx + 1) continue; // not under the Santekhnika tree
    const topCat = segs[idx + 1];
    if (topCat === 'Santekhnika') continue;
    if (scopeSlugs && !scopeSlugs.has(topCat)) continue;
    const leaf = segs[segs.length - 1];
    if (leaf === topCat) continue;             // the category landing page itself
    if (ancestors.has(leaf)) continue;         // it's a sub-category page, not a product
    if (!byCat.has(topCat)) byCat.set(topCat, new Set());
    byCat.get(topCat).add(leaf);
    allProductLeaves.add(leaf);
  }
  let totalScoped = 0;
  for (const s of byCat.values()) totalScoped += s.size;
  return { byCat, totalScoped, allProductLeaves };
}

// ─────────────────────────── Listing Page ─────────────────────────────────

/**
 * Parse a category listing page and return product entries and pagination info.
 * @returns {{products: Array, subCategories: Array, hasNextPage: boolean, totalPages: number}}
 */
export function parseListingPage(html, categorySlug, categoryName) {
  const $ = cheerio.load(html);
  const products = [];

  $('div.product-thumb').each((_, el) => {
    const $el = $(el);
    // Title & URL
    const $link = $el.find('h4 > a').first();
    let href = $link.attr('href') || '';
    const rawTitle = cleanText($link.text());
    if (!rawTitle) return;
    // Resolve URL
    if (href && !href.startsWith('http')) href = ORIGIN + href;
    // OpenCart product_id from cart.add('NNN', ...)
    const btnHtml = $el.html() || '';
    const srcIdMatch = btnHtml.match(/cart\.add\('(\d+)'/);
    const sourceId = srcIdMatch ? srcIdMatch[1] : null;
    // Prices
    const priceRaw = $el.find('.price-new').first().text();
    const oldPriceRaw = $el.find('.price-old').first().text();
    // Card-level image (fallback)
    const imgHref = $el.find('.image > a').first().attr('href') || '';
    const imgSrc = $el.find('.image > a > img').first().attr('src') || '';
    const cardImage = imgHref || imgSrc || null;

    products.push({
      rawTitle,
      sourceId,
      sourceUrl: href ? canonicalUrl(href) : null,
      slug: slugFromUrl(href),
      cardPrice: cleanPrice(priceRaw),
      cardOldPrice: cleanPrice(oldPriceRaw),
      cardImage: cardImage || null,
      categorySlug,
      categoryName,
    });
  });

  // Sub-categories (this might be a parent category page)
  const subCategories = parseSubCategories(html);

  // Pagination – check for next page link
  let hasNextPage = false;
  let totalPages = 1;
  $('ul.pagination li a').each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr('href') || '';
    if (text === '>|' || text === '›') {
      hasNextPage = true;
      const pm = href.match(/page=(\d+)/);
      if (pm) totalPages = parseInt(pm[1], 10);
    }
    const pageNum = parseInt(text, 10);
    if (Number.isFinite(pageNum) && pageNum > totalPages) totalPages = pageNum;
  });
  // If there's any page link > current, there's a next page
  if ($('ul.pagination li a[href*="page=2"]').length > 0) hasNextPage = true;

  return { products, subCategories, hasNextPage, totalPages };
}

// ─────────────────────────── Product Detail Page ──────────────────────────

/**
 * Parse a product detail page HTML and extract all fields.
 * @returns {object} a product record
 */
export function parseProductPage(html, listingEntry, brandSet) {
  const $ = cheerio.load(html);

  // ── IDs & URLs ──
  let sourceId = listingEntry.sourceId;
  if (!sourceId) {
    // Try hidden input
    const inp = $('input[name="product_id"]').first().attr('value');
    if (inp) sourceId = inp;
    else {
      const pidMatch = html.match(/cart\.add\('(\d+)'/);
      if (pidMatch) sourceId = pidMatch[1];
    }
  }
  const sourceUrl = listingEntry.sourceUrl || null;
  const slug = listingEntry.slug || slugFromUrl(sourceUrl) || null;

  // ── Title & Code ──
  const h1 = $('h1').first().text();
  const rawTitle = cleanText(h1) || listingEntry.rawTitle || '';
  const codeFromTitle = extractCodeFromTitle(rawTitle);
  const title = stripCodeFromTitle(rawTitle);

  // Model/code line: Armenian "\u0544\u0578\u0564\u0565\u056c\u0568:" (= "Modely:")
  // Starts with Armenian Capital Men U+0544; use Unicode range for Armenian chars U+0530–U+058F
  let modelField = null;
  $('ul.list-unstyled li').each((_, el) => {
    const txt = cleanText($(el).text());
    // Must start with Armenian block char, then colon+space, then value
    const m = txt.match(/^[\u0530-\u058F][^:]*:\s*(.+)$/);
    if (m && m[1]) modelField = m[1].trim();
  });
  if (!modelField) {
    // Broader fallback: any <li> with Armenian block letter followed by digits
    $('li').each((_, el) => {
      const txt = $(el).text();
      const m = txt.match(/^[\u0544][^\d]*(\d+)/);
      if (m && !modelField) modelField = m[1];
    });
  }

  // Code resolution: title KOD > model field > fallback product_id
  let code = null;
  let codeSource = null;
  if (codeFromTitle) { code = codeFromTitle; codeSource = 'title'; }
  else if (modelField) { code = String(modelField); codeSource = 'model_field'; }
  else if (sourceId) { code = String(sourceId); codeSource = 'fallback_product_id'; }

  // ── Brand & Model ──
  const { brand, brandSource, model } = extractBrandModel(rawTitle, brandSet);

  // ── Prices ──
  // On tab.am detail pages the product's OWN price is rendered in a
  // ul.list-unstyled block: <li><span style="line-through">OLD</span></li>
  // <li><h2>NEW</h2></li>. The shared .price-new / .price-old spans that appear
  // elsewhere on the page belong to specials/related CAROUSEL TILES (.product-thumb)
  // and are identical across every product — they must NEVER be read as the main
  // price. So we read the main-price block first, then only fall back to
  // .price-new/.price-old that are NOT inside a tile (legacy templates), then the
  // listing card price.
  let price = null;
  let oldPrice = null;

  // Method 1 (authoritative): main price block (h2 current + line-through old).
  const $priceUl = $('ul.list-unstyled').filter((_, ul) => {
    const $ul = $(ul);
    const $h2 = $ul.find('li h2').first();
    const hasPriceH2 = $h2.length > 0 && /\d/.test($h2.text());
    const hasLineThrough = $ul.find('li span[style*="line-through"]').filter((__, s) => /\d/.test($(s).text())).length > 0;
    return hasPriceH2 || hasLineThrough;
  }).first();
  if ($priceUl.length) {
    const $h2 = $priceUl.find('li h2').filter((_, h) => /\d/.test($(h).text())).first();
    if ($h2.length) price = cleanPrice($h2.text());
    const $old = $priceUl.find('li span[style*="line-through"]').filter((_, s) => /\d/.test($(s).text())).first();
    if ($old.length) oldPrice = cleanPrice($old.text());
  }

  // Method 2: .price-new / .price-old scoped OUTSIDE carousel tiles (legacy).
  if (price === null) {
    const $pn = $('.price-new').filter((_, el) => $(el).closest('.product-thumb').length === 0).first();
    if ($pn.length) price = cleanPrice($pn.text());
  }
  if (oldPrice === null) {
    const $po = $('.price-old').filter((_, el) => $(el).closest('.product-thumb').length === 0).first();
    if ($po.length) oldPrice = cleanPrice($po.text());
  }

  // Fallback: card-level prices from listing
  if (price === null && listingEntry.cardPrice != null) price = listingEntry.cardPrice;
  if (oldPrice === null && listingEntry.cardOldPrice != null) oldPrice = listingEntry.cardOldPrice;

  // Validation rules
  let priceOnRequest = false;
  if (price === null || price === 0) { price = null; priceOnRequest = true; }
  if (oldPrice !== null && price !== null && oldPrice <= price) oldPrice = null;
  if (oldPrice !== null && oldPrice === 0) oldPrice = null;

  // ── Availability ──
  // Primary heuristic: presence of buy button (#button-cart) means purchasable.
  // Armenian out-of-stock phrases (U+0535/U+054D starting words) would be detected below.
  const hasBuyButton = $('button#button-cart').length > 0;
  let availability = 'unknown';
  let inStock = null;
  if (hasBuyButton) { availability = 'in_stock'; inStock = true; }
  // Detect explicit out-of-stock Armenian text (search only the product section, not full page)
  const $prodSection = $('#product').length ? $('#product').text() : '';
  const outOfStockRe = /\u0547\u0561\u0577\u0578\u0582\u0577\u0561\u0572\u056b\s*\u0567\s*\u0574\u0561\u057d\|\u0549\u0561\u0572\u057e\u0561\s*\u0567\|\u0544\u0561\u057f\u0579\u0565\u056c\u056b\s*\u0567/i;
  if (outOfStockRe.test($prodSection)) { availability = 'out_of_stock'; inStock = false; }
  // Preorder: Armenian \u053f\u0561\u0576\u0561\u0576\u056b\u0576\u0561\u0575\u056b\u0576 (kanakhnum = pre-order)
  if (/\u053f\u0561\u0576\u0561\u0576\u056b\u0576\u0561\u0575\u056b\u0576|\u057a\u057c\u0561\u0570\u0561\u0576\u0565\u056c/i.test($prodSection)) {
    availability = 'preorder'; inStock = null;
  }

  // ── Images ──
  const images = [];
  $('ul.thumbnails li a.thumbnail').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (href && href.includes('/image/')) {
      const abs = href.startsWith('http') ? href : ORIGIN + href;
      if (!images.includes(abs)) images.push(abs);
    }
  });
  // Fallback: card image from listing
  if (images.length === 0 && listingEntry.cardImage) {
    const abs = listingEntry.cardImage.startsWith('http') ? listingEntry.cardImage : ORIGIN + listingEntry.cardImage;
    images.push(abs);
  }
  // Canonicalize: prefer 1024 cache URLs over smaller ones
  const image = images[0] || null;

  // Blueprint detection: check filename/alt for drawing keywords
  let blueprintImage = null;
  // \u0563\u056e\u0561\u0563\u056b\u0580 = "gtsagir" (Armenian for "drawing/blueprint")
  const bpKw = /\bcad\b|\bdraw\b|\bscheme\b|\bchert\b|\u0563\u056e\u0561\u0563\u056b\u0580/i;
  for (const img of images) {
    const alt = $(`a.thumbnail[href="${img}"]`).attr('title') || '';
    if (bpKw.test(img) || bpKw.test(alt)) { blueprintImage = img; break; }
  }

  // ── Specs / Attributes ──
  const specs = {};
  const specsList = [];
  const $descTab = $('#tab-description');
  const $specTable = $descTab.find('table.table.table-bordered, table.table').first();
  if ($specTable.length) {
    $specTable.find('tr').each((_, tr) => {
      const tds = $(tr).find('td');
      if (tds.length >= 2) {
        const label = cleanText(tds.eq(0).text());
        const value = cleanText(tds.eq(1).text());
        if (label && value) {
          specs[label] = value;
          specsList.push({ label, value });
        }
      }
    });
  }

  // ── Description ──
  // Everything in #tab-description that is NOT the specs table
  const $descClone = $descTab.clone();
  $descClone.find('table.table').remove();
  $descClone.find('script,style,link,meta,[onclick],[onerror]').remove();
  const descriptionHtml = $descClone.html() || '';
  const descriptionText = cleanText($descClone.text());

  // Short desc: use descriptionText first 200 chars or specs summary
  let shortDesc = listingEntry.rawTitle ? '' : '';
  if (!shortDesc && descriptionText) {
    shortDesc = descriptionText.slice(0, 300);
  }
  // From listing card <p> text (truncated description)
  if (!shortDesc) {
    const cardP = $(html.match(/<div class="caption">([\s\S]*?)<\/div>\s*<div class="button-group">/) ? 0 : 0);
  }

  // If specs exist, build shortDesc from them (matching existing dataset format:
  // "\u0538\u0576\u0564\u056d\u0561\u0576\u0578\u0582\u0580 \u057f\u057e\u0575\u0561\u056c\u0576\u0565\u0580  " + key-value pairs)
  if (!shortDesc && specsList.length) {
    shortDesc = '\u0538\u0576\u0564\u056d\u0561\u0576\u0578\u0582\u0580 \u057f\u057e\u0575\u0561\u056c\u0576\u0565\u0580  ' + specsList.map(s => `${s.label}  ${s.value}`).join(' ');
  }

  // Content hash
  const hashInput = JSON.stringify({ sourceId, rawTitle, price, oldPrice, availability, image, specs });
  const contentHash = createHash('sha1').update(hashInput).digest('hex');

  return {
    sourceId,
    sourceUrl,
    slug,
    rawTitle,
    title,
    code,
    codeSource,
    brand,
    brandSource,
    model,
    price,
    oldPrice,
    priceOnRequest,
    currency: 'AMD',
    availability,
    inStock,
    stockQuantity: null,
    images,
    image,
    blueprintImage,
    specs,
    specsList,
    descriptionHtml,
    descriptionText,
    shortDesc,
    contentHash,
    crawledAt: new Date().toISOString(),
  };
}

// (parseProductPage is synchronous — no async helpers needed)
