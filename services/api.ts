/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PaginatedResponse,
  ProductFilterParams,
  CreateOrderPayload,
  OrderConfirmation,
  ApiResponse,
  TrackedOrderDetails,
  OrderTrackingStep,
  DeliveryMethod,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  AddressInput,
  OrderStatus,
  ORDER_STATUS,
  User,
  UserAddress,
  UserOrderItem,
  UserOrderSummary,
} from '@/types/api';
import { Product, Category } from '@/types';
import { products } from '@/data/products';
import { categories } from '@/data/categories';
import {
  TRACKING_FIXTURES,
  ORDER_NOT_FOUND_MESSAGE,
  buildDynamicFixture,
} from '@/services/trackingFixtures';
import { AUTH_HY } from '@/lib/copy/authHy';
import { DELIVERY_CONFIG } from '@/lib/config';
import { displayTitle, formatDateDDMMYYYY } from '@/lib/utils';
import {
  asAddressPayload,
  asAddresses,
  asAddressesPayload,
  asOrder,
  asOrderPayload,
  asOrdersPayload,
  asUser,
  asUserPayload,
} from '@/lib/auth/guards';

const API_BASE = typeof window !== 'undefined' ? '/api/v1' : 'http://localhost:3000/api/v1';

/**
 * Static-hosting probe latch. On a pure SPA host (Vercel serving only
 * `index.html`) every `/api/v1/*` path 404s or answers with the HTML document.
 * The first such response proves there is no backend on this origin, so
 * `apiAbsent` is latched for the rest of the page session and every later call
 * is served from the client-side mock adapter below without touching the
 * network again. A genuine backend (dev API, Laravel) never latches the flag,
 * because 401/409/422/429 and valid JSON bodies are not treated as absence.
 */
let apiAbsent = false;

function markApiAbsent(status: number, contentType: string): void {
  if (status === 404 || !contentType.includes('application/json')) apiAbsent = true;
}

/** True once the response proves the body is a real API JSON envelope. */
function isJsonResponse(res: Response): boolean {
  return res.ok && (res.headers.get('content-type') ?? '').includes('application/json');
}

/**
 * Generates a new order id in the canonical `TAB-xxxxx` format.
 * Order-number ownership lives in the API layer, never in a component, so the
 * Laravel backend can adopt the exact same contract.
 */
export function generateOrderId(): string {
  return `TAB-${Math.floor(10000 + Math.random() * 90000)}`;
}

/**
 * Client-side mirror of the `/products` handler for a host without a backend:
 * filters the bundled assortment with the same query parameters, so the
 * paginated envelope keeps its shape. `search` deliberately stays simple here
 * (literal substring); the customer-facing spotlight owns translit matching.
 */
function filterProductsLocally(query: URLSearchParams): PaginatedResponse<Product> {
  const get = (key: string) => query.get(key) || undefined;
  let list = products;

  const category = get('category');
  if (category) list = list.filter((p) => p.categorySlug === category);
  const brand = get('brand');
  if (brand) list = list.filter((p) => p.brand === brand);
  const search = get('search');
  if (search) {
    const needle = search.toLowerCase();
    list = list.filter((p) =>
      `${p.title} ${p.brand} ${p.code} ${p.categoryName}`.toLowerCase().includes(needle)
    );
  }
  if (query.get('inStockOnly') === 'true') list = list.filter((p) => p.inStock);
  const minPrice = Number(get('minPrice'));
  if (Number.isFinite(minPrice)) list = list.filter((p) => p.price >= minPrice);
  const maxPrice = Number(get('maxPrice'));
  if (Number.isFinite(maxPrice)) list = list.filter((p) => p.price <= maxPrice);

  const sortBy = get('sortBy');
  if (sortBy === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
  else if (sortBy === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);

  const perPage = Math.max(1, Number(get('limit')) || 24);
  const page = Math.max(1, Number(get('page')) || 1);
  const total = list.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  return {
    success: true,
    data: list.slice((page - 1) * perPage, page * perPage),
    pagination: { currentPage: page, lastPage, perPage, total },
  };
}

export async function fetchProducts(params?: ProductFilterParams): Promise<PaginatedResponse<Product>> {
  const query = new URLSearchParams();
  if (params) {
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.brand && params.brand !== 'all') query.set('brand', params.brand);
    if (params.finish && params.finish !== 'all') query.set('finish', params.finish);
    if (params.search) query.set('search', params.search);
    if (params.inStockOnly) query.set('inStockOnly', 'true');
    if (params.minPrice !== undefined) query.set('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) query.set('maxPrice', params.maxPrice.toString());
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
  }

  // Static hosting without a backend: the bundled assortment answers the same
  // contract, so the Network tab never fills with 404s on every page view.
  if (apiAbsent) return filterProductsLocally(query);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/products?${query.toString()}`, {
      cache: 'no-store',
    });
  } catch {
    return filterProductsLocally(query);
  }
  markApiAbsent(res.status, res.headers.get('content-type') ?? '');
  if (!isJsonResponse(res)) return filterProductsLocally(query);
  const json: PaginatedResponse<Product> = await res.json();
  return json;
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  if (apiAbsent) return products.find((p) => p.slug === slug) ?? null;
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/products/${slug}`, {
      cache: 'no-store',
    });
  } catch {
    return products.find((p) => p.slug === slug) ?? null;
  }
  markApiAbsent(res.status, res.headers.get('content-type') ?? '');
  if (!isJsonResponse(res)) {
    return apiAbsent ? (products.find((p) => p.slug === slug) ?? null) : null;
  }
  const json: ApiResponse<Product> = await res.json();
  return json.data;
}

export async function fetchCategories(): Promise<Category[]> {
  // `categories.ts` already recomputes truthful per-category counts from the
  // live assortment, so the static fallback is the same data the API serves.
  if (apiAbsent) return categories;
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/categories`, {
      cache: 'no-store',
    });
  } catch {
    return categories;
  }
  markApiAbsent(res.status, res.headers.get('content-type') ?? '');
  if (!isJsonResponse(res)) return apiAbsent ? categories : [];
  const json: ApiResponse<Category[]> = await res.json();
  return json.data;
}

export async function searchProducts(query: string): Promise<Product[]> {
  if (!query || query.trim() === '') return [];
  if (apiAbsent) return filterProductsLocally(new URLSearchParams({ search: query })).data;
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`, {
      cache: 'no-store',
    });
  } catch {
    return filterProductsLocally(new URLSearchParams({ search: query })).data;
  }
  markApiAbsent(res.status, res.headers.get('content-type') ?? '');
  if (!isJsonResponse(res)) {
    return apiAbsent ? filterProductsLocally(new URLSearchParams({ search: query })).data : [];
  }
  const json: ApiResponse<Product[]> = await res.json();
  return json.data;
}

/**
 * Static-hosting mirror of the `/coupons/validate` registry. The codes and
 * percentages are identical to `useCart.applyCoupon`, which is the same table
 * the dev API serves, so a promo entered on Vercel behaves exactly as locally.
 */
const CLIENT_COUPONS: Record<string, { discountPercent: number; freeShipping: boolean }> = {
  TAB10: { discountPercent: 10, freeShipping: false },
  VARPET: { discountPercent: 15, freeShipping: false },
  FREE: { discountPercent: 0, freeShipping: true },
};

export function clientCouponDiscount(code: string | undefined | null): number {
  if (!code) return 0;
  const entry = CLIENT_COUPONS[code.trim().toUpperCase()];
  return entry ? entry.discountPercent : 0;
}

export async function submitOrder(payload: CreateOrderPayload): Promise<OrderConfirmation> {
  // Validate the lines against the real assortment first — this runs both for
  // the live API (mirroring its 422) and as the pure client-side mock.
  const lines = payload.items.map((item) => {
    const catalog = products.find(
      (p) => p.id === item.productId || p.code === item.productCode
    );
    if (!catalog) throw new Error('Ապրանքների ցանկում չկա: Ստուգեք կազմը և կրկին փորձեք:');
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 999) {
      throw new Error('Ապրանքների քանակը անվավեր է:');
    }
    // Totals are always recomputed from catalog truth, never trusted from the
    // client copy of the payload.
    return { unitPrice: catalog.price, quantity: item.quantity };
  });
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const coupon = CLIENT_COUPONS[(payload.couponCode ?? '').trim().toUpperCase()];
  const discount = coupon ? Math.round((subtotal * coupon.discountPercent) / 100) : 0;
  // Same shipping truth as the config: Yerevan delivery and pickup are free,
  // regional courier is the flat configured cost, a FREE promo zeroes it.
  const baseShipping = payload.delivery.method === 'regional_delivery' ? DELIVERY_CONFIG.regionalCost : 0;
  const shippingCost = coupon?.freeShipping ? 0 : baseShipping;
  const total = Math.max(0, subtotal - discount + shippingCost);
  const createdAt = new Date().toISOString();

  // With no backend on this origin the whole confirmation is produced here.
  if (apiAbsent) {
    const number = generateOrderId();
    persistClientOrder({
      id: number,
      number,
      createdAt,
      status: ORDER_STATUS.RECEIVED,
      currentStatus: ORDER_STATUS.RECEIVED,
      total,
      items: payload.items.map((item) => {
        const catalog = products.find(
          (p) => p.id === item.productId || p.code === item.productCode
        );
        return {
          productId: String(item.productId),
          title: catalog ? displayTitle(catalog.title) : item.productCode,
          image: catalog?.images[0] ?? null,
          quantity: item.quantity,
        };
      }),
      customerName: payload.customer.fullName,
      phone: payload.customer.phone,
      paymentMethod: clientPaymentLabel(payload.payment.method),
      ...(payload.delivery.method === 'showroom_pickup'
        ? { deliveryMethod: payload.delivery.method, deliveryAddress: DELIVERY_CONFIG.pickupAddress }
        : {}),
    });
    return { orderId: number, status: 'confirmed', subtotal, discount, shippingCost, total, createdAt };
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('Հնարավոր չեղավ ուղարկել պատվերը: Կրկին փորձեք:');
  }
  const contentType = res.headers.get('content-type') ?? '';
  markApiAbsent(res.status, contentType);
  if (apiAbsent) return submitOrder(payload); // latch just fell: serve fully client-side
  if (!isJsonResponse(res)) {
    throw new Error(res.ok ? 'Պատվերի պատասխանը խոտված է' : 'Պատվերի ձևակերպման սխալ');
  }
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message || 'Պատվերի ձևակերպման սխալ');
  }
  return json.data;
}

export async function validateCoupon(
  code: string
): Promise<{ valid: boolean; discountPercent: number; message: string }> {
  if (apiAbsent) {
    const entry = CLIENT_COUPONS[code.trim().toUpperCase()];
    if (!entry) throw new Error('Անվավեր պրոմոկոդ');
    return { valid: true, discountPercent: entry.discountPercent, message: 'Պրոմոկոդը կիրառված է' };
  }
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
  } catch {
    throw new Error('Հնարավոր չեղավ ստուգել պրոմոկոդը');
  }
  const contentType = res.headers.get('content-type') ?? '';
  markApiAbsent(res.status, contentType);
  if (apiAbsent) return validateCoupon(code); // latch just fell: answer from the client registry
  if (!isJsonResponse(res)) {
    throw new Error(res.ok ? 'Պատվերի պատասխանը խոտված է' : 'Անվավեր պրոմոկոդ');
  }
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Անվավեր պրոմոկոդ');
  }
  return json.data;
}

/**
 * Resolves a tracked order entirely client-side, throwing a clean Armenian
 * "not found" message (never a raw JSON parse error). Lookup priority: orders
 * created on this device (the local ledger carries their real lines and total),
 * then the seeded fixtures, then a generic in-progress view for any well
 * formed `TAB-XXXXX` id.
 */
function resolveTrackedOrder(orderId: string, phone: string): TrackedOrderDetails {
  const id = orderId.trim().toUpperCase();
  const local = readClientOrders().find((o) => o.number === id);
  if (local) {
    return phone.trim() ? { ...trackedOrderFromClientRecord(local), phone: phone.trim() } : trackedOrderFromClientRecord(local);
  }
  const fixture = TRACKING_FIXTURES[id];
  if (fixture) {
    return phone.trim() ? { ...fixture, phone: phone.trim() } : fixture;
  }
  if (/^TAB-\d{5}$/.test(id)) {
    return buildDynamicFixture(id, phone.trim());
  }
  throw new Error(ORDER_NOT_FOUND_MESSAGE);
}

export async function trackOrder(orderId: string, phone: string): Promise<TrackedOrderDetails> {
  // The latched probe (or a network/HTML response) means there is no backend:
  // resolve purely from client state instead of fetching again.
  if (!apiAbsent) {
    try {
      const res = await fetch(
        `${API_BASE}/orders/track?orderId=${encodeURIComponent(orderId)}&phone=${encodeURIComponent(phone)}`,
        {
          cache: 'no-store',
        }
      );
      markApiAbsent(res.status, res.headers.get('content-type') ?? '');
      // Only trust genuine JSON. A Vite SPA fallback (index.html), a non-2xx
      // status, or a malformed body falls through to the client-side fixtures,
      // so the customer never sees `Unexpected token '<' ... is not valid JSON`.
      if (isJsonResponse(res)) {
        const json = (await res.json()) as ApiResponse<TrackedOrderDetails>;
        if (json?.success && json.data) return json.data;
        throw new Error(json?.message || ORDER_NOT_FOUND_MESSAGE);
      }
    } catch (error) {
      // A real "not found" verdict from a live API must surface as written;
      // anything else (parse failure, offline) drops to the client resolution.
      if (error instanceof Error && error.message === ORDER_NOT_FOUND_MESSAGE) throw error;
    }
  }
  return resolveTrackedOrder(orderId, phone);
}

// ---------------------------------------------------------------------------
// Customer account — cookie-session endpoints (Sanctum-shaped contract)
// ---------------------------------------------------------------------------
//
// Everything below authenticates through the `httpOnly` session cookie, so no
// token ever appears in this file, in a header the page controls, or in browser
// storage. Each response is narrowed by a runtime guard from `lib/auth/guards`
// before it is returned: an undocumented field cannot reach a component, and a
// broken payload surfaces as an error state instead of a blank page.

/** Stable error codes shared with the mock API and the future Laravel backend. */
export const ACCOUNT_ERROR = {
  unauthenticated: 'unauthenticated',
  invalidCredentials: 'invalid_credentials',
  validationFailed: 'validation_failed',
  accountExists: 'account_exists',
  addressLimit: 'address_limit_reached',
  notFound: 'not_found',
  methodNotAllowed: 'method_not_allowed',
  sameOriginRequired: 'same_origin_required',
  invalidPayload: 'invalid_payload',
  rateLimited: 'rate_limited',
  otpNotImplemented: 'otp_not_implemented',
  passwordResetNotImplemented: 'password_reset_not_implemented',
  featureDisabled: 'feature_disabled',
  serverError: 'server_error',
  network: 'network',
  shape: 'response_shape',
} as const;

export type AccountErrorCode = (typeof ACCOUNT_ERROR)[keyof typeof ACCOUNT_ERROR];

/**
 * The single error type account screens catch. `message` is always Armenian copy
 * (never a raw server detail), `fields` maps input names to localized hints, and
 * `code` is what logic branches on.
 */
export class AccountApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields: Record<string, string>;
  readonly retryAfterSeconds: number | null;

  constructor(init: {
    status: number;
    code: string;
    message: string;
    fields?: Record<string, string>;
    retryAfterSeconds?: number | null;
  }) {
    super(init.message);
    this.name = 'AccountApiError';
    this.status = init.status;
    this.code = init.code;
    this.fields = init.fields ?? {};
    this.retryAfterSeconds = init.retryAfterSeconds ?? null;
  }

  /** The session ended or was never there — the customer is a guest again. */
  get isUnauthenticated(): boolean {
    return this.code === ACCOUNT_ERROR.unauthenticated;
  }
}

interface EnvelopeError {
  code?: unknown;
  message?: unknown;
  fields?: unknown;
}

function fieldHints(raw: unknown): Record<string, string> {
  if (typeof raw !== 'object' || raw === null) return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === 'string' && value.length <= 240) out[key] = value;
  }
  return out;
}

function retrySeconds(header: string | null): number | null {
  const parsed = Number.parseInt(header ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/**
 * One transport for every account call. `read` is the response guard: returning
 * `null` means "the body was JSON, but not the contract", which is an error
 * rather than an `undefined` flowing into the UI.
 */
async function accountRequest<T>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  read: (data: unknown) => T | null,
  body?: Record<string, unknown>
): Promise<T> {
  // The probe was already conclusive on this origin: skip the network and
  // throw the same 404 the absent backend would return, so every caller's
  // static-hosting fallback answers without another 404 entry in the console.
  if (apiAbsent) {
    throw new AccountApiError({
      status: 404,
      code: ACCOUNT_ERROR.serverError,
      message: AUTH_HY.ERR_UNKNOWN,
    });
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      // The session cookie is first-party and same-origin; nothing sensitive is
      // added to the request itself.
      credentials: 'same-origin',
      cache: 'no-store',
      ...(body
        ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
        : {}),
    });
  } catch {
    throw new AccountApiError({
      status: 0,
      code: ACCOUNT_ERROR.network,
      message: AUTH_HY.ERR_NETWORK,
    });
  }

  // Capture the header before the body is consumed: a non-JSON error body is
  // the SPA fallback document, which proves there is no API on this origin.
  const errorContentType = res.headers.get('content-type') ?? '';

  let payload: unknown = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  const envelope = (typeof payload === 'object' && payload !== null
    ? payload
    : null) as { success?: unknown; data?: unknown; error?: EnvelopeError } | null;

  if (!res.ok) {
    markApiAbsent(res.status, errorContentType);
    const error = envelope?.error;
    throw new AccountApiError({
      status: res.status,
      code: typeof error?.code === 'string' ? error.code : ACCOUNT_ERROR.serverError,
      // A body we could not parse still must produce a readable sentence.
      message: typeof error?.message === 'string' && error.message ? error.message : AUTH_HY.ERR_UNKNOWN,
      fields: fieldHints(error?.fields),
      retryAfterSeconds: retrySeconds(res.headers.get('retry-after')),
    });
  }

  const value = read(envelope?.data);
  if (value === null) {
    throw new AccountApiError({
      status: res.status,
      code: ACCOUNT_ERROR.shape,
      message: AUTH_HY.ERR_UNKNOWN,
    });
  }
  return value;
}

// ---------------------------------------------------------------------------
// Static-hosting fallback (no backend on this origin)
// ---------------------------------------------------------------------------
//
// When the SPA is deployed to a purely static host (a Vercel front that serves
// only `index.html`), the `/api/v1/*` handlers do not exist: they answer 404 or,
// with an SPA rewrite, the served HTML document. The account flow is a
// first-class part of the demo, so rather than dead-end the customer every auth
// call below mirrors `trackOrder` and simulates the equivalent result on the
// client the moment the real API is absent.
//
// The trigger is deliberately narrow — a missing route (404) or a body that is
// not the documented JSON (`response_shape`). A genuine backend verdict (401 /
// 409 / 422 / 429) is still surfaced unchanged and is never masked by a fake
// success, so this path can only activate where there is no backend at all.

const CLIENT_SESSION_KEY = 'tab_client_user';
const CLIENT_ADDRESSES_KEY = 'tab_client_addresses';

/** Neutral "customer" label for a login that predates any registration. It is a
 *  bare Armenian-block word (U+0530-U+058F), so no homoglyph can enter it. */
const FALLBACK_CUSTOMER_NAME = 'Օգտատեր';

function isStaticDeploymentError(error: unknown): boolean {
  return (
    error instanceof AccountApiError &&
    (error.status === 404 || error.code === ACCOUNT_ERROR.shape)
  );
}

function hasClientStorage(): boolean {
  return typeof window !== 'undefined' && !!window.localStorage;
}

function readClientJson(key: string): unknown {
  if (!hasClientStorage()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    // A hand-edited or truncated record is treated as absent, never trusted.
    return null;
  }
}

function writeClientJson(key: string, value: unknown): void {
  if (!hasClientStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage disabled or full: the in-memory result still stands for this session.
  }
}

/** The stored mock identity is re-narrowed through the same guard the real
 *  `/me` response uses, so a corrupt record can never reach a component. */
function readClientUser(): User | null {
  return asUser(readClientJson(CLIENT_SESSION_KEY));
}

function writeClientUser(user: User): void {
  writeClientJson(CLIENT_SESSION_KEY, user);
}

function clearClientSession(): void {
  if (!hasClientStorage()) return;
  try {
    window.localStorage.removeItem(CLIENT_SESSION_KEY);
    window.localStorage.removeItem(CLIENT_ADDRESSES_KEY);
  } catch {
    // Nothing to retry — logout reports success either way.
  }
}

function readClientAddresses(): UserAddress[] {
  return asAddresses(readClientJson(CLIENT_ADDRESSES_KEY)) ?? [];
}

function writeClientAddresses(addresses: UserAddress[]): void {
  writeClientJson(CLIENT_ADDRESSES_KEY, addresses);
}

// ---------------------------------------------------------------------------
// Client order ledger (static hosting)
// ---------------------------------------------------------------------------
//
// On a host without a backend, a placed order must still appear in the account
// list and remain trackable by its `TAB-XXXXX` number. Every simulated order —
// from the mock `submitOrder` or from checkout's failed `attachOrder` — is
// appended here under a single localStorage key, so the whole funnel
// (checkout → account orders → order tracking) closes without any server.

/** A `UserOrderSummary` plus the handful of fields tracking renders. */
interface ClientOrderRecord extends UserOrderSummary {
  customerName: string;
  phone: string;
  paymentMethod: string;
  deliveryMethod?: DeliveryMethod;
  deliveryAddress?: string;
  currentStatus?: OrderStatus;
}

const CLIENT_ORDERS_KEY = 'tab_client_orders';

function readClientOrders(): ClientOrderRecord[] {
  const raw = readClientJson(CLIENT_ORDERS_KEY);
  if (!Array.isArray(raw)) return [];
  const out: ClientOrderRecord[] = [];
  for (const entry of raw) {
    const summary = asOrder(entry);
    if (!summary) continue;
    const record = entry as Record<string, unknown>;
    out.push({
      ...summary,
      customerName: typeof record.customerName === 'string' ? record.customerName : FALLBACK_CUSTOMER_NAME,
      phone: typeof record.phone === 'string' ? record.phone : '',
      paymentMethod: typeof record.paymentMethod === 'string' ? record.paymentMethod : 'Կանխիկ',
      ...(typeof record.deliveryMethod === 'string'
        ? { deliveryMethod: record.deliveryMethod as DeliveryMethod }
        : {}),
      ...(typeof record.deliveryAddress === 'string' ? { deliveryAddress: record.deliveryAddress } : {}),
      ...(typeof record.currentStatus === 'string' &&
      (Object.values(ORDER_STATUS) as string[]).includes(record.currentStatus)
        ? { currentStatus: record.currentStatus as OrderStatus }
        : {}),
    });
  }
  return out;
}

/** Newest first: the account list and the tracking lookup both read it this way. */
function persistClientOrder(record: ClientOrderRecord): void {
  const list = readClientOrders().filter((o) => o.number !== record.number);
  list.unshift(record);
  writeClientJson(CLIENT_ORDERS_KEY, list.slice(0, 50));
}

/** Human label for the payment method token the checkout form submits. */
function clientPaymentLabel(method: string): string {
  switch (method) {
    case 'idram':
      return 'Idram';
    case 'telcell':
      return 'Telcell';
    case 'card':
      // Բանկային քարտ
      return '\u0532\u0561\u0576\u056f\u0561\u0575\u056b\u0576 \u0584\u0561\u0580\u057f';
    default:
      // Կանխիկ (cash)
      return '\u053f\u0561\u0576\u056d\u056b\u056f';
  }
}

/**
 * Files a just-placed order in the local ledger. Checkout calls this for every
 * order (guest or signed-in), so tracking and the account list work even when
 * `attachOrder` had no backend to talk to. Payment and delivery arrive as the
 * raw form tokens; only known ones are translated, the rest stay verbatim.
 */
export function recordClientOrder(input: {
  number: string;
  status: OrderStatus;
  total: number;
  items: UserOrderItem[];
  customerName: string;
  phone: string;
  paymentMethod?: string;
  deliveryMethod?: string;
}): void {
  const delivery =
    input.deliveryMethod === 'showroom_pickup'
      ? // Pickup address truth comes from the shared config.
        DELIVERY_CONFIG.pickupAddress
      : undefined;
  persistClientOrder({
    id: input.number,
    number: input.number,
    createdAt: new Date().toISOString(),
    status: input.status,
    currentStatus: input.status,
    total: input.total,
    items: input.items,
    customerName: input.customerName || FALLBACK_CUSTOMER_NAME,
    phone: input.phone,
    paymentMethod: input.paymentMethod ? clientPaymentLabel(input.paymentMethod) : clientPaymentLabel('cash'),
    ...(delivery ? { deliveryMethod: 'showroom_pickup' as DeliveryMethod, deliveryAddress: delivery } : {}),
  });
}

const STATUS_ORDER: OrderStatus[] = [
  ORDER_STATUS.RECEIVED,
  ORDER_STATUS.PROCESSING,
  ORDER_STATUS.READY_FOR_PICKUP,
  ORDER_STATUS.IN_TRANSIT,
  ORDER_STATUS.DELIVERED,
];

/**
 * Timeline copy for a locally filed order, keyed by status index. Armenian is
 * written as unicode escapes (homoglyph-safe policy) and every codepoint below
 * sits inside U+0530–U+058F.
 */
const CLIENT_TIMELINE_STEPS: ReadonlyArray<Omit<OrderTrackingStep, 'isCompleted' | 'isCurrent'>> = [
  {
    id: 'step-1',
    title: '\u054a\u0561\u057f\u057e\u0565\u0580\u0568 \u054d\u057f\u0561\u056e\u057e\u0561\u056e \u0567', // Պատվերը Ստացված է
    description: '\u054a\u0561\u057f\u057e\u0565\u0580\u0568 \u0563\u0580\u0561\u0576\u0581\u057e\u0565\u056c \u0567 \u0570\u0561\u0574\u0561\u056f\u0561\u0580\u0563\u0578\u0582\u0574', // Պատվերը գրանցվել է համակարգում
  },
  {
    id: 'step-2',
    title: '\u0544\u0577\u0561\u056f\u057e\u0578\u0582\u0574 \u0567 \u057d\u0580\u0561\u0570\u0578\u0582\u0574', // Մշակվում է սրահում
    description: '\u054d\u057f\u0578\u0582\u0563\u057e\u0578\u0582\u0574 \u0567\u056f \u0561\u057a\u0580\u0561\u0576\u0584\u0576\u0565\u0580\u0568 \u0578\u0582 \u0570\u0561\u0577\u057e\u0578\u0580\u0561\u056f\u0578\u0582\u0574 \u057a\u0561\u0570\u0565\u057d\u057f\u0561\u0575\u056b\u0576', // Ստուգվում են ապրանքները և հասցրոգռում պահեստային
  },
  {
    id: 'step-3',
    title: '\u054a\u0561\u057f\u0580\u0561\u057d\u057f \u0567 \u054d\u057f\u0561\u0581\u0574\u0561\u0576', // Պատրաստ է Ստացման
    description: '\u054a\u0561\u057f\u057e\u0565\u0580\u0568 \u0561\u0574\u0580\u0561\u0563\u0580\u057e\u0561\u056e \u0567 \u057d\u0580\u0561\u0570\u0578\u0582\u0574', // Պատվերը ամրագրված է սրահում
  },
  {
    id: 'step-4',
    title: '\u0533\u0576\u0561\u056c\u0578\u0582\u0574 \u0567 \u0578\u0582\u0572\u0572\u0561\u056c\u0578\u0582\u0574', // Գնալում է Ուղղությամբ -> in transit
    description: '\u0531\u057c\u0561\u0584\u056b\u0579\u0568 \u0577\u0561\u0580\u0574\u057e\u0578\u0582\u0574 \u0567 \u0564\u0565\u057a\u056b \u0570\u0561\u057d\u0581\u0565', // Առաքիչը շարժվում է դեպի հասցե
  },
  {
    id: 'step-5',
    title: '\u0540\u0561\u0576\u0571\u0576\u057e\u0561\u056e \u0567', // Հանձնված է
    description: '\u054a\u0561\u057f\u057e\u0565\u0580\u0568 \u0561\u057e\u0561\u0580\u057f\u057e\u0561\u056e \u0567', // Պատվերը ավարտված է
  },
];

/** Renders the local ledger entry as a full tracking payload. */
function trackedOrderFromClientRecord(record: ClientOrderRecord): TrackedOrderDetails {
  const current = record.currentStatus ?? record.status;
  const reached = Math.max(0, STATUS_ORDER.indexOf(current));
  return {
    orderId: record.number,
    createdAt: record.createdAt,
    customerName: record.customerName,
    phone: record.phone,
    deliveryMethod: record.deliveryMethod ?? 'showroom_pickup',
    ...(record.deliveryAddress ? { deliveryAddress: record.deliveryAddress } : {}),
    paymentMethod: record.paymentMethod,
    paymentStatus: 'pending',
    currentStatus: current,
    timeline: CLIENT_TIMELINE_STEPS.map((step, index) => ({
      ...step,
      timestamp: index === 0 ? formatDateDDMMYYYY(record.createdAt) : undefined,
      isCompleted: index <= reached,
      isCurrent: index === reached,
    })),
    items: record.items.map((item, index) => {
      const catalog = products.find((p) => String(p.id) === item.productId);
      return {
        id: index + 1,
        code: catalog?.code ?? item.productId,
        title: catalog ? displayTitle(catalog.title) : item.title,
        image: item.image ?? catalog?.images[0] ?? '',
        quantity: item.quantity,
        price: catalog?.price ?? 0,
      };
    }),
    totalAmount: record.total,
  };
}

/** Stand-in for a database id; shaped so `identifier()` in the guards accepts it. */
function clientEntityId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;
}

/**
 * `GET /me`. Returns `null` for a guest (401) instead of throwing: being signed
 * out is a normal state, and the header must render it without an error path.
 */
export async function getMe(): Promise<User | null> {
  try {
    return await accountRequest('GET', '/me', asUserPayload);
  } catch (error) {
    if (error instanceof AccountApiError && error.isUnauthenticated) return null;
    if (isStaticDeploymentError(error)) return readClientUser();
    throw error;
  }
}

export async function login(input: LoginPayload): Promise<User> {
  try {
    return await accountRequest('POST', '/auth/login', asUserPayload, {
      phone: input.phone,
      password: input.password,
    });
  } catch (error) {
    if (!isStaticDeploymentError(error)) throw error;
    // Reuse a previously simulated identity for this number, or mint one so the
    // demo can proceed without a backend.
    const existing = readClientUser();
    const mockUser: User = {
      id: existing && existing.phone === input.phone ? existing.id : clientEntityId('usr'),
      fullName: existing ? existing.fullName : FALLBACK_CUSTOMER_NAME,
      phone: input.phone,
      createdAt: existing && existing.phone === input.phone ? existing.createdAt : new Date().toISOString(),
      ...(existing && existing.email ? { email: existing.email } : {}),
    };
    writeClientUser(mockUser);
    return mockUser;
  }
}

export async function register(input: RegisterPayload): Promise<User> {
  try {
    return await accountRequest('POST', '/auth/register', asUserPayload, {
      fullName: input.fullName,
      phone: input.phone,
      password: input.password,
      acceptTerms: input.acceptTerms,
    });
  } catch (error) {
    if (!isStaticDeploymentError(error)) throw error;
    // Registration signs the customer in, so the mock mirrors the same payload
    // the server would return. `RegisterPayload` carries no email field.
    const mockUser: User = {
      id: clientEntityId('usr'),
      fullName: input.fullName.trim(),
      phone: input.phone,
      createdAt: new Date().toISOString(),
    };
    writeClientUser(mockUser);
    return mockUser;
  }
}

/** Logout always clears the local state; the server answers 200 even on an expired session. */
export async function logout(): Promise<void> {
  // Clear the client session first so a static host leaves the tab signed out
  // even though there is no cookie to destroy.
  clearClientSession();
  try {
    await accountRequest('POST', '/auth/logout', (data) => (typeof data === 'object' && data !== null ? true : null), {});
  } catch (error) {
    // Only an absent backend is swallowed; a real failure still surfaces.
    if (!isStaticDeploymentError(error)) throw error;
  }
}

export async function updateProfile(input: UpdateProfilePayload): Promise<User> {
  try {
    return await accountRequest('PATCH', '/me', asUserPayload, {
      ...(input.fullName !== undefined ? { fullName: input.fullName } : {}),
      ...(input.email !== undefined ? { email: input.email } : {}),
    });
  } catch (error) {
    if (!isStaticDeploymentError(error)) throw error;
    const current = readClientUser();
    if (!current) {
      throw new AccountApiError({
        status: 401,
        code: ACCOUNT_ERROR.unauthenticated,
        message: AUTH_HY.ERR_SESSION_EXPIRED,
      });
    }
    const email = input.email !== undefined ? input.email.trim() : current.email;
    const updated: User = {
      id: current.id,
      fullName: input.fullName !== undefined ? input.fullName.trim() : current.fullName,
      phone: current.phone,
      createdAt: current.createdAt,
      ...(email ? { email } : {}),
    };
    writeClientUser(updated);
    return updated;
  }
}

export async function listAddresses(): Promise<UserAddress[]> {
  try {
    return await accountRequest('GET', '/me/addresses', asAddressesPayload);
  } catch (error) {
    if (!isStaticDeploymentError(error)) throw error;
    // A guest on a static host has no addresses; a simulated session reads them back.
    return readClientUser() ? readClientAddresses() : [];
  }
}

export async function createAddress(input: AddressInput): Promise<UserAddress> {
  try {
    return await accountRequest('POST', '/me/addresses', asAddressPayload, { ...input });
  } catch (error) {
    if (!isStaticDeploymentError(error)) throw error;
    const list = readClientAddresses();
    // Mirrors the server rule: the first saved address is always the default.
    const makeDefault = list.length === 0 || input.isDefault === true;
    if (makeDefault) for (const a of list) a.isDefault = false;
    const created: UserAddress = { ...input, id: clientEntityId('adr'), isDefault: makeDefault };
    list.push(created);
    writeClientAddresses(list);
    return created;
  }
}

export async function updateAddress(id: string, patch: Partial<AddressInput>): Promise<UserAddress> {
  try {
    return await accountRequest('PATCH', `/me/addresses/${encodeURIComponent(id)}`, asAddressPayload, { ...patch });
  } catch (error) {
    if (!isStaticDeploymentError(error)) throw error;
    const list = readClientAddresses();
    const index = list.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new AccountApiError({ status: 404, code: ACCOUNT_ERROR.notFound, message: AUTH_HY.ERR_UNKNOWN });
    }
    const merged: UserAddress = { ...list[index], ...patch, id };
    if (merged.isDefault) for (const a of list) if (a.id !== id) a.isDefault = false;
    list[index] = merged;
    writeClientAddresses(list);
    return merged;
  }
}

/** Resolves with the remaining list, so a delete never needs a second round trip. */
export async function deleteAddress(id: string): Promise<UserAddress[]> {
  try {
    return await accountRequest('DELETE', `/me/addresses/${encodeURIComponent(id)}`, (data) => {
      if (typeof data !== 'object' || data === null) return null;
      return asAddresses((data as { addresses?: unknown }).addresses);
    }, {});
  } catch (error) {
    if (!isStaticDeploymentError(error)) throw error;
    const remaining = readClientAddresses().filter((a) => a.id !== id);
    writeClientAddresses(remaining);
    return remaining;
  }
}

export async function listOrders(): Promise<UserOrderSummary[]> {
  try {
    return await accountRequest('GET', '/me/orders', asOrdersPayload);
  } catch (error) {
    // Static hosting: the local ledger is the order history for this device.
    if (!isStaticDeploymentError(error)) throw error;
    return readClientOrders();
  }
}

/**
 * Attaches a just-placed order to the signed-in customer. Mock-only bridge:
 * Laravel links the order to `Auth::user()` when it creates it, so the checkout
 * behaviour stays while this call disappears. On a host without a backend the
 * order is filed in the local ledger instead, keeping the account list and the
 * tracking page working.
 */
export async function attachOrder(input: {
  number: string;
  status: OrderStatus;
  total: number;
  items: UserOrderItem[];
}): Promise<UserOrderSummary> {
  try {
    return await accountRequest('POST', '/me/orders', asOrderPayload, { ...input });
  } catch (error) {
    if (!isStaticDeploymentError(error)) throw error;
    const summary: UserOrderSummary = {
      id: input.number,
      number: input.number,
      createdAt: new Date().toISOString(),
      status: input.status,
      total: input.total,
      items: input.items,
    };
    const user = readClientUser();
    recordClientOrder({
      number: input.number,
      status: input.status,
      total: input.total,
      items: input.items,
      customerName: user?.fullName ?? FALLBACK_CUSTOMER_NAME,
      phone: user?.phone ?? '',
    });
    return summary;
  }
}

/**
 * Contract-only (the mock answers 501). The forgot-password control calls this so
 * enabling SMS OTP later is a backend change, not a UI refactor.
 */
export async function requestPasswordReset(phone: string): Promise<void> {
  await accountRequest('POST', '/auth/password/reset', (data) => (data === null ? true : null), { phone });
}

/**
 * Dev-only quick-login source. Credentials are served by the dev API rather than
 * embedded in the bundle, so a production build cannot contain them even as dead
 * code; in production the endpoint answers 404 and this returns `null`.
 */
export async function getDevDemoCredentials(): Promise<{ phone: string; password: string } | null> {
  try {
    return await accountRequest('GET', '/auth/dev-demo', (data) => {
      if (typeof data !== 'object' || data === null) return null;
      const record = data as Record<string, unknown>;
      const phone = typeof record.phone === 'string' ? record.phone : null;
      const password = typeof record.password === 'string' ? record.password : null;
      return phone && password ? { phone, password } : null;
    });
  } catch (error) {
    if (error instanceof AccountApiError && (error.status === 404 || error.code === ACCOUNT_ERROR.featureDisabled)) {
      return null;
    }
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Contact inquiry (public, unauthenticated)
// ---------------------------------------------------------------------------

export interface ContactMessagePayload {
  name: string;
  phone: string;
  topic: string;
  message: string;
  consent: boolean;
  /** Honeypot: must be left empty by humans; a filled value is silently dropped. */
  website?: string;
}

/**
 * `POST /contact-messages`. Field validation mirrors `validateContact` (shared
 * with the browser and the future Laravel validator), so the request that
 * reaches here has already passed the same rules. The double-submit guard is
 * owned by the form: it disables the button while pending and reuses a single
 * idempotency key per composed message, so a second click never re-posts.
 */
export async function createContactMessage(payload: ContactMessagePayload): Promise<{ id: string }> {
  try {
    return await accountRequest('POST', '/contact-messages', (data) => {
      if (typeof data !== 'object' || data === null) return null;
      const id = (data as Record<string, unknown>).id;
      return typeof id === 'string' && id ? { id } : null;
    }, { ...payload });
  } catch (error) {
    // Same narrow static-host fallback the account endpoints use: a missing
    // route (404) or an HTML body (`response_shape`) means there is no backend
    // on this origin at all, so the demo flow simulates the 201 locally. A
    // genuine verdict (422 / 429 / network) always surfaces unchanged.
    if (!isStaticDeploymentError(error)) throw error;
    return { id: clientEntityId('contact') };
  }
}


