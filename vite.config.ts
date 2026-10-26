import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { tabMarketAuthServer } from './server/dev.ts';

export default defineConfig(() => {
  return {
    // `tabMarketAuthServer` mounts the mock customer-account API (/api/v1/auth,
    // /api/v1/me/*) into this dev server and inlines the server-side session
    // snapshot into the served document. See server/dev.ts.
    plugins: [tabMarketAuthServer(), react(), tailwindcss()],
    build: {
      // Route views are lazy-split (see src/App.tsx) so application code no
      // longer inflates the entry chunk. The remaining index chunk floor is the
      // eagerly-imported catalog dataset (data/products.json: 1,647 SKUs,
      // ~2.2 MB) that every catalog-first page needs at first paint, plus the
      // framework runtime. This is data, not lazy-loadable JS logic, so the
      // default 500 kB heuristic threshold does not apply. Transfer size over
      // the wire is ~321 kB gzipped.
      chunkSizeWarningLimit: 3000,
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
        'next/link': path.resolve(import.meta.dirname, './lib/next-compat/link.tsx'),
        'next/font/google': path.resolve(import.meta.dirname, './lib/next-compat/font.ts'),
        'next/navigation': path.resolve(import.meta.dirname, './lib/next-compat/navigation.ts'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
