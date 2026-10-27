# TabMarket Backend API — Reference Guide

**Version:** v1 · **Base path:** `/api/v1` · **Source of truth:** [`app/api/v1/*`](../app/api/v1) route handlers, [`server/api.ts`](../server/api.ts) mock middleware, [`types/api.ts`](../types/api.ts), [`types/index.ts`](../types/index.ts).

This document is the endpoint reference for the storefront API. The customer-account
endpoints (`/auth/*`, `/me/*`, `/contact-messages`) are specified in detail in the separate
[account API contract](./account-api-contract.md) because they are the part Laravel (Sanctum)
replaces first; they are summarized in §8 here for completeness.

---

## 1. Overview

| Aspect | Convention |
| --- | --- |
| Transport | HTTPS, same origin as the storefront (no CORS in the happy path) |
| Request body | `application/json` on every `POST`/`PATCH` |
| Response body | JSON envelope, always (`Content-Type: application/json`) |
| Success flag | `success: boolean` is part of the envelope on every response — clients branch on it, not only on the HTTP status |
| Error shape (catalogue routes) | `{ success: false, message }` with a 4xx/5xx status |
| Error shape (account routes) | `{ success: false, data: null, error: { code, message, fields? } }` |
| Money | integer AMD (֏), no decimals, never a formatted string |
| Dates | ISO-8601 UTC strings |
| Order numbers | `TAB-xxxxx` (`TAB-` + digits; tracking validates `^TAB-\d{5}$`) |
| User-facing messages | `message` values are Armenian (U+0530–U+058F), UTF-8 encoded, and rendered verbatim by the UI — the backend localizes, the frontend does not |
| Caching | all handlers respond with `cache: 'no-store'` semantics; GET handlers simulate 100–300 ms network latency to mirror the live Laravel API |
| Auth | none of the catalogue endpoints require a session; account endpoints use the `tab_market_session` HttpOnly cookie |

### Envelope types (TypeScript)

```ts
// types/api.ts
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
}
```

> **Static-hosting note.** When the SPA is deployed without a backend (e.g. Vercel
> serving only `index.html`), every `/api/v1/*` request that 404s or returns HTML
> latches `apiAbsent` in [`services/api.ts`](../services/api.ts), and the client-side
> mock adapter answers from the bundled assortment with the exact same envelopes.
> Genuine error statuses (401/409/422/429) are never masked.

---

## 2. Endpoint index

### Catalogue & checkout routes (`app/api/v1/*` — Next.js Route Handlers)

| # | Method | Path | Purpose | Success status |
| --- | --- | --- | --- | --- |
| 2.1 | `GET` | `/api/v1/products` | Filterable, paginated product list | 200 |
| 2.2 | `GET` | `/api/v1/products/{slug}` | One product by slug **or** SKU code | 200 |
| 2.3 | `GET` | `/api/v1/categories` | Full category list | 200 |
| 2.4 | `GET` | `/api/v1/search` | Lightweight live-search (≤ 6 matches) | 200 |
| 2.5 | `POST` | `/api/v1/coupons/validate` | Promo-code validation | 200 |
| 2.6 | `POST` | `/api/v1/orders` | Place an order (guest checkout) | 200 |
| 2.7 | `GET` | `/api/v1/orders/track` | Order tracking by number (+ phone) | 200 |

### Account routes (`server/api.ts` — mock middleware, Sanctum-shaped)

| Method | Path | Auth | See |
| --- | --- | --- | --- |
| `POST` | `/auth/register`, `/auth/login`, `/auth/logout` | — / — / any | §8 and [contract](./account-api-contract.md) |
| `GET`/`PATCH` | `/me` | required | §8 |
| `GET`/`POST`/`PATCH`/`DELETE` | `/me/addresses[/{id}]` | required | §8 |
| `GET`/`POST` | `/me/orders`, `GET /me/orders/{id}` | required | §8 |
| `POST` | `/contact-messages` | — (honeypot + throttle) | §8 |
| `POST` | `/auth/otp/*`, `/auth/password/reset` | — | contract-only, `501` |

---

## 2.1 `GET /api/v1/products`

Paginated product catalogue with filtering and sorting. Handler:
[`app/api/v1/products/route.ts`](../app/api/v1/products/route.ts).

### Query parameters

| Param | Type | Default | Notes |
| --- | --- | --- | --- |
| `category` | string | — | Matches `categorySlug`. The literal value `all` is ignored. |
| `brand` | string | — | Case-insensitive exact match on brand name; `all` ignored. |
| `finish` | string | — | Exact match on `finish` (`chrome` \| `gold` \| `black` \| `gunmetal` \| `white` \| `mirror`); `all` ignored. |
| `search` | string | — | Case-insensitive substring over `title`, `code` (SKU), `brand`, `shortDesc`. |
| `inStockOnly` | boolean | `false` | Only `inStock === true` lines. Stock is an availability flag, **never a unit count** — the price list carries no quantities. |
| `minPrice` | number | `0` | Inclusive lower bound (AMD). |
| `maxPrice` | number | `Infinity` | Inclusive upper bound (AMD). |
| `sortBy` | enum | `popular` | `popular` \| `price-asc` \| `price-desc` \| `newest`. See sorting notes below. |
| `page` | number | `1` | 1-based. |
| `limit` | number | `12` | Items per page. |

### Sorting semantics

| `sortBy` | Order |
| --- | --- |
| `price-asc` / `price-desc` | by `price` ascending / descending |
| `newest` | by `id` descending |
| `popular` (default) | the price list's own SKU order (`code` natural-sort ascending). The imported sheet has no rating/popularity data, so nothing else could be honestly ranked. |

### Response — `200`, `PaginatedResponse<Product>`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "31297",
      "title": "GANZER GZ44012 Խառնիչ լվացարանի",
      "slug": "ganzer-gz44012-mixer",
      "categorySlug": "mixers",
      "categoryName": "Խառնիչներ",
      "brand": "GANZER",
      "price": 42200,
      "oldPrice": 49000,
      "inStock": true,
      "images": ["https://…"],
      "blueprintImage": "https://…",
      "shortDesc": "…",
      "specs": { "Նյութ": "պլաստիկ", "Միացում": "1/2\"", "Երաշխիք": "5 տարի" },
      "finish": "chrome",
      "isFeatured": true,
      "isNew": false,
      "clearance": false
    }
  ],
  "pagination": { "currentPage": 1, "lastPage": 34, "perPage": 12, "total": 408 }
}
```

Optional `Product` fields (`oldPrice`, `stockQuantity`, `rating`, `reviewsCount`,
`blueprintImage`, `isFeatured`, `rating`, `finish`, `isNew`, `clearance`) are omitted
when the source data carries no value — never sentinel-zeroed. Full schema in §7.1.

### Examples

```bash
# Chromed Valtec mixers under 20 000 AMD, cheapest first, page 2
curl "https://tab.am/api/v1/products?category=mixers&brand=VALTEC&finish=chrome&maxPrice=20000&sortBy=price-asc&page=2&limit=12"
```

```ts
// The typed client wrapper (services/api.ts)
import { fetchProducts } from '@/services/api';
const res = await fetchProducts({ category: 'mixers', sortBy: 'price-asc', page: 1 });
```

---

## 2.2 `GET /api/v1/products/{slug}`

Single product lookup. The path segment accepts **either** the SEO slug **or** the
numeric SKU code. Handler:
[`app/api/v1/products/[slug]/route.ts`](../app/api/v1/products/%5Bslug%5D/route.ts).

### Path parameters

| Param | Notes |
| --- | --- |
| `slug` | Matched against `Product.slug` first, then `Product.code`. |

### Responses

| Status | Body |
| --- | --- |
| `200` | `ApiResponse<Product>` — `{ success: true, data: { …full product… } }` |
| `404` | `{ "success": false, "message": "Ապրանքը չի գտնվել" }` |

### Examples

```bash
curl "https://tab.am/api/v1/products/ganzer-gz44012-mixer"   # by slug
curl "https://tab.am/api/v1/products/11496"                  # by SKU code
```

```ts
const product = await fetchProductBySlug('11496'); // Product | null
```

---

## 2.3 `GET /api/v1/categories`

Returns the complete category tree (no pagination, no parameters). Item counts are
recomputed from the live assortment, so they always reflect the real catalogue.
Handler: [`app/api/v1/categories/route.ts`](../app/api/v1/categories/route.ts).

### Response — `200`, `ApiResponse<Category[]>`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Խառնիչներ",
      "slug": "mixers",
      "image": "https://…",
      "itemCount": 96,
      "icon": "faucet"
    }
  ]
}
```

`Category` schema in §7.2. Errors: none beyond a 500 from the runtime; this route has
no 4xx path.

---

## 2.4 `GET /api/v1/search`

Live-search endpoint backing the header search box. Deliberately capped and never
errors on an empty query. Handler: [`app/api/v1/search/route.ts`](../app/api/v1/search/route.ts).

### Query parameters

| Param | Type | Notes |
| --- | --- | --- |
| `q` | string | Case-insensitive substring over `title`, `code`, `brand`, `categoryName`. Trimmed server-side. |

### Behaviour

- `q` empty/absent → `200` with `data: []` (a blank search is a normal state, not an error).
- At most **6** products are returned, in catalogue order — this endpoint powers a
  dropdown, not a results page. Use `GET /products?search=` for full result sets.

### Response — `200`, `ApiResponse<Product[]>`

```json
{ "success": true, "data": [ /* ≤ 6 Product objects */ ] }
```

```bash
curl "https://tab.am/api/v1/search?q=ganzer"
```

---

## 2.5 `POST /api/v1/coupons/validate`

Promo-code check used by the cart/checkout promo input. Handler:
[`app/api/v1/coupons/validate/route.ts`](../app/api/v1/coupons/validate/route.ts).

### Request body

```json
{ "code": "tab10" }
```

`code` is uppercased and trimmed server-side, so casing/spaces never matter.

### Coupon registry

| Code | Effect | `discountPercent` | Notes |
| --- | --- | --- | --- |
| `TAB10` | 10 % off subtotal | `10` | |
| `VARPET` | 15 % off subtotal (master/plumber discount) | `15` | |
| `FREE` | free shipping across Armenia | `0` | zeroes `shippingCost` at order creation |

### Responses

| Status | Condition | Body |
| --- | --- | --- |
| `200` | known code | `{ success: true, data: { valid: true, discountPercent, message } }` — `message` is the Armenian confirmation shown to the customer (e.g. `"Կիրառվեց 10% զեղչ"`; for `FREE`: `"Անվճար առաքում ամբողջ Հայաստանում (FREE)"`) |
| `400` | unknown code | `{ success: false, message: "Անվավեր պրոմոկոդ" }` |
| `500` | malformed/unparseable body | `{ success: false, message: "Սխալ պրոմոկոդի ստուգման ընթացքում" }` |

```bash
curl -X POST "https://tab.am/api/v1/coupons/validate" \
  -H "Content-Type: application/json" \
  -d '{"code":"VARPET"}'
```

> The client keeps a mirror registry (`CLIENT_COUPONS` in `services/api.ts`) so promo
> entry keeps working on static hosting; the codes and percentages must stay identical
> across handler, client mirror, and `useCart.applyCoupon`.

---

## 2.6 `POST /api/v1/orders`

Creates an order (guest checkout path). Handler:
[`app/api/v1/orders/route.ts`](../app/api/v1/orders/route.ts).

### Request body — `CreateOrderPayload`

```json
{
  "customer": { "fullName": "Արմեն Գասպարյան", "phone": "+37495530435", "email": "a@example.am" },
  "delivery": {
    "method": "yerevan_delivery",
    "address": { "marz": "Երևան", "city": "Երևան", "street": "Կոմիտասի 38", "apartment": "14", "entrance": "2", "floor": "4" },
    "notes": "Զանգահարեք նախապես"
  },
  "payment": { "method": "idram" },
  "b2b": { "isB2B": true, "companyName": "ANI Group LLC", "tin": "12345678" },
  "couponCode": "TAB10",
  "items": [
    { "productId": 1, "productCode": "11496", "quantity": 1, "unitPrice": 42200 }
  ]
}
```

| Field | Required | Notes |
| --- | --- | --- |
| `customer.fullName`, `customer.phone` | **yes** | missing either → `400`. `email` optional. |
| `delivery.method` | yes | `showroom_pickup` \| `yerevan_delivery` \| `regional_delivery`. `address` required in practice for the two delivery methods. |
| `payment.method` | yes | `idram` \| `telcell` \| `card` \| `cash`. |
| `b2b` | no | `isB2B` flag with optional `companyName` and 8-digit TIN (ՀՎՀՀ). |
| `couponCode` | no | Validated against the registry in §2.5. |
| `items[]` | **yes, non-empty** | empty/absent → `400`. Each line: `productId` (number), `productCode` (SKU string), `quantity`, `unitPrice`. |

### Pricing rules (server-computed — client values are never trusted for totals)

```
subtotal     = Σ unitPrice × quantity
shippingCost = 0                   when method = showroom_pickup
             = 0 if subtotal ≥ 30000, else 1500   when method = yerevan_delivery
             = 3000                               when method = regional_delivery
discount     = 10 % of subtotal (TAB10) or 15 % (VARPET), else 0
             FREE coupon → shippingCost forced to 0
total        = max(0, subtotal − discount + shippingCost)
```

### Responses

| Status | Condition | Body |
| --- | --- | --- |
| `200` | order created | `ApiResponse<OrderConfirmation>` (below), with message `"Պատվերը հաջողությամբ գրանցվել է Երևանի Մելքումովի 40/1 պահեստում"` |
| `400` | missing name/phone | `{ success: false, message: "Խնդրում ենք լրացնել անունը և հեռախոսահամարը" }` |
| `400` | empty cart | `{ success: false, message: "Զամբյուղը դատարկ է" }` |
| `500` | unparseable body | `{ success: false, message: "Սխալ պատվերի մշակման ընթացքում" }` |

```json
{
  "success": true,
  "data": {
    "orderId": "TAB-84920",
    "status": "reserved",
    "subtotal": 50700,
    "discount": 5070,
    "shippingCost": 0,
    "total": 45630,
    "createdAt": "2026-10-27T10:12:03.411Z"
  },
  "message": "Պատվերը հաջողությամբ գրանցվել է Երևանի Մելքումովի 40/1 պահեստում"
}
```

`OrderConfirmation` schema in §7.4. Order numbers are minted as `TAB-` + a random
5-digit number; number ownership lives in the API layer
(`generateOrderId()` in `services/api.ts` mirrors it for the client-side path).

> **Known gap.** In the current Vite SPA build the checkout flow does not call this
> route (it simulates the confirmation client-side and files the order in a local
> ledger); the Next handler above is the contract the real backend keeps. See
> [contract §10](./account-api-contract.md).

---

## 2.7 `GET /api/v1/orders/track`

Public order tracking. Handler:
[`app/api/v1/orders/track/route.ts`](../app/api/v1/orders/track/route.ts).

### Query parameters

| Param | Required | Notes |
| --- | --- | --- |
| `orderId` | yes | Trimmed and uppercased server-side; must start with `TAB-`. |
| `phone` | no | Echoed back into the response (customer-service convenience); does not affect lookup. |

### Lookup order

1. **Seeded fixture `TAB-84920`** — a showroom-pickup order at status `ready_for_pickup`
   (4-step timeline, 2 items).
2. **Seeded fixture `TAB-11496`** — a Yerevan-delivery order at status `in_transit`.
3. **Dynamic fallback** for any id matching `^TAB-\d{5}$` — returns a generic
   `processing` order with a 4-step timeline, `paymentStatus: "pending"`,
   showroom-pickup address, and a single placeholder line (35 000 AMD).
4. Anything else → `404`.

### Responses

| Status | Condition | Body |
| --- | --- | --- |
| `200` | any lookup hit above | `ApiResponse<TrackedOrderDetails>` (schema §7.5) |
| `404` | missing/blank `orderId`, or not starting with `TAB-` | `{ success: false, message: "Պատվերը նշված համարով չի գտնվել: (Օրինակ՝ TAB-84920)" }` |
| `404` | `TAB-` prefix but not 5 digits (e.g. `TAB-12`) | `{ success: false, message: "Պատվերը նշված համարով չի գտնվել: Ստուգեք համարը կամ զանգահարեք 095 53-04-35:" }` |

### Timeline semantics

`timeline` is an ordered array of `OrderTrackingStep`; exactly one step normally has
`isCurrent: true`, and every step up to and including it has `isCompleted: true`.
A pending future step omits `timestamp`. `currentStatus` is one of the
`ORDER_STATUS` values (§7.6).

```bash
curl "https://tab.am/api/v1/orders/track?orderId=TAB-84920&phone=%2B37495530435"
```

---

## 3. Status-code summary (catalogue routes)

| Status | When |
| --- | --- |
| `200` | success (including empty search results and dynamic tracking fallbacks) |
| `400` | validation failure: unknown coupon, missing customer name/phone, empty cart |
| `404` | product not found; order not found / malformed order id |
| `500` | request body could not be parsed as JSON |

Account routes additionally use `401 unauthenticated` / `401 invalid_credentials`,
`403 same_origin_required`, `405`, `409 account_exists|address_limit_reached`,
`415`, `422 validation_failed` (with `error.fields`), `429 rate_limited`
(with `Retry-After`), `501` contract-only — see [contract §4](./account-api-contract.md).

---

## 4. Data schemas

### 4.1 `Product` ([`types/index.ts`](../types/index.ts))

| Field | Type | Notes |
| --- | --- | --- |
| `id` | number | Catalogue id. |
| `code` | string | SKU code, e.g. `"31297"`. |
| `title` | string | Full Armenian product title. |
| `slug` | string | SEO URL slug. |
| `categorySlug` / `categoryName` | string | Category reference. |
| `brand` | string | GANZER, LEDEME, VIEIR, BRAVAT, VALTEC, BAXI, CERSANIT, GEBERIT… |
| `price` | number | AMD integer. |
| `oldPrice` | number? | Pre-discount price. |
| `inStock` | boolean | Availability flag only. |
| `stockQuantity` | number? | **Only present when the price list really carries a number** — the imported sheet has none, so no count may be rendered. |
| `images` | string[] | |
| `blueprintImage` | string? | Technical dimensional drawing. |
| `shortDesc` | string | |
| `specs` | Record<string, string> | Armenian-keyed spec sheet (Նյութ, Միացում, Քարթրիջ, Երաշխիք…). |
| `isFeatured` | boolean? | |
| `rating` / `reviewsCount` | number? | Not carried by the imported sheet. |
| `finish` | `'chrome' \| 'gold' \| 'black' \| 'gunmetal' \| 'white' \| 'mirror'?` | |
| `isNew` / `clearance` | boolean? | `clearance` = sheet section Լիկվիդացիա. |

### 4.2 `Category`

`{ id: number; title: string; slug: string; image: string; itemCount: number; icon: string }`

### 4.3 `ProductFilterParams` (typed client params for §2.1)

Same keys as the query table in §2.1 plus `diameter` and `material` (declared in the
type; the current handler does not filter on them).

### 4.4 `OrderConfirmation`

| Field | Type | Notes |
| --- | --- | --- |
| `orderId` | string | `TAB-xxxxx`. |
| `status` | `'pending' \| 'confirmed' \| 'reserved'` | Creation-time status; the lifecycle statuses are §4.6. |
| `subtotal` / `discount` / `shippingCost` / `total` | number | AMD integers. |
| `createdAt` | string | ISO-8601. |

### 4.5 `TrackedOrderDetails`

| Field | Type | Notes |
| --- | --- | --- |
| `orderId`, `createdAt`, `customerName`, `phone` | string | |
| `deliveryMethod` | `DeliveryMethod` | §4.7. |
| `deliveryAddress` | string? | |
| `paymentMethod` | string | Free-text label (e.g. `"Idram / Rocket"`). |
| `paymentStatus` | `'paid' \| 'pending'` | |
| `currentStatus` | `OrderStatus` | §4.6. |
| `timeline` | `OrderTrackingStep[]` | `{ id, title, description, timestamp?, isCompleted, isCurrent }`. |
| `items[]` | `{ id, code, title, image, quantity, price }` | |
| `totalAmount` | number | AMD. |

### 4.6 Order lifecycle statuses (`ORDER_STATUS`)

The single source of truth both the mock server and the future Laravel API emit:

```
received → processing → ready_for_pickup → in_transit → delivered
```

### 4.7 `DeliveryMethod` and payment tokens

```ts
type DeliveryMethod = 'showroom_pickup' | 'yerevan_delivery' | 'regional_delivery';
type PaymentMethod  = 'idram' | 'telcell' | 'card' | 'cash';
```

---

## 5. Client SDK mapping

The frontend never calls `fetch` from a component; every endpoint has a typed wrapper
in [`services/api.ts`](../services/api.ts) that also carries the static-hosting fallback:

| Function | Endpoint |
| --- | --- |
| `fetchProducts(params)` | `GET /products` |
| `fetchProductBySlug(slug)` | `GET /products/{slug}` |
| `fetchCategories()` | `GET /categories` |
| `searchProducts(query)` | `GET /search?q=` |
| `validateCoupon(code)` | `POST /coupons/validate` |
| `submitOrder(payload)` | `POST /orders` |
| `trackOrder(orderId, phone)` | `GET /orders/track` |
| `getMe` / `login` / `register` / `logout` / `updateProfile` | `GET|PATCH /me`, `POST /auth/*` |
| `listAddresses` / `createAddress` / `updateAddress` / `deleteAddress` | `/me/addresses[/{id}]` |
| `listOrders` / `attachOrder` | `GET|POST /me/orders` |
| `createContactMessage(payload)` | `POST /contact-messages` |
| `requestPasswordReset(phone)` | `POST /auth/password/reset` (contract-only) |
| `getDevDemoCredentials()` | `GET /auth/dev-demo` (dev only) |

---

## 6. Latency & testing notes

- Every handler simulates the live API latency: 100 ms (categories/search),
  150 ms (products, track, coupons), 300 ms (order creation). Keep the production
  backend within the same budget so UI skeletons stay calibrated.
- Test order fixtures for tracking: `TAB-84920` (ready for pickup) and `TAB-11496`
  (in transit); any other well-formed `TAB-#####` returns the generic in-progress view.
- Test coupon codes: `TAB10`, `VARPET`, `FREE` (§2.5).

---

## 7. Account & misc endpoints (summary)

Provided by [`server/api.ts`](../server/api.ts); the full contract — cookie attributes,
Sanctum mapping, validation limits, per-endpoint live samples, and the Laravel swap
notes — is in [`docs/account-api-contract.md`](./account-api-contract.md).

- **Envelope**: `{ success, data, meta?, error?: { code, message, fields? } }`; errors
  always carry a stable machine `code` the client switches on (never localized).
- **Auth**: HttpOnly `tab_market_session` cookie (30-day sliding), no bearer tokens;
  mutations must be same-origin (`403 same_origin_required`) and JSON-bodied (`415`).
- **Validation** shared between browser forms and the server via
  [`lib/auth/schema.ts`](../lib/auth/schema.ts) — impossible to drift.
- **Rate limiting**: login/register throttled per IP + normalized phone
  (5 attempts → 10-minute lockout, `429` with `Retry-After`); the contact form has its
  own per-IP throttle plus a `website` honeypot (a filled honeypot gets a silent `201`
  and stores nothing).
- **`POST /me/orders`** (attach) is mock-only: Laravel links the order to the
  authenticated user at creation time, so the route disappears in the swap while the
  checkout behaviour stays.
- **Contract-only `501` endpoints**: `POST /auth/otp/request`, `POST /auth/otp/verify`,
  `POST /auth/password/reset` — reserved so enabling SMS OTP later is a backend change,
  not a UI refactor.

---

*Keep this file in sync when a handler or a type in `types/api.ts` changes. Armenian
messages above are quoted verbatim from the source; if you retype them, follow the
homoglyph-safety policy (unicode escapes U+0530–U+058F, then audit).*
