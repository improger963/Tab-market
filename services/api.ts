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
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  AddressInput,
  OrderStatus,
  User,
  UserAddress,
  UserOrderItem,
  UserOrderSummary,
} from '@/types/api';
import { Product, Category } from '@/types';
import {
  TRACKING_FIXTURES,
  ORDER_NOT_FOUND_MESSAGE,
  buildDynamicFixture,
} from '@/services/trackingFixtures';
import { AUTH_HY } from '@/lib/copy/authHy';
import {
  asAddressPayload,
  asAddresses,
  asAddressesPayload,
  asOrderPayload,
  asOrdersPayload,
  asUserPayload,
} from '@/lib/auth/guards';

const API_BASE = typeof window !== 'undefined' ? '/api/v1' : 'http://localhost:3000/api/v1';

/**
 * Generates a new order id in the canonical `TAB-xxxxx` format.
 * Order-number ownership lives in the API layer, never in a component, so the
 * Laravel backend can adopt the exact same contract.
 */
export function generateOrderId(): string {
  return `TAB-${Math.floor(10000 + Math.random() * 90000)}`;
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

  const res = await fetch(`${API_BASE}/products?${query.toString()}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error('Ապրանքների բեռնման սխալ');
  }
  const json: PaginatedResponse<Product> = await res.json();
  return json;
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const res = await fetch(`${API_BASE}/products/${slug}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    return null;
  }
  const json: ApiResponse<Product> = await res.json();
  return json.data;
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    return [];
  }
  const json: ApiResponse<Category[]> = await res.json();
  return json.data;
}

export async function searchProducts(query: string): Promise<Product[]> {
  if (!query || query.trim() === '') return [];
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    return [];
  }
  const json: ApiResponse<Product[]> = await res.json();
  return json.data;
}

export async function submitOrder(payload: CreateOrderPayload): Promise<OrderConfirmation> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Պատվերի ձևակերպման սխալ');
  }
  return json.data;
}

export async function validateCoupon(
  code: string
): Promise<{ valid: boolean; discountPercent: number; message: string }> {
  const res = await fetch(`${API_BASE}/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Անվավեր պրոմոկոդ');
  }
  return json.data;
}

/**
 * Resolves a tracked order entirely client-side from the fixtures, throwing a
 * clean Armenian "not found" message (never a raw JSON parse error).
 */
function resolveTrackedOrder(orderId: string, phone: string): TrackedOrderDetails {
  const id = orderId.trim().toUpperCase();
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
  try {
    const res = await fetch(
      `${API_BASE}/orders/track?orderId=${encodeURIComponent(orderId)}&phone=${encodeURIComponent(phone)}`,
      {
        cache: 'no-store',
      }
    );
    const contentType = res.headers.get('content-type') ?? '';
    // Only trust genuine JSON. A Vite SPA fallback (index.html), a non-2xx
    // status, or a malformed body falls through to the client-side fixtures,
    // so the customer never sees `Unexpected token '<' ... is not valid JSON`.
    if (res.ok && contentType.includes('application/json')) {
      const json = (await res.json()) as ApiResponse<TrackedOrderDetails>;
      if (json?.success && json.data) return json.data;
      throw new Error(json?.message || ORDER_NOT_FOUND_MESSAGE);
    }
  } catch {
    // Network / parse failure — resolve from fixtures below instead.
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

/**
 * `GET /me`. Returns `null` for a guest (401) instead of throwing: being signed
 * out is a normal state, and the header must render it without an error path.
 */
export async function getMe(): Promise<User | null> {
  try {
    return await accountRequest('GET', '/me', asUserPayload);
  } catch (error) {
    if (error instanceof AccountApiError && error.isUnauthenticated) return null;
    throw error;
  }
}

export function login(input: LoginPayload): Promise<User> {
  return accountRequest('POST', '/auth/login', asUserPayload, {
    phone: input.phone,
    password: input.password,
  });
}

export function register(input: RegisterPayload): Promise<User> {
  return accountRequest('POST', '/auth/register', asUserPayload, {
    fullName: input.fullName,
    phone: input.phone,
    password: input.password,
    acceptTerms: input.acceptTerms,
  });
}

/** Logout always clears the local state; the server answers 200 even on an expired session. */
export async function logout(): Promise<void> {
  await accountRequest('POST', '/auth/logout', (data) => (typeof data === 'object' && data !== null ? true : null), {});
}

export function updateProfile(input: UpdateProfilePayload): Promise<User> {
  return accountRequest('PATCH', '/me', asUserPayload, {
    ...(input.fullName !== undefined ? { fullName: input.fullName } : {}),
    ...(input.email !== undefined ? { email: input.email } : {}),
  });
}

export function listAddresses(): Promise<UserAddress[]> {
  return accountRequest('GET', '/me/addresses', asAddressesPayload);
}

export function createAddress(input: AddressInput): Promise<UserAddress> {
  return accountRequest('POST', '/me/addresses', asAddressPayload, { ...input });
}

export function updateAddress(id: string, patch: Partial<AddressInput>): Promise<UserAddress> {
  return accountRequest('PATCH', `/me/addresses/${encodeURIComponent(id)}`, asAddressPayload, { ...patch });
}

/** Resolves with the remaining list, so a delete never needs a second round trip. */
export function deleteAddress(id: string): Promise<UserAddress[]> {
  return accountRequest('DELETE', `/me/addresses/${encodeURIComponent(id)}`, (data) => {
    if (typeof data !== 'object' || data === null) return null;
    return asAddresses((data as { addresses?: unknown }).addresses);
  }, {});
}

export function listOrders(): Promise<UserOrderSummary[]> {
  return accountRequest('GET', '/me/orders', asOrdersPayload);
}

/**
 * Attaches a just-placed order to the signed-in customer. Mock-only bridge:
 * Laravel links the order to `Auth::user()` when it creates it, so the checkout
 * behaviour stays while this call disappears.
 */
export function attachOrder(input: {
  number: string;
  status: OrderStatus;
  total: number;
  items: UserOrderItem[];
}): Promise<UserOrderSummary> {
  return accountRequest('POST', '/me/orders', asOrderPayload, { ...input });
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

