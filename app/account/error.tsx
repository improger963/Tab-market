/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

/**
 * Route-level error boundary for `/account`.
 *
 * The caught `error` object is deliberately NOT rendered: a message thrown deep
 * in a request or a serializer can carry a table name, a token fragment or part
 * of an address, and any of that would be printed on a screen the customer might
 * be shown over their shoulder. The customer sees the one localized sentence the
 * whole account uses, plus a real retry. `error` stays in the signature because
 * Next passes it.
 */
import React from 'react';
import { AccountPanelError } from '@/components/account/AccountFeedback';
import { AUTH_HY } from '@/lib/copy/authHy';

export default function AccountError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Kept for the debugger only; nothing here reaches the page.
  void error;
  return (
    <div className="container-lux py-8 sm:py-12">
      <div className="mx-auto max-w-xl">
        <AccountPanelError message={AUTH_HY.ACCOUNT_LOAD_ERROR} onRetry={() => reset()} />
      </div>
    </div>
  );
}
