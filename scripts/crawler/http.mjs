/**
 * HTTP client with caching, rate limiting, retries, and politeness.
 * Uses only Node built-ins (fetch, crypto, fs).
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const UA = 'TabCatalogMigration/1.0 (owner-operated migration; contact: owner@tab.am)';
const CACHE_DIR = join(process.cwd(), '.cache', 'crawl');
const STATE_FILE = join(CACHE_DIR, 'state.json');

/** Ensure cache dir exists. */
function initCache() {
  mkdirSync(CACHE_DIR, { recursive: true });
}

/** Cache key from URL. */
function cacheKey(url) {
  return createHash('sha1').update(url).digest('hex');
}

/** Return cached HTML if fresh (< 24h), else null. */
function readCache(url, maxAgeMs = 24 * 3600_000) {
  const key = cacheKey(url);
  const path = join(CACHE_DIR, key + '.html');
  if (!existsSync(path)) return null;
  try {
    const stat = statSync(path);
    if (Date.now() - stat.mtimeMs > maxAgeMs) return null;
    return readFileSync(path, 'utf8');
  } catch { return null; }
}

/** Write raw HTML to cache. */
function writeCache(url, html) {
  initCache();
  const key = cacheKey(url);
  writeFileSync(join(CACHE_DIR, key + '.html'), html, 'utf8');
}

/**
 * Rate-limiter: ensures minimum delay between requests per host.
 * With jitter to avoid synchronized bursts.
 */
class RateLimiter {
  constructor(minDelayMs = 400) {
    this.minDelay = minDelayMs;
    this.lastAt = 0;
  }
  async acquire() {
    const now = Date.now();
    const wait = Math.max(0, this.lastAt + this.minDelay - now);
    if (wait > 0) await new Promise(r => setTimeout(r, wait + Math.random() * 100));
    this.lastAt = Date.now();
  }
}

/** Sleep helper. */
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/**
 * Fetch a URL with politeness, caching, retries, and exponential backoff.
 * @param {string} url
 * @param {object} opts
 * @param {boolean} opts.noCache - bypass cache read
 * @param {boolean} opts.refresh - bypass cache and overwrite
 * @param {RateLimiter} opts.limiter
 * @param {number} opts.maxRetries - default 4
 * @param {number} opts.timeout - ms, default 20000
 * @returns {Promise<{status:number, html:string, fromCache:boolean}>}
 */
export async function fetchHtml(url, opts = {}) {
  const { noCache = false, refresh = false, limiter, maxRetries = 4, timeout = 20000 } = opts;

  // Check cache unless refresh/noCache
  if (!refresh && !noCache) {
    const cached = readCache(url);
    if (cached !== null) return { status: 200, html: cached, fromCache: true };
  }

  if (limiter) await limiter.acquire();

  let lastErr;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      const backoff = Math.min(1000 * 2 ** (attempt - 1), 16000) + Math.random() * 500;
      await sleep(backoff);
      if (limiter) await limiter.acquire();
    }
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(timeout),
        headers: { 'User-Agent': UA, 'Accept-Language': 'hy, en;q=0.5', 'Accept': 'text/html' },
        redirect: 'follow',
      });
      const html = await res.text();

      // Handle 429 with Retry-After
      if (res.status === 429) {
        const ra = parseInt(res.headers.get('retry-after') || '10', 10);
        await sleep(Math.min(ra * 1000, 30000));
        continue;
      }
      if (res.status >= 500) { lastErr = new Error(`HTTP ${res.status}`); continue; }
      if (!res.ok && res.status !== 404) { lastErr = new Error(`HTTP ${res.status}`); continue; }

      // Write to cache (even 404 pages get cached so we don't re-hit them)
      writeCache(url, html);
      return { status: res.status, html, fromCache: false };
    } catch (e) {
      lastErr = e;
      if (e.name === 'TimeoutError' || e.name === 'AbortError') continue;
      // network error — retry
    }
  }
  throw lastErr || new Error(`Failed to fetch ${url} after ${maxRetries + 1} attempts`);
}

/** Check robots.txt and return { disallowed: boolean, ignoreFlag: boolean }. */
export async function checkRobots(baseOrigin, limiter) {
  try {
    const { html } = await fetchHtml(baseOrigin + '/robots.txt', { limiter });
    const lines = html.split('\n').map(l => l.trim());
    let agent = false;
    for (const line of lines) {
      if (/^user-agent:\s*\*/i.test(line)) { agent = true; continue; }
      if (agent && /^disallow:\s*$/i.test(line)) return { disallowed: false };
      if (agent && /^disallow:\s*\//i.test(line)) {
        // disallow everything
        return { disallowed: true };
      }
    }
    return { disallowed: false };
  } catch {
    return { disallowed: false };
  }
}

// ──────────────────────────── Checkpoint State ────────────────────────────

export function loadState() {
  try { return JSON.parse(readFileSync(STATE_FILE, 'utf8')); }
  catch { return { doneCategories: [], doneProducts: {}, urlQueue: [] }; }
}

export function saveState(state) {
  initCache();
  writeFileSync(STATE_FILE, JSON.stringify(state), 'utf8');
}

export { initCache, cacheKey, readCache, writeCache, RateLimiter, STATE_FILE, CACHE_DIR };
