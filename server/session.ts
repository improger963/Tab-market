/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * SESSION PLUMBING FOR THE MOCK ACCOUNT API.
 *
 * `getSession()` is the server-side answer to "who is calling": it reads the
 * opaque cookie and resolves it against the server-only store. Every protected
 * handler starts here, exactly as a Sanctum-guarded controller starts from
 * `Auth::user()` after `EnsureFrontendRequestsAreStateful`.
 *
 * The rest of the file is the browser's boot path. This project is a
 * client-rendered Vite SPA — there is no server render to pass props through —
 * so the equivalent of "the root layout reads the session and hands a minimal
 * snapshot down" is the server inlining that snapshot into the document it
 * serves, before the app bundle runs. One round trip, one render: the header
 * never shows the logged-out state for a frame, and nothing stale is hydrated.
 * The snapshot carries `id`, `fullName` and a masked phone — never the real
 * phone, never an email, never the token.
 *
 * Typed against `node:http` so the same function serves Vite's connect stack in
 * development and the standalone production server.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { Buffer } from 'node:buffer';
import process from 'node:process';
import type { SessionSnapshot, User } from '../types/api.ts';
import {
  SESSION_SNAPSHOT_GLOBAL,
  SESSION_TTL_MS,
  readSessionTokenFromCookieHeader,
  serializeClearedSessionCookie,
  serializeSessionCookie,
  shouldMarkCookieSecure,
} from '../lib/auth/session.ts';
import { maskPhone } from '../lib/utils.ts';
import { createSession, resolveSession, type StoredUser } from './store.ts';
import { isHttps } from './security.ts';

/** Marks the spot in `index.html` the document injector writes into. */
export const SNAPSHOT_PLACEHOLDER = '<!--TABA_SESSION-->';

export interface SessionContext {
  user: StoredUser;
  token: string;
}

/**
 * Server-side session resolution. `null` means a guest — a normal state, not an
 * error: guests browse, buy and check out.
 */
export function getSession(req: IncomingMessage): SessionContext | null {
  const token = readSessionTokenFromCookieHeader(req.headers.cookie);
  if (!token) return null;
  const resolved = resolveSession(token);
  return resolved ? { user: resolved.user, token } : null;
}

function cookieSecure(req: IncomingMessage): boolean {
  return shouldMarkCookieSecure(
    process.env.NODE_ENV === 'production',
    isHttps(req) ? 'https' : 'http',
  );
}

/** Mints a session and writes the cookie: `HttpOnly; SameSite=Lax; Path=/`. */
export function startSession(req: IncomingMessage, res: ServerResponse, userId: string): string {
  const session = createSession(userId);
  setCookie(res, serializeSessionCookie(session.token, {
    secure: cookieSecure(req),
    maxAgeSeconds: Math.floor(SESSION_TTL_MS / 1000),
  }));
  return session.token;
}

/** Expires the browser copy; the store row is destroyed by the caller. */
export function endSession(req: IncomingMessage, res: ServerResponse): void {
  setCookie(res, serializeClearedSessionCookie(cookieSecure(req)));
}

function setCookie(res: ServerResponse, value: string): void {
  const existing = res.getHeader('Set-Cookie');
  const next = Array.isArray(existing) ? [...existing, value] : existing ? [String(existing), value] : [value];
  res.setHeader('Set-Cookie', next);
}

/** The public projection of a store row: no hash, no session, no internals. */
export function toPublicUser(user: StoredUser): User {
  return {
    id: user.id,
    fullName: user.fullName,
    phone: user.phone,
    ...(user.email ? { email: user.email } : {}),
    createdAt: user.createdAt,
  };
}

export function snapshotOf(user: StoredUser): SessionSnapshot {
  return { id: user.id, fullName: user.fullName, maskedPhone: maskPhone(user.phone) };
}

/**
 * JSON safe inside an inline `<script>`: the classic `<`/`&` escapes plus
 * U+2028/U+2029, which are valid JSON but end a JS string literal in some
 * engines. `fullName` is customer input, so this is not paranoia.
 */
export function renderSnapshotScript(snapshot: SessionSnapshot | null): string {
  const json = JSON.stringify(snapshot)
    .replace(/</g, '\\u003C')
    .replace(/>/g, '\\u003E')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
  return `<script>window.${SESSION_SNAPSHOT_GLOBAL}=${json};</script>`;
}

function injectIntoHtml(html: string, snapshot: SessionSnapshot | null): string {
  const tag = renderSnapshotScript(snapshot);
  if (html.includes(SNAPSHOT_PLACEHOLDER)) return html.replace(SNAPSHOT_PLACEHOLDER, tag);
  // Placeholder missing (hand-edited or cached document): still land the
  // snapshot before the body closes so the app cannot render the wrong header.
  if (html.includes('</body>')) return html.replace('</body>', `${tag}</body>`);
  return `${html}${tag}`;
}

function wantsHtmlDocument(req: IncomingMessage, method: string | undefined): boolean {
  if (method !== 'GET' && method !== 'HEAD') return false;
  // `text/html` only: an `Accept: */*` also covers the script and stylesheet
  // requests of the page itself, and buffering those would be a real memory
  // problem and could corrupt them.
  if (!(req.headers.accept ?? '').includes('text/html')) return false;
  const path = (req.url ?? '/').split('?')[0] ?? '/';
  if (path.startsWith('/api/')) return false;
  // Vite's own dev pipeline assets and any known static resource are never a
  // document (a dotted slug still is one, so the extension list is explicit).
  if (path.startsWith('/@') || path.startsWith('/src/') || path.startsWith('/node_modules/')) return false;
  return !/\.(?:[cm]?js|jsx|tsx?|css|map|json|svg|png|jpe?g|gif|webp|avif|ico|woff2?|ttf|eot|pdf|zip)$/i.test(path);
}

export type NextLike = (error?: unknown) => void;

/**
 * Buffers an HTML document response and inlines the snapshot. Registered ahead
 * of every other handler in dev and production alike, so both modes take the
 * same code path.
 */
export function createSnapshotInjector(
  resolve: (req: IncomingMessage) => SessionSnapshot | null,
): (req: IncomingMessage, res: ServerResponse, next: NextLike) => void {
  return (req, res, next) => {
    if (!wantsHtmlDocument(req, req.method)) {
      next();
      return;
    }

    const chunks: string[] = [];
    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res) as (chunk?: unknown) => ServerResponse;
    // A stream response (production `express.static` pipes the file) cannot be
    // buffered without breaking backpressure; it is detected and passed through.
    let refuse = false;

    const collect = (chunk: unknown, encoding?: unknown): void => {
      if (chunk === undefined || chunk === null) return;
      if (typeof chunk === 'string') {
        chunks.push(encoding ? Buffer.from(chunk, encoding as BufferEncoding).toString('utf8') : chunk);
        return;
      }
      if (Buffer.isBuffer(chunk) || chunk instanceof Uint8Array) {
        chunks.push(Buffer.from(chunk).toString('utf8'));
        return;
      }
      refuse = true;
    };

    res.write = ((chunk?: unknown, encodingOrCb?: unknown, cb?: unknown) => {
      collect(chunk, typeof encodingOrCb === 'string' ? encodingOrCb : undefined);
      if (typeof cb === 'function') (cb as () => void)();
      else if (typeof encodingOrCb === 'function') (encodingOrCb as () => void)();
      return true;
    }) as typeof res.write;

    res.end = ((chunk?: unknown, encodingOrCb?: unknown, cb?: unknown) => {
      const callback =
        typeof encodingOrCb === 'function' ? encodingOrCb : typeof cb === 'function' ? cb : undefined;
      collect(chunk, typeof encodingOrCb === 'string' ? encodingOrCb : undefined);

      res.write = originalWrite;
      res.end = originalEnd as typeof res.end;

      if (refuse || chunks.length === 0) {
        // No body of its own (redirect, 304) or an unbufferable stream: hand
        // back exactly what came in and stay out of the way.
        if (callback) (callback as () => void)();
        originalEnd();
        return res;
      }

      const type = String(res.getHeader('Content-Type') ?? '');
      const html = chunks.join('');
      // Only rewrite genuine HTML — JSON error pages pass through unchanged.
      const isDocument = type === '' || type.includes('text/html');
      const body = isDocument ? injectIntoHtml(html, resolve(req)) : html;

      if (isDocument) {
        // A document carries this visitor's session snapshot, so it must never be
        // stored anywhere: Vite (and `express.static` in production) answer HTML
        // with `no-cache` + an ETag, which means the browser KEEPS the body and
        // revalidates it. Revalidating a document that was cached while the
        // customer was logged out returns a 304 and the stale shell is reused —
        // the header would then read "log in" next to a perfectly valid cookie.
        // `no-store` plus dropping the validators is what makes the inlined
        // snapshot trustworthy, and it also covers `/account/*`.
        res.setHeader('Cache-Control', 'no-store');
        res.removeHeader('ETag');
        res.removeHeader('Last-Modified');
        // Same URL, different answer per session: say so for any cache in front.
        const vary = String(res.getHeader('Vary') ?? '');
        res.setHeader(
          'Vary',
          vary === '' || vary === 'Cookie' ? 'Cookie' : `${vary}, Cookie`
        );
      }

      res.setHeader('Content-Length', String(Buffer.byteLength(body)));
      if (callback) (callback as () => void)();
      originalEnd(body);
      return res;
    }) as typeof res.end;

    next();
  };
}

/** Resolves the snapshot a document response should carry. */
export function snapshotForRequest(req: IncomingMessage): SessionSnapshot | null {
  const context = getSession(req);
  return context ? snapshotOf(context.user) : null;
}
