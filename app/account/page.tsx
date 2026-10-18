/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

/**
 * `/account` — the account landing screen, which is the order history.
 *
 * The page itself is a thin declaration: the shell owns the session guard, the
 * section navigation and the panel, exactly like every other route in this
 * app (`app/checkout/page.tsx` over `CheckoutForm`, and so on).
 */
import AccountShell from '@/components/account/AccountShell';

export default function AccountPage() {
  return <AccountShell section="orders" />;
}
