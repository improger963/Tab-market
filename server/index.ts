/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * PRODUCTION SERVER for the built SPA plus the mock account API.
 *
 * Why this file exists: the shop is a Vite SPA, so `vite preview` would serve
 * `dist/` with no API at all and every account endpoint would fall back to
 * `index.html`. This is the smallest honest stand-in for the deployment the
 * Laravel backend will eventually provide — static shell, one same-origin API,
 * one cookie — and it is what makes the "production mode" verification in the
 * brief actually runnable:
 *
 *   npm run build
 *   npx tsx server/index.ts --prod
 *
 * `--prod` is set here rather than in an npm script so no `cross-env`-style
 * dependency is added, and it is applied before any handler reads the flag.
 */
import express from 'express';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { apiMiddleware } from './api';
import { createSnapshotInjector, snapshotForRequest } from './session';
import { seedDemoUserIfNeeded } from './store';

// `vite/client` declares `process.env.NODE_ENV` as read-only, so the flag is
// written through a widened view of the environment. Readers stay on plain
// `process.env.NODE_ENV`, which is the name the Laravel swap will use too.
if (process.argv.includes('--prod')) {
  (process.env as Record<string, string | undefined>)['NODE_ENV'] = 'production';
}

const isProduction = process.env.NODE_ENV === 'production';
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT ?? 3000);

async function main(): Promise<void> {
  // In production the seed refuses to run, so the demo account does not exist
  // even in the store file unless a developer created it earlier by hand.
  await seedDemoUserIfNeeded(isProduction);

  const app = express();
  app.disable('x-powered-by');

  // API first, then the snapshot injector, then the files: that order is what
  // gives `/api/v1/*` precedence and lets the shell carry the session.
  app.use(apiMiddleware);
  app.use(createSnapshotInjector(snapshotForRequest));
  app.use(express.static(DIST, { index: false, maxAge: '1h' }));

  // Client-side routes are owned by the SPA (src/App.tsx), so every other GET
  // is the shell. hashed assets never reach here.
  app.get('*', (_req, res) => {
    res.sendFile('index.html', { root: DIST });
  });

  app.listen(PORT, '0.0.0.0', () => {
    process.stdout.write(
      `[server] ${isProduction ? 'production' : 'development'} on http://localhost:${PORT} (dist: ${DIST})\n`,
    );
  });
}

void main().catch((error: unknown) => {
  process.stderr.write(
    `[server] failed to start: ${(error as Error).message}\n` +
      `         run "npm run build" first — this entry serves dist/ only.\n`,
  );
  process.exit(1);
});
