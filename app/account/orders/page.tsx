/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

/** `/account/orders` — order history. See `components/account/AccountShell.tsx`. */
import AccountShell from '@/components/account/AccountShell';

export default function AccountOrdersPage() {
  return <AccountShell section="orders" />;
}
