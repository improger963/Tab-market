# tab.am Crawler – Documented Selectors

Discovered via live inspection (Phase 0, 2026-10-27).

## Category Listing Page

### Subcategories (parent categories like `/Santekhnika/tsorakner`)
```html
<div class="catalog-section">
  <a href="…/khohanotsi-tsorak?limit=100">…</a>
  <div class="catalog-section__caption">… (215)</div>
</div>
```

### Product Tiles
```html
<div class="product-thumb">
  <div class="image">
    <a href="…/ledeme-rl4080b-2-8899?limit=100">
      <img src="…cache/…-300x300.jpg" alt="… (ԿՈԴ 8899)" />
    </a>
  </div>
  <div class="caption">
    <h4><a href="…">Title (ԿՈԴ 8899)</a></h4>
    <p>Short description…</p>
    <p class="price">
      <span class="price-new">28 000Դր.</span>
      <span class="price-old">42 000Դր.</span>
    </p>
  </div>
  <div class="button-group">
    <button onclick="cart.add('6346', '1');">…</button>
  </div>
</div>
```

### Pagination
```html
<ul class="pagination">
  <li class="active"><span>1</span></li>
  <li><a href="…?limit=100&page=2">2</a></li>
  <li><a href="…?limit=100&page=3">&gt;|</a></li>
</ul>
```

### Key selectors
- Tile: `div.product-thumb`
- Title link: `h4 > a` (href and text)
- Image href (full-size link): `.image > a` (href)
- Image src (thumb): `.image > a > img` (src)
- Current price: `.price-new`
- Old/discount price: `.price-old`
- OpenCart product_id: from `cart.add('NNNN',` onclick
- Canonical URL: strip `?limit=…&page=…`
- Subcategory: `.catalog-section` links

## Product Detail Page

### Title & Code
```html
<h1>… Title (ԿՈԴ 8899)</h1>
<ul class="list-unstyled">
  <li>Մոdelը: 8899</li>
</ul>
```
- `h1` text contains `(ԿՈԴ N)` = customer code (same as OpenCart "model" field)
- `Del: N` line = model number (same N as KOD)

### Price (detail page)
On DETAIL pages the product's own price is always the detail-header block:
```html
<ul class="list-unstyled">
  <li><span style="text-decoration: line-through;">42 000Դր.</span></li>
  <li><h2>28 000Դր.</h2></li>
</ul>
```
⚠ IMPORTANT: `.price-new`/`.price-old` spans ALSO exist on every detail page inside
specials/related **carousel tiles** (`.product-thumb .price .price-new`) — they show OTHER
products' prices and repeat identically across pages. A page-wide `$('.price-new').first()`
query therefore returns the WRONG price. Only use `.price-new`/`.price-old` as a legacy
fallback when they are NOT inside `.product-thumb` (on LISTING pages the per-tile query is
correct because it is scoped within each product card).
Listing-style tile markup (listing pages only):
```html
<p class="price">
  <span class="price-new">28 000Դր.</span>
  <span class="price-old">42 000Դր.</span>
</p>
```

### OpenCart Product ID
```html
<input type="hidden" name="product_id" value="6346" />
```
Also in: `onclick="cart.add('6346', '1')"` on buy/wishlist/compare buttons.

### Images
```html
<ul class="thumbnails">
  <li>
    <a class="thumbnail" href="…image/cache/catalog/…-1024x1024.jpg" title="…">
      <img src="…-400x400.jpg" … />
    </a>
  </li>
  <li class="image-additional">
    <a class="thumbnail" href="…image/cache/catalog/…-1024x1024.jpg">…</a>
  </li>
</ul>
```
- Main image = first `<li>` anchor's `href` (1024×1024 cache)
- Additional images = `.image-additional a.thumbnail` href
- URL pattern: `https://tab.am/image/cache/catalog/PATH-{W}x{H}.ext`
- Original: `https://tab.am/image/catalog/PATH.ext` (strip `/cache/` and `-{W}x{H}`)
- NOTE: original may 404; always prefer the 1024×1024 cache URL as confirmed

### Specs / Attributes (inside description tab)
```html
<div class="tab-pane active" id="tab-description">
  <h2>…</h2>
  <table class="table table-bordered">
    <tbody>
      <tr><td>Del</td><td>Del</td></tr>
      …
    </tbody>
  </table>
  <p>… description text …</p>
</div>
```
- Specs table: `#tab-description table.table.table-bordered tr`
- Label = first `td`, Value = second `td`
- NBSP and `<br>` appear inside cells — strip before storing

### Description
- Everything inside `#tab-description` after (and outside) the specs table.
- Contains inline `<h5>`, `<span>`, `<img>` etc.
- Brand story banners (e.g. "LEDEME-German Technology") are part of description.

### Availability
- The "Del" (Buy) button is present when product is purchasable.
- No explicit "out of stock" text found on the sample products (all in stock).
- Heuristic: `button#button-cart` present → in_stock; absent → out_of_stock/unknown.
- `stockQuantity`: no explicit number shown on site (showroom inventory).

### Brand
- Brand link on product page: `<a href="/brand/…">` or manufacturer section.
- In the title: uppercase Latin tokens (e.g. LEDEME, GANZER, VIEIR, AQUANT, etc.)
- No `manufacturer` line reliably found on the detail page.

### Other
- No JSON-LD structured data.
- No og:* meta tags.
- No itemprop attributes.
- Canonical URL: `/Santekhnika/{cat}/{subcat}/{slug}-{KOD}`

## Category Seed List (from live menu, 2026-10-27)
Verified 200 responses. Expected counts from live site:
| Name | Slug | Expected |
|------|------|----------|
| Del | tsorakner | 772 |
| Del | Tsntsughi-havakatsuner | 361 |
| Del | Aksesuarner | 742 |
| Del | Sankeramika | 224 |
| Del | khohanotsi-lvatsaran | 236 |
| Del | Lvatsaran-paharanov | 149 |
| Del | Sifon | 145 |
| Del | Tsntsugh_yev_khoghovak | 346 |
| Del | -1 (clearance) | 216 |
| Del | Higiyenayi-paraganer | 179 |
| Del | Hayeliner | 81 |
| Del | Pakan | 73 |
| Del | Choranotsner | 69 |
| Del | Hosakner1 | 63 |
| Del | Logasenyaki-varaguyri-dzogher | 32 |
| Del | odapvokhichner | 24 |

Total from menu: 3,642 (sum of top-level counts; sub-items may double-count).
