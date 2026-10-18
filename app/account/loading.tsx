/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

/**
 * Route-level loading state for `/account`: the full route frame (heading, tab
 * strip, panel area), matching the shell's geometry so the real page replaces it
 * in place with no heading, tab or card jump.
 *
 * Under the Next swap this file is picked up automatically. In the current Vite
 * build the equivalent states live inside `AccountShell` and the panels — the
 * frame is already mounted there, so their placeholder covers only the panel.
 */
import { AccountRouteSkeleton } from '@/components/account/AccountSkeleton';

export default function AccountLoading() {
  return <AccountRouteSkeleton />;
}
