/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * REQUEST-LEVEL SECURITY FOR THE MOCK ACCOUNT API.
 *
 * Four responsibilities, each mapping onto what Laravel (with Sanctum) does in
 * production, so the swap is a change of host and not of contract:
 *  1. a fixed-window login/register throttle keyed per IP + phone;
 *  2. a same-origin check standing in for Sanctum's CSRF middleware;
 *  3. `Cache-Control: no-store` on anything describing the signed-in customer;
 *  4. the `{ data, meta?, error? }` envelope every endpoint answers with.
 *
 * Everything here is typed against `node:http` rather than a framework on
 * purpose: the same handler has to run inside Vite's connect stack in
 * development and inside a standalone server in production, and the lowest
 * common denominator of the two is the plain request/response pair.
 *
 * Messages come from `lib/copy/authHy` — the backend owns the copy the customer
 * reads, so validation and wording cannot drift apart.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { Buffer } from 'node:buffer';
import type { ApiErrorEnvelope, ApiMeta } from '../types/api.ts';
import { AUTH_HY } from '../lib/copy/authHy.ts';

// --- Transport -------------------------------------------------------------

export function writeJson(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Length', String(Buffer.byteLength(payload)));
  res.end(payload);
}

// --- Envelope --------------------------------------------------------------

/** Success body. `success` mirrors the pre-existing catalog endpoints. */
export function sendOk(res: ServerResponse, data: unknown, meta?: ApiMeta): void {
  writeJson(res, 200, { success: true, data, ...(meta ? { meta } : {}) });
}

export function sendCreated(res: ServerResponse, data: unknown): void {
  writeJson(res, 201, { success: true, data });
}

/**
 * Failure body. `code` is stable and machine-readable (every one of them is
 * listed in the deliverable for the Laravel developer); only `message` is
 * localized, and only from the approved copy table — nothing derived from user
 * input is ever echoed back.
 */
export function sendError(
  res: ServerResponse,
  status: number,
  code: string,
  message: string,
  fields?: Record<string, string>,
): void {
  const error: ApiErrorEnvelope = { code, message, ...(fields ? { fields } : {}) };
  writeJson(res, status, { success: false, data: null, error });
}

/**
 * Per-user payloads are never cacheable: a shared showroom computer must not be
 * able to read someone's order list out of a browser or proxy cache.
 */
export function noStore(res: ServerResponse): void {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
}

// --- Origin / transport identification -------------------------------------

/**
 * Proxy chains aside, the socket address is the only IP worth throttling on:
 * a `X-Forwarded-For` that is trusted blindly turns the throttle into a
 * per-header free pass. Production (nginx) sets the real remote address, and
 * Laravel's `throttle:` middleware does the same job there.
 */
export function requestIp(req: IncomingMessage): string {
  const socket = req.socket as { remoteAddress?: string; encrypted?: boolean } | undefined;
  return socket?.remoteAddress ?? 'unknown';
}

export function isHttps(req: IncomingMessage): boolean {
  const forwarded = req.headers['x-forwarded-proto'];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (typeof first === 'string' && first.split(',')[0].trim() === 'https') return true;
  const socket = req.socket as { encrypted?: boolean } | undefined;
  return socket?.encrypted === true;
}

/**
 * Sanctum's stateful sessions rely on the cookie being attached automatically,
 * so mutating requests must come from our own origin. `Origin` is present on
 * every cross-origin `fetch`, and `Sec-Fetch-Site` is the modern explicit
 * signal; a request carrying neither is a same-origin navigation, which is what
 * our own forms are.
 */
export function isSameOriginRequest(req: IncomingMessage): boolean {
  const fetchedSite = req.headers['sec-fetch-site'];
  if (typeof fetchedSite === 'string' && fetchedSite !== 'same-origin' && fetchedSite !== 'none') {
    return false;
  }

  const origin = req.headers.origin;
  if (origin === undefined) return true;
  // A present-but-empty or `null` origin is a sandboxed or opaque context,
  // which is never our own site.
  if (origin === '' || origin === 'null') return false;

  const host = req.headers.host;
  if (!host) return false;
  const protocol = isHttps(req) ? 'https' : 'http';

  let expected: URL;
  let actual: URL;
  try {
    expected = new URL(`${protocol}://${host}`);
    actual = new URL(origin);
  } catch {
    return false;
  }
  if (actual.origin === expected.origin) return true;
  // Development only: the shop is opened through another loopback port (LAN
  // tunnel, container mapping) and the API would be dead without this.
  const loopback = (hostname: string) =>
    hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
  return loopback(actual.hostname) && loopback(expected.hostname);
}

/** Body size is capped by the reader; the type is checked before it is trusted. */
export function hasJsonBody(req: IncomingMessage): boolean {
  const value = req.headers['content-type'] ?? '';
  return value.split(';')[0].trim().toLowerCase() === 'application/json';
}

// --- Throttle --------------------------------------------------------------

/** Five attempts per phone per IP, then a ten-minute lockout. */
export const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
export const ATTEMPT_MAX = 5;

interface AttemptBucket {
  count: number;
  /** End of the window; the counter never decays mid-window. */
  expiresAt: number;
}

const buckets = new Map<string, AttemptBucket>();

/**
 * Keeps a long-lived dev process from accumulating one bucket per phone number
 * forever. Cheap, and only runs once the table has grown noticeably.
 */
function pruneExpired(now: number): void {
  if (buckets.size < 512) return;
  for (const [key, bucket] of buckets) {
    if (bucket.expiresAt <= now) buckets.delete(key);
  }
}

export type AttemptDecision =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterSeconds: number };

export function consumeAttempt(ip: string, phone: string): AttemptDecision {
  const now = Date.now();
  pruneExpired(now);
  const key = `${ip}|${phone}`;
  const bucket = buckets.get(key);

  if (!bucket || bucket.expiresAt <= now) {
    buckets.set(key, { count: 1, expiresAt: now + ATTEMPT_WINDOW_MS });
    return { allowed: true, remaining: ATTEMPT_MAX - 1 };
  }
  if (bucket.count >= ATTEMPT_MAX) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.expiresAt - now) / 1000) };
  }
  bucket.count += 1;
  return { allowed: true, remaining: ATTEMPT_MAX - bucket.count };
}

/** Credentials verified: the window for that pair no longer matters. */
export function resetAttempts(ip: string, phone: string): void {
  buckets.delete(`${ip}|${phone}`);
}

/**
 * Emits the 429. `Retry-After` is set for the swap (and for curl), while the
 * customer only sees the friendly, time-bounded sentence.
 */
export function sendRateLimited(res: ServerResponse, retryAfterSeconds: number): void {
  noStore(res);
  res.setHeader('Retry-After', String(retryAfterSeconds));
  sendError(
    res,
    429,
    'rate_limited',
    AUTH_HY.ERR_RATE_LIMIT.replace('{seconds}', String(retryAfterSeconds)),
  );
}
