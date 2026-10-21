/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // Mirror tsconfig paths so tests import the same modules as the app.
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
      // Node tests act as the server runtime; neutralize the client-import guard.
      'server-only': fileURLToPath(new URL('tests/helpers/server-only-stub.ts', import.meta.url)),
    },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
