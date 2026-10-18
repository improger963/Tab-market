/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * SESSION CONTRACT — the rules both sides of the wire agree on.
 *
 * Kept free of Node and DOM APIs on purpose: the mock API server imports it to
 * mint and read the cookie, and the browser imports it to read the one
 * server-injected snapshot and to validate a `?next=` target. When the Laravel
 * (Sanctum) backend replaces the mock, this file is the checklist the swap has
 * to keep satisfying — the cookie name is the only thing that must match.
 *
 * The session token is a random opaque id that means nothing outside the
 * server's own store. It is `HttpOnly`, so no script — including this one — can
 * ever read it back. The browser learns "who is logged in" only from the
 * minimal snapshot the server chooses to inline into the document.
 */
import type { SessionSnapshot } from '@/types/api';

/** Same name Laravel Sanctum will be configured with, so the swap is silent. */
export const SESSION_COOKIE_NAME = 'tab_market_session';

/** Sliding window: every authenticated request pushes the expiry out. */
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** Name of the server-inlined, non-sensitive boot snapshot. */
export const SESSION_SNAPSHOT_GLOBAL = '__TABA_SESSION__';

/**
 * The only path prefix that requires a session. Guests keep every other route,
 * including `/checkout`.
 */
export const PROTECTED_PATH_PREFIX = '/account';

export function isProtectedPath(pathname: string): boolean {
  return pathname === PROTECTED_PATH_PREFIX || pathname.startsWith(`${PROTECTED_PATH_PREFIX}/`);
}

export interface SessionCookieOptions {
  secure: boolean;
  maxAgeSeconds: number;
}

/**
 * `Secure` cannot be unconditional: browsers refuse a `Secure` cookie over
 * plain http, and the shop is developed over http://localhost. It is therefore
 * derived from the request, and a production build behind TLS always gets it —
 * which is the state that actually matters.
 */
export function shouldMarkCookieSecure(isProduction: boolean, proto: string): boolean {
  return isProduction || proto === 'https';
}

export function serializeSessionCookie(
  token: string,
  { secure, maxAgeSeconds }: SessionCookieOptions,
): string {
  const parts = [
    `${SESSION_COOKIE_NAME}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.floor(maxAgeSeconds)}`,
    `Expires=${new Date(Date.now() + maxAgeSeconds * 1000).toUTCString()}`,
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

export function serializeClearedSessionCookie(secure: boolean): string {
  const parts = [`${SESSION_COOKIE_NAME}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0', 'Expires=Thu, 01 Jan 1970 00:00:00 GMT'];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

/** Pulls the opaque session id out of a raw `Cookie` header. */
export function readSessionTokenFromCookieHeader(
  cookieHeader: string | undefined,
): string | null {
  if (!cookieHeader) return null;
  for (const pair of cookieHeader.split(';')) {
    const eq = pair.indexOf('=');
    if (eq === -1) continue;
    const name = pair.slice(0, eq).trim();
    if (name !== SESSION_COOKIE_NAME) continue;
    const value = pair.slice(eq + 1).trim();
    // Session ids are hex; anything else is a forged or truncated cookie.
    return /^[0-9a-f]{32,128}$/.test(value) ? value : null;
  }
  return null;
}

/**
 * Open-redirect guard for `?next=`. Only a same-origin absolute path is
 * accepted: `//evil.com` (protocol-relative), `https://evil.com`, `\evil.com`
 * and anything else that is not a single-slash relative path are rejected, and
 * the caller falls back to `/`.
 */
export function sanitizeNextPath(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value || value.length > 500) return null;
  if (!value.startsWith('/')) return null;
  if (value.startsWith('//')) return null;
  if (value.startsWith('/?')) return null; // never bounce back into the auth flow
  if (value.includes('\\')) return null;
  if (/[\r\n\u0000-\u001f\u007f]/.test(value)) return null;
  // Reject an embedded scheme (`/x?redirect=https://…` stays allowed, but a
  // path that itself looks absolute never is).
  if (/^\/[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value)) return null;
  try {
    const url = new URL(value, 'https://tab.am');
    if (url.origin !== 'https://tab.am') return null;
    if (url.username || url.password) return null;
  } catch {
    return null;
  }
  return value;
}

/** Builds `/?auth=login&next=…`, the entry point the middleware-style guard uses. */
export function authEntryPath(mode: 'login' | 'register', next: string | null): string {
  const params = new URLSearchParams({ auth: mode });
  const safeNext = sanitizeNextPath(next);
  if (safeNext) params.set('next', safeNext);
  return `/?${params.toString()}`;
}

function isSnapshot(value: unknown): value is SessionSnapshot {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    /^[A-Za-z0-9_-]{1,64}$/.test(v.id) &&
    typeof v.fullName === 'string' &&
    v.fullName.length > 0 &&
    v.fullName.length <= 100 &&
    typeof v.maskedPhone === 'string' &&
    v.maskedPhone.length <= 32
  );
}

/**
 * Reads the boot snapshot the server inlined, if any. Strictly validated, and
 * it deliberately contains no phone, no email and no token: the full profile is
 * always fetched from `GET /me` through the cookie-authenticated API.
 */
export function readInjectedSnapshot(): SessionSnapshot | null {
  if (typeof window === 'undefined') return null;
  const raw = (window as unknown as Record<string, unknown>)[SESSION_SNAPSHOT_GLOBAL];
  return isSnapshot(raw) ? raw : null;
}
