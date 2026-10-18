/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * DEVELOPMENT WIRING.
 *
 * Vite's dev server is already an HTTP server, so the mock account API is
 * mounted into its connect stack instead of starting a second process: `npm run
 * dev` stays a single command on the same port 3000, no new dependency and no
 * proxy to keep in sync.
 *
 * `configureServer` runs before Vite installs its own middlewares, which is what
 * gives the API precedence: without it, `/api/v1/...` would fall through to the
 * SPA's `index.html` — the exact behaviour `services/api.ts` documents today.
 * The document injector is registered the same way, so the session snapshot is
 * inlined into the HTML before the app bundle executes.
 */
import type { Plugin, ViteDevServer } from 'vite';
import process from 'node:process';
import { apiMiddleware } from './api.ts';
import { createSnapshotInjector, snapshotForRequest } from './session.ts';
import { DEV_DEMO_PASSWORD, DEV_DEMO_PHONE, seedDemoUserIfNeeded } from './store.ts';

export function tabMarketAuthServer(): Plugin {
  return {
    // Runs ahead of Vite's internal middlewares on purpose (see above).
    name: 'tab-market:auth-api',
    async configureServer(server: ViteDevServer) {
      const isProduction = process.env.NODE_ENV === 'production';
      // Awaited on purpose: Vite delays its own middleware installation while
      // this settles, so the very first request can never race the seed.
      const seeded = await seedDemoUserIfNeeded(isProduction);
      if (seeded && !isProduction) {
        // Printed once, to the terminal only: the credentials stay out of the
        // browser and out of every bundle.
        process.stdout.write(
          `[auth] dev demo account ready: ${DEV_DEMO_PHONE} / ${DEV_DEMO_PASSWORD}\n`,
        );
      }
      server.middlewares.use(apiMiddleware);
      server.middlewares.use(createSnapshotInjector(snapshotForRequest));
    },
  };
}
