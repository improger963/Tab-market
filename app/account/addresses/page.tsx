/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

/** `/account/addresses` — saved delivery addresses. See `AddressesPanel.tsx`. */
import AccountShell from '@/components/account/AccountShell';

export default function AccountAddressesPage() {
  return <AccountShell section="addresses" />;
}
