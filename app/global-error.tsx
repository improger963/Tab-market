/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

/**
 * Last-resort boundary: it replaces the entire document (own <html>/<body>),
 * so it must not depend on anything that can itself fail to load — no Tailwind,
 * no layout, no images. Plain inline styles carry the brand palette values from
 * app/globals.css, and the message is the same verified generic sentence as the
 * root error boundary. The caught error is never rendered.
 */
import React from 'react';
import { AUTH_HY } from '@/lib/copy/authHy';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Kept for the debugger only; nothing here reaches the page.
  void error;
  return (
    <html lang="hy">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
          color: '#0f172a',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
        }}
      >
        <main style={{ textAlign: 'center', maxWidth: 480, padding: 40 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px', lineHeight: 1.6 }}>
            {AUTH_HY.ERR_UNKNOWN}
          </h1>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              minHeight: 48,
              padding: '12px 32px',
              borderRadius: 10,
              border: 'none',
              background: '#0f172a',
              color: '#ffffff',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {AUTH_HY.RETRY}
          </button>
        </main>
      </body>
    </html>
  );
}
