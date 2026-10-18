/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * MOCK CUSTOMER-ACCOUNT API — the contract the Laravel (Sanctum) backend will
 * take over. Every endpoint answers in the `{ data, meta?, error? }` envelope,
 * validates with the SAME `lib/auth/schema` module the browser forms use, and
 * reads the session through `getSession()`.
 *
 * It is deliberately written against `node:http` rather than a framework: the
 * function below is mounted into Vite's connect stack in development and into
 * the standalone production server unchanged, and neither the store nor the
 * security helpers care who called them.
 *
 * Requests outside its own path space are passed straight through with `next()`:
 * the pre-existing `/api/v1/products`, `/orders`, `/search` handlers keep the
 * exact behaviour they had before this file existed.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { Buffer } from 'node:buffer';
import process from 'node:process';
import type { OrderStatus } from '../types/api.ts';
import { ORDER_STATUS } from '../types/api.ts';
import { AUTH_HY } from '../lib/copy/authHy.ts';
import {
  LIMITS,
  validateAddress,
  validateLogin,
  validateProfile,
  validateRegister,
  type AddressFormInput,
  type FieldErrors,
} from '../lib/auth/schema.ts';
import {
  DEV_DEMO_PASSWORD,
  DEV_DEMO_PHONE,
  attachOrder,
  countAddresses,
  createAddress,
  createUser,
  deleteAddress,
  destroySession,
  findAddress,
  findOrder,
  findUserByPhone,
  listAddresses,
  listOrders,
  updateAddress,
  updateUser,
  verifyPassword,
  type StoredUser,
} from './store.ts';
import {
  endSession,
  getSession,
  startSession,
  toPublicUser,
  type SessionContext,
} from './session.ts';
import {
  consumeAttempt,
  hasJsonBody,
  isSameOriginRequest,
  noStore,
  requestIp,
  resetAttempts,
  sendCreated,
  sendError,
  sendOk,
  sendRateLimited,
  writeJson,
} from './security.ts';

const API_PREFIX = '/api/v1';
const MAX_BODY_BYTES = 32 * 1024;

type NextLike = (error?: unknown) => void;

interface Ctx {
  req: IncomingMessage;
  res: ServerResponse;
  params: Record<string, string>;
  body: Record<string, unknown>;
}

type Handler = (ctx: Ctx) => void | Promise<void>;

interface Route {
  method: string;
  segments: string[];
  handler: Handler;
}

function route(method: string, path: string, handler: Handler): Route {
  return { method, segments: path.slice(1).split('/'), handler };
}

/** Status codes the client is allowed to branch on (see the deliverable). */
const CODE = {
  unauthenticated: 'unauthenticated',
  invalidCredentials: 'invalid_credentials',
  validationFailed: 'validation_failed',
  accountExists: 'account_exists',
  addressLimit: 'address_limit_reached',
  notFound: 'not_found',
  methodNotAllowed: 'method_not_allowed',
  sameOriginRequired: 'same_origin_required',
  invalidPayload: 'invalid_payload',
  otpNotImplemented: 'otp_not_implemented',
  passwordResetNotImplemented: 'password_reset_not_implemented',
  featureDisabled: 'feature_disabled',
} as const;

// --- Field readers ---------------------------------------------------------
/**
 * Unknown keys are ignored, wrong types degrade to empty: a client sending
 * `email: null` must not crash the server or bypass a length limit.
 */
function str(body: Record<string, unknown>, key: string): string {
  const value = body[key];
  return typeof value === 'string' ? value : '';
}

function bool(body: Record<string, unknown>, key: string, fallback = false): boolean {
  const value = body[key];
  return typeof value === 'boolean' ? value : fallback;
}

function intIn(body: Record<string, unknown>, key: string, min: number, max: number): number | null {
  const value = body[key];
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const rounded = Math.round(value);
  return rounded >= min && rounded <= max ? rounded : null;
}

// --- Guards ----------------------------------------------------------------

function unverified(res: ServerResponse): void {
  noStore(res);
  sendError(res, 401, CODE.unauthenticated, AUTH_HY.ERR_SESSION_EXPIRED);
}

function invalid(res: ServerResponse, fields: FieldErrors): void {
  noStore(res);
  // The top-level message stays generic; only field hints are specific, so a
  // failed login never becomes an oracle for which rule was broken.
  sendError(res, 422, CODE.validationFailed, AUTH_HY.ERR_UNKNOWN, fields);
}

/**
 * Mutating endpoints are cookie-authenticated, so they must be same-origin and
 * must not be a form post (`form` elements send `urlencoded` and are the classic
 * CSRF vehicle). Returns the parsed body, or `null` after responding.
 */
async function guardMutation(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<Record<string, unknown> | null> {
  if (!isSameOriginRequest(req)) {
    noStore(res);
    sendError(res, 403, CODE.sameOriginRequired, AUTH_HY.ERR_UNKNOWN);
    return null;
  }
  if (!hasJsonBody(req)) {
    noStore(res);
    sendError(res, 415, CODE.invalidPayload, AUTH_HY.ERR_INVALID_REQUEST);
    return null;
  }
  const parsed = await readJsonBody(req);
  if (!parsed.ok) {
    noStore(res);
    sendError(res, 400, CODE.invalidPayload, AUTH_HY.ERR_INVALID_REQUEST);
    return null;
  }
  return parsed.value;
}

type BodyResult =
  | { ok: true; value: Record<string, unknown> }
  | { ok: false };

function readJsonBody(req: IncomingMessage): Promise<BodyResult> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    let size = 0;
    let settled = false;

    const finish = (result: BodyResult) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    req.on('data', (raw: unknown) => {
      const part = typeof raw === 'string' ? Buffer.from(raw) : Buffer.isBuffer(raw) ? raw : null;
      if (!part) return;
      size += part.length;
      // Over-limit bodies are still drained so the socket stays usable, but no
      // more memory is spent on them.
      if (size <= MAX_BODY_BYTES) chunks.push(part);
      else if (size > MAX_BODY_BYTES * 2) {
        req.destroy();
        finish({ ok: false });
      }
    });
    req.on('error', () => finish({ ok: false }));
    req.on('end', () => {
      if (size > MAX_BODY_BYTES) return finish({ ok: false });
      try {
        const text = Buffer.concat(chunks).toString('utf8');
        const parsed: unknown = text.length > 0 ? JSON.parse(text) : {};
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          return finish({ ok: false });
        }
        finish({ ok: true, value: parsed as Record<string, unknown> });
      } catch {
        finish({ ok: false });
      }
    });
  });
}

/**
 * A real account's hash cost is paid on every login; an unknown phone must cost
 * the same, otherwise response time alone says "this number is not registered".
 */
const TIMING_SINK_HASH = `scrypt$16384$8$1$${Buffer.alloc(16, 1).toString('base64')}$${Buffer.alloc(32).toString('base64')}`;

async function authenticate(
  req: IncomingMessage,
  res: ServerResponse,
  phone: string,
  password: string,
): Promise<SessionContext | null> {
  const ip = requestIp(req);
  const decision = consumeAttempt(ip, phone);
  if (!decision.allowed) {
    sendRateLimited(res, decision.retryAfterSeconds);
    return null;
  }

  const user = findUserByPhone(phone);
  if (!user) {
    // Same cost as a real verification: response time must not leak that this
    // number is not registered.
    await verifyPassword(password, TIMING_SINK_HASH);
    noStore(res);
    sendError(res, 401, CODE.invalidCredentials, AUTH_HY.ERR_LOGIN_GENERIC);
    return null;
  }
  if (!(await verifyPassword(password, user.passwordHash))) {
    noStore(res);
    sendError(res, 401, CODE.invalidCredentials, AUTH_HY.ERR_LOGIN_GENERIC);
    return null;
  }
  resetAttempts(ip, phone);
  // The token is minted by the caller, which is the only place that knows a
  // response is being written.
  return { user, token: '' };
}

// --- Payload builders ------------------------------------------------------

/**
 * Only keys the client actually sent are returned: `PATCH` must not overwrite a
 * stored line with an empty string just because the form omitted it, while a key
 * sent as `""` is the customer clearing that line.
 */
const ADDRESS_KEYS = [
  'label',
  'region',
  'city',
  'street',
  'building',
  'entrance',
  'floor',
  'apartment',
  'intercom',
  'recipientName',
  'recipientPhone',
  'comment',
] as const;

function addressFrom(body: Record<string, unknown>): Partial<AddressFormInput> {
  const out: Partial<AddressFormInput> = {};
  for (const key of ADDRESS_KEYS) {
    if (Object.prototype.hasOwnProperty.call(body, key)) out[key] = str(body, key);
  }
  if (Object.prototype.hasOwnProperty.call(body, 'isDefault')) out.isDefault = bool(body, 'isDefault');
  return out;
}

const ORDER_STATUSES = Object.values(ORDER_STATUS) as string[];

function isOrderStatus(value: string): value is OrderStatus {
  return ORDER_STATUSES.includes(value);
}

// --- Handlers --------------------------------------------------------------

async function handleRegister(ctx: Ctx): Promise<void> {
  const { req, res, body } = ctx;
  const checked = validateRegister({
    fullName: str(body, 'fullName'),
    phone: str(body, 'phone'),
    password: str(body, 'password'),
    acceptTerms: bool(body, 'acceptTerms'),
  });
  if (!checked.ok) return invalid(res, checked.errors);

  const { fullName, phone, password } = checked.value;
  const ip = requestIp(req);
  const decision = consumeAttempt(ip, phone);
  if (!decision.allowed) return sendRateLimited(res, decision.retryAfterSeconds);

  // Registration is the one place where existence is disclosed — the customer
  // has to be told to sign in instead — so the wording stays neutral and gives
  // the next step rather than a database fact.
  if (findUserByPhone(phone)) {
    noStore(res);
    return sendError(res, 409, CODE.accountExists, AUTH_HY.ERR_REGISTER_TAKEN, {
      phone: AUTH_HY.ERR_REGISTER_TAKEN,
    });
  }

  const user = await createUser({ fullName, phone, password });
  startSession(req, res, user.id);
  noStore(res);
  sendCreated(res, { user: toPublicUser(user) });
}

async function handleLogin(ctx: Ctx): Promise<void> {
  const { req, res, body } = ctx;
  const checked = validateLogin({ phone: str(body, 'phone'), password: str(body, 'password') });
  if (!checked.ok) return invalid(res, checked.errors);

  const { phone, password } = checked.value;
  // `authenticate` answers the throttle and the generic credential failure
  // itself, so a rejected login has exactly one response path.
  const authed = await authenticate(req, res, phone, password);
  if (!authed) return;

  startSession(req, res, authed.user.id);
  noStore(res);
  sendOk(res, { user: toPublicUser(authed.user) });
}

async function handleLogout(ctx: Ctx): Promise<void> {
  const { req, res } = ctx;
  const session = getSession(req);
  if (session) destroySession(session.token);
  endSession(req, res);
  noStore(res);
  // Always 200: an expired session is not a failed logout, and the UI clears
  // its own state either way.
  sendOk(res, { loggedOut: true });
}

function handleMe(ctx: Ctx): void {
  const session = getSession(ctx.req);
  if (!session) return unverified(ctx.res);
  noStore(ctx.res);
  sendOk(ctx.res, { user: toPublicUser(session.user) });
}

async function handlePatchMe(ctx: Ctx): Promise<void> {
  const { req, res, body } = ctx;
  const session = getSession(req);
  if (!session) return unverified(res);

  // A key that is ABSENT is not a change request; a key that is present but blank
  // is. Forwarding only what arrived is what lets `PATCH {email}` update the
  // address line without wiping the name.
  const checked = validateProfile({
    ...(Object.prototype.hasOwnProperty.call(body, 'fullName')
      ? { fullName: str(body, 'fullName') }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(body, 'email')
      ? { email: str(body, 'email') }
      : {}),
  });
  if (!checked.ok) return invalid(res, checked.errors);

  const updated = updateUser(session.user.id, {
    ...(checked.value.fullName !== undefined ? { fullName: checked.value.fullName } : {}),
    // An empty string the customer typed is a request to CLEAR the line, but
    // `validateProfile` legitimately drops it (an empty value is not an
    // address). Without carrying the intent separately, an email saved once
    // could never be removed.
    ...(typeof body.email === 'string' ? { email: checked.value.email ?? '' } : {}),
  });
  if (!updated) return sendError(res, 404, CODE.notFound, AUTH_HY.ERR_UNKNOWN);
  noStore(res);
  sendOk(res, { user: toPublicUser(updated) });
}

function handleListAddresses(ctx: Ctx): void {
  const session = getSession(ctx.req);
  if (!session) return unverified(ctx.res);
  const addresses = listAddresses(session.user.id);
  noStore(ctx.res);
  sendOk(ctx.res, { addresses }, { count: addresses.length });
}

function handleCreateAddress(ctx: Ctx): void {
  const session = getSession(ctx.req);
  if (!session) return unverified(ctx.res);
  if (countAddresses(session.user.id) >= LIMITS.addressesPerUser) {
    noStore(ctx.res);
    return sendError(ctx.res, 409, CODE.addressLimit, AUTH_HY.ERR_ADDRESS_LIMIT, {
      address: AUTH_HY.ERR_ADDRESS_LIMIT,
    });
  }
  const checked = validateAddress(addressFrom(ctx.body));
  if (!checked.ok) return invalid(ctx.res, checked.errors);

  const address = createAddress(session.user.id, checked.value);
  noStore(ctx.res);
  sendCreated(ctx.res, { address });
}

function handleUpdateAddress(ctx: Ctx): void {
  const session = getSession(ctx.req);
  if (!session) return unverified(ctx.res);
  const existing = findAddress(session.user.id, ctx.params.id ?? '');
  if (!existing) {
    noStore(ctx.res);
    return sendError(ctx.res, 404, CODE.notFound, AUTH_HY.ERR_UNKNOWN);
  }

  // Merge first, validate after: a PATCH must not be able to blank out a
  // required line, and the rules stay identical to POST.
  const merged = { ...existing, ...addressFrom(ctx.body) };
  const checked = validateAddress(merged);
  if (!checked.ok) return invalid(ctx.res, checked.errors);

  const updated = updateAddress(session.user.id, existing.id, checked.value);
  if (!updated) {
    noStore(ctx.res);
    return sendError(ctx.res, 404, CODE.notFound, AUTH_HY.ERR_UNKNOWN);
  }
  noStore(ctx.res);
  sendOk(ctx.res, { address: updated });
}

function handleDeleteAddress(ctx: Ctx): void {
  const session = getSession(ctx.req);
  if (!session) return unverified(ctx.res);
  const removed = deleteAddress(session.user.id, ctx.params.id ?? '');
  if (!removed) {
    noStore(ctx.res);
    return sendError(ctx.res, 404, CODE.notFound, AUTH_HY.ERR_UNKNOWN);
  }
  noStore(ctx.res);
  sendOk(ctx.res, { deleted: true, addresses: listAddresses(session.user.id) });
}

function handleListOrders(ctx: Ctx): void {
  const session = getSession(ctx.req);
  if (!session) return unverified(ctx.res);
  const orders = listOrders(session.user.id);
  noStore(ctx.res);
  sendOk(ctx.res, { orders }, { count: orders.length });
}

function handleShowOrder(ctx: Ctx): void {
  const session = getSession(ctx.req);
  if (!session) return unverified(ctx.res);
  const order = findOrder(session.user.id, ctx.params.id ?? '');
  if (!order) {
    noStore(ctx.res);
    return sendError(ctx.res, 404, CODE.notFound, AUTH_HY.ERR_UNKNOWN);
  }
  noStore(ctx.res);
  sendOk(ctx.res, { order });
}

/**
 * Attaches a just-placed order to the signed-in customer. Mock-only: Laravel
 * links `order->user()` when it creates the order, so this route disappears in
 * the swap while the checkout behaviour stays. Guest orders are never adopted
 * retroactively (that needs the phone-OTP follow-up).
 */
function handleAttachOrder(ctx: Ctx): void {
  const session = getSession(ctx.req);
  if (!session) return unverified(ctx.res);

  const number = str(ctx.body, 'number').trim();
  const status = str(ctx.body, 'status');
  const total = intIn(ctx.body, 'total', 0, 1_000_000_000);
  const rawItems = ctx.body['items'];
  if (!/^TAB-\d{1,10}$/.test(number) || !isOrderStatus(status) || total === null || !Array.isArray(rawItems)) {
    noStore(ctx.res);
    return sendError(ctx.res, 422, CODE.validationFailed, AUTH_HY.ERR_UNKNOWN);
  }

  const items = rawItems
    .slice(0, 50)
    .map((item: unknown) => {
      if (typeof item !== 'object' || item === null) return null;
      const record = item as Record<string, unknown>;
      const title = typeof record['title'] === 'string' ? record['title'].slice(0, 200) : '';
      const productId = typeof record['productId'] === 'string'
        ? record['productId'].slice(0, 64)
        : String(record['productId'] ?? '').slice(0, 64);
      const quantity = intIn(record, 'quantity', 1, 999) ?? 1;
      const image = typeof record['image'] === 'string' ? record['image'].slice(0, 500) : null;
      return title && productId ? { productId, title, image, quantity } : null;
    })
    .filter((item) => item !== null);

  const order = attachOrder(session.user.id, {
    number,
    status: status as OrderStatus,
    total,
    items,
  });
  noStore(ctx.res);
  sendCreated(ctx.res, { order });
}

/**
 * Contract-only endpoints. They exist so SMS OTP and password reset can be
 * switched on later without touching the UI: the client already calls them and
 * already handles 501 as "not available yet".
 */
function notImplemented(ctx: Ctx, code: string): void {
  noStore(ctx.res);
  writeJson(ctx.res, 501, {
    success: false,
    data: null,
    error: {
      code,
      message: AUTH_HY.FEATURE_COMING_SOON,
      fields: {
        implementation: 'Planned: SMS OTP via the shop\'s existing provider, then password reset through the same channel.',
      },
      meta: { requiredFields: ['phone'], nextStep: 'OTP delivery is the blocker for both flows.' },
    },
  });
}

/**
 * Dev-only: the quick-login chip asks for the demo credentials instead of
 * carrying them in source, so a production bundle cannot contain them even as
 * dead code.
 */
function handleDevDemo(ctx: Ctx): void {
  if (process.env.NODE_ENV === 'production') {
    noStore(ctx.res);
    return sendError(ctx.res, 404, CODE.featureDisabled, AUTH_HY.ERR_UNKNOWN);
  }
  noStore(ctx.res);
  sendOk(ctx.res, { phone: DEV_DEMO_PHONE, password: DEV_DEMO_PASSWORD });
}

// --- Route table -----------------------------------------------------------

const ROUTES: Route[] = [
  route('POST', '/auth/register', handleRegister),
  route('POST', '/auth/login', handleLogin),
  route('POST', '/auth/logout', handleLogout),
  route('GET', '/auth/dev-demo', handleDevDemo),
  route('POST', '/auth/otp/request', (ctx) => notImplemented(ctx, CODE.otpNotImplemented)),
  route('POST', '/auth/otp/verify', (ctx) => notImplemented(ctx, CODE.otpNotImplemented)),
  route('POST', '/auth/password/reset', (ctx) => notImplemented(ctx, CODE.passwordResetNotImplemented)),
  route('GET', '/me', handleMe),
  route('PATCH', '/me', handlePatchMe),
  route('GET', '/me/addresses', handleListAddresses),
  route('POST', '/me/addresses', handleCreateAddress),
  route('PATCH', '/me/addresses/:id', handleUpdateAddress),
  route('DELETE', '/me/addresses/:id', handleDeleteAddress),
  route('GET', '/me/orders', handleListOrders),
  route('POST', '/me/orders', handleAttachOrder),
  route('GET', '/me/orders/:id', handleShowOrder),
];

const MUTATING = new Set(['POST', 'PATCH', 'DELETE']);

function matchSegments(pattern: string[], actual: string[]): Record<string, string> | null {
  if (pattern.length !== actual.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < pattern.length; i += 1) {
    const expected = pattern[i] ?? '';
    const received = actual[i] ?? '';
    if (expected.startsWith(':')) {
      if (!received) return null;
      params[expected.slice(1)] = decodeURIComponent(received);
      continue;
    }
    if (expected !== received) return null;
  }
  return params;
}

/**
 * The mountable handler. Anything that is not one of the routes above is
 * forwarded untouched, which is what keeps the legacy catalog endpoints and the
 * SPA fallback behaving exactly as before.
 */
export const apiMiddleware: (req: IncomingMessage, res: ServerResponse, next: NextLike) => void = (
  req,
  res,
  next,
) => {
  const raw = req.url ?? '/';
  const [pathname = '/'] = raw.split('?');
  if (!pathname.startsWith(`${API_PREFIX}/`)) {
    next();
    return;
  }
  const rest = pathname.slice(API_PREFIX.length);
  const segments = rest.split('/').filter(Boolean);

  let pathMatched = false;
  for (const candidate of ROUTES) {
    const params = matchSegments(candidate.segments, segments);
    if (!params) continue;
    pathMatched = true;
    if (candidate.method !== req.method) continue;

    const method = req.method ?? 'GET';
    void (async () => {
      try {
        let body: Record<string, unknown> = {};
        if (MUTATING.has(method)) {
          const guarded = await guardMutation(req, res);
          if (guarded === null) return;
          body = guarded;
        }
        await candidate.handler({ req, res, params, body });
      } catch (error) {
        // The store and the hash are the only failure sources worth hiding;
        // the message is logged without any part of the request body.
        process.stderr.write(`[api] ${method} ${pathname} failed: ${(error as Error).message}\n`);
        if (!res.headersSent) {
          noStore(res);
          sendError(res, 500, 'server_error', AUTH_HY.ERR_UNKNOWN);
        }
      }
    })();
    return;
  }

  if (pathMatched) {
    noStore(res);
    sendError(res, 405, CODE.methodNotAllowed, AUTH_HY.ERR_INVALID_REQUEST);
    return;
  }
  next();
};
