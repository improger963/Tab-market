# Phase 0 — Migration Audit, Baseline & Map (Vite SPA → Next.js App Router)

> Generated during Phase 0 (no code changes). Confirms the brief's stated facts,
> records the measured baseline, and maps every current file to its Next target.

## 1. Verified facts (with evidence)

| Claim | Status | Evidence |
| --- | --- | --- |
| Vite 8 SPA runtime, hand-rolled matcher in `src/App.tsx` | ✅ confirmed | `vite v8.3.4`; `src/App.tsx` popstate/`useMemo` route parser |
| React 19, Tailwind v4 via `@tailwindcss/vite`, tokens in `src/index.css` | ✅ confirmed | `package.json`; `vite.config.ts` plugins |
| `next/link`/`next/navigation` resolved via `lib/next-compat` shim | ✅ confirmed | 3 shim files (`link.tsx`, `navigation.ts`, `font.ts`); 4 importers |
| `app/` tree + `app/api/v1/**` reference routes already exist | ✅ confirmed | see §3 |
| Mock backend `server/api.ts` (`node:http`) + `server/security.ts` + `server/store.ts` | ✅ confirmed | 696 / 490-line files; JSON store `server/data/db.json` |
| Data: `data/products.json` (~1,647 rows) + `data/categories.ts` inlined into client | ✅ confirmed | build output below |
| Baseline bundle 2.87 MB JS / ~349 kB gzip | ✅ confirmed | **2,871.99 kB / 348.80 kB gzip**, CSS 80.34 kB / 14.49 kB gzip |
| Prices/coupons computed in browser (`TAB10`, `VARPET`, `FREE`) | ✅ confirmed | `store/useCart.ts` L148-165; `app/api/v1/orders/route.ts`, `coupons/validate/route.ts` |
| `metadata.json` contains «ՀԾ (ArmSoft)» | ✅ confirmed | `metadata.json` L3 |
| `index.html`/layout meta mentions «կաթսաներ» | ✅ confirmed | `app/layout.tsx` L26, L30; `ShowroomTrustSection.tsx` L30 |
| Contractor leftovers (`PlumberFaqSection`, `VARPET`) | ✅ confirmed | `components/home/PlumberFaqSection.tsx`, `app/page.tsx` L12,33 |
| Wire value `reserved_in_armsoft` | ✅ confirmed | `types/api.ts` L204; `app/api/v1/orders/route.ts` L62 |
| Unused deps (`@google/genai`) | ✅ confirmed | `package.json` L15 — zero source imports |
| Vercel serverless (no writable FS / no in-memory state) | ✅ accepted | target platform constraint |

## 2. Corrections to the brief (material to later phases)

- **Image coverage — the launch-risk item — is GREEN.** All **1,647 / 1,647** products
  have a usable image. There are **0** Unsplash/stock URLs: all **2,691** image URLs are
  first-party `https://tab.am/image/cache/catalog/...`. The `UNTRUSTED_STOCK_HOSTS` block
  in `lib/config.ts:resolveImageUrl` never matches and is **vestigial**.
  → Phase 7/8 `next/image` `remotePatterns` must allow host `tab.am` (owner plan for
  self-hosting/asset migration still applies). Phase 9 `unsplash` grep target is already clean.
- Per-category usable-image coverage (withImage/total): `khohanotsi-lvatsaran 243/243`,
  `hosakner 245/245`, `tsntsugh-yev-khoghovak 282/282`, `higiyenayi-paraganer 182/182`,
  `lvatsaran-paharanov 149/149`, `aksesuarner 122/122`, `sifon 145/145`, `hayeliner 81/81`,
  `choranotsner 69/69`, `pakan 73/73`, `logasenyaki-varaguyri-dzogher 32/32`,
  `odapvokhichner 24/24`.

## 3. Import / client-boundary inventory (Phase 0 item 1)

- **`lib/next-compat` importers (4):** `src/App.tsx` (`consumePushNavigation`),
  `components/account/AccountShell.tsx`, `components/auth/AuthModal.tsx`,
  `components/layout/LiveSearch.tsx` (all `pushRoute`/`usePathname`/`useSearchParams`).
  All other files already `import from 'next/link'` / `'next/navigation'` and are served by
  the `vite.config.ts` alias.
- **`@/data/*` importers (client + server, 23 refs):** `data/products` pulled into
  `src/App.tsx`, `CatalogView`, `CartDrawer`, `LiveSearch`, `BrandPageClient`,
  `TabbedProductShowcase`, `app/product/[slug]`, `app/api/v1/{products,search,products/[slug]}`;
  `data/categories` into `Footer`, `Header`, `CategoryNavStrip`, `CategoryGrid`,
  `CategoryStories`, `FilterSidebar`, `app/category/[slug]`, `app/api/v1/categories`;
  `data/brands` into `FilterSidebar`, `BrandsCarousel`, `BrandPageClient`, `app/brand/[slug]`.
  **This is the 2.9 MB bundle.** All must move behind `server/catalog.ts` (Phase 3) with an
  ESLint `no-restricted-imports` guard.
- **`server/*` browser importers:** **0** (correct — store/API stay server-side).
- **`window`/`document` render-time risk:** `src/App.tsx` (pathname init),
  `app/contact/page.tsx` (`window.location.origin` in JSON-LD), `lib/seo.ts`
  (imperative `document.head` meta injection — replaced by `generateMetadata` in Phase 7),
  `components/layout/Header.tsx` (`document`/`window` listeners — effects only, safe).
- **`localStorage`:** only Zustand `persist` stores (`useCart`, `useWishlist`, `useCompare`,
  `useRecentlyViewed`) + `services/api.ts` client-session/address cache. Phase 5/10 keep only
  `{productId,quantity}` / id lists client-side; session moves to `HttpOnly` cookie read server-side.

## 4. Migration map — current file → Next target

Legend: **SC** = Server Component, **CC** = Client Component (`'use client'`),
**RH** = Route Handler (`app/api`), **DEL** = delete, **MOD** = modify.

### Framework / build
- `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx` → **DEL** (Phase 1)
- `src/index.css` → **MOD** move to `app/globals.css` (content preserved) (Phase 1)
- `lib/next-compat/**` → **DEL** (real `next/*` resolves) (Phase 1)
- `tsconfig.json`, `package.json` scripts → **MOD** (Next + Tailwind PostCSS, strict, scripts) (Phase 1)
- new: `next.config.ts`, `postcss.config.mjs`, `middleware.ts`, `.env.example`, `vercel.json`,
  `docs/DEPLOY.md` (Phases 1/5/12)

### Routing (`app/`)
- `app/layout.tsx` → **MOD**: fonts via `next/font` (Inter + Noto Sans Armenian), global shell islands,
  metadata template, drop «կաթսաներ»/«ՀԾ» copy (Phases 1/7/9)
- `app/page.tsx` → **SC**; remove `PlumberFaqSection` (Phase 9)
- `app/catalog`, `app/category/[slug]`, `app/catalog/[slug]`, `app/product/[slug]`,
  `app/brand/[slug]`, `app/checkout`, `app/account/{orders,profile,addresses}`,
  `app/showroom`, `app/contact`, `app/track-order`, `app/wishlist`, `app/compare` → **SC/CC split** +
  `loading`/`error`/`not-found`/`global-error` (Phases 2/3)
- `app/sitemap.ts` → **MOD**; new `app/robots.ts`, `app/manifest.ts`, `app/opengraph-image` (Phase 7)

### Components → client islands (Phase 1/10)
- Interactive (CC): `cart/CartDrawer`, `auth/AuthModal`, `account/*`, `catalog/CatalogView`,
  `catalog/FilterSidebar`, `catalog/CategoryNavStrip`, `layout/Header`, `layout/LiveSearch`,
  `layout/MobileNav`, `layout/TopBar`, `product/*`, `home/TabbedProductShowcase`,
  `home/BrandsCarousel`, `checkout/*`, `track/*`, `ui/ToastContainer`
- Static (SC): `layout/Footer`, `home/HeroBanner`, `home/CategoryGrid`, `home/CategoryStories`,
  `home/ShowroomTrustSection` (MOD for truth pass)
- `components/components/catalog/` (stray dir) → **DEL** (dead)

### Data / server (Phase 3/4/5)
- `data/products.ts`, `data/categories.ts`, `data/brands.ts`, `data/products.json` → **SC** only,
  behind new `server/catalog.ts` (`import 'server-only'`) + DTOs
- `server/api.ts` (node:http) + `server/dev.ts` → **DEL** (replaced by `app/api/v1/**` RH)
- `server/store.ts`, `server/security.ts`, `lib/auth/session.ts` → **MOD** into repository pattern
  `server/repos/*` (JSON dev adapter + Postgres prod adapter)
- `app/api/v1/*` RH → **MOD/expand** (single HTTP surface; server-authoritative pricing;
  add `brands`, `filters`, `cart/validate`, `contact-messages`, auth/`me/*`, `health`, `revalidate`)

### Cleanup / truth pass (Phase 9) — grep must be zero in customer-visible strings
`ERP`, `ՀԾ`, `ArmSoft`, `Sync`, `բրոնյա`, `SPECIFICATIONS`, `TAB10`, `VARPET`, `FREE`(coupon),
`reserved_in_armsoft`, `unsplash`, `կաթսաներ`
- `metadata.json` → **DEL**
- `types/api.ts` `reserved_in_armsoft` → **MOD** rename to `reserved` (+ mapping)
- coupon strings out of `store/useCart.ts` and into `server/coupons.ts`

### Deps (Phase 1/9)
- **REMOVE:** `@google/genai`, `vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`;
  `express`/`dotenv`/`tsx` if unused after migration
- **ADD:** `next@^16` (present) + `eslint-config-next`, `@tailwindcss/postcss`, `server-only`,
  `@neondatabase/serverless`, `zod` (if absent); dev: `@playwright/test`, `@next/bundle-analyzer`

## 5. Owner-decision items surfaced in Phase 0 (do not invent — carry forward)
1. **Image host**: images resolve to `https://tab.am/...` (legacy host). Confirm `next/image`
   host + self-hosting/asset-migration plan before DNS switch.
2. **Notification channel** (Phase 6): Telegram vs Email credentials (`TELEGRAM_*`/`RESEND_API_KEY`).
3. **Database** (Phase 5): provision Vercel Postgres/Neon `DATABASE_URL`; 301 map from old `tab.am` URLs.
4. **Coupons `VARPET`/`FREE`** (Phase 4): contractor/free-shipping style → default **disabled**; confirm.
5. **Legal pages** (Privacy/Terms/Returns), showroom **geo/coordinates/parking** claims, final
   **category count (12 present)**, regional `regionalCost` decision — all need owner input.

## 6. Phase 2 — routing parity notes

- **No `catalog/[slug]` overlap exists.** The brief assumed two rival category routes; in the
  repo `/catalog` (all products) and `/category/[slug]` (pre-filtered) are **one engine** — both
  render `CatalogView`, the latter with `initialCategorySlug`. Both are canonical; nothing to
  redirect. Unknown category slugs already `notFound()`. Locked by `tests/routes/route-contract.test.ts`.
- **Route manifest locked** (15 public routes incl. `/account/{orders,addresses,profile}`);
  legacy `/account?tab=X` still redirects onto the sub-route (AccountShell), `?auth=` still
  opens AuthModal — unchanged behavior, now covered by the contract test.
- **Boundaries added**: root `not-found.tsx` (404 + noindex, corpus-safe Armenian via generated
  `lib/copy/routeHy.ts`), root `error.tsx` (never renders `error.message`, mirrors `/account`),
  `global-error.tsx` (self-contained `<html>`, inline styles, no Tailwind dependency).
- **Scroll policy owned by the Next router**: removed the mount-time `scrollTo(0,0)` from
  `app/template.tsx` (it remounts on popstate and would flatten Back/Forward restore). No global
  `scroll-behavior: smooth`; catalog filters stay on debounced `history.replaceState` (no scroll,
  no RSC refetch); pagination scrolls to the results container with `scroll-mt` from
  `--topbar-h`/`--header-h` and honors `prefers-reduced-motion`.
- **Vitest introduced** (`npm test`, node env, `@` alias) with the route contract as its first asset.

