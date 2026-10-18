/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

/**
 * THE ACCOUNT LAYER ON TOP OF CHECKOUT — three small controls, no new checkout
 * logic.
 *
 * Everything here is additive and never blocking: a guest sees one optional line
 * inviting them to sign in, and a signed-in customer sees a picker for their
 * saved addresses plus an opt-in "save this address" checkbox. The fields the
 * controls write into are the delivery fields that already existed, so the
 * submit path, the validation and the success screen are unchanged.
 *
 * None of these controls mutate the profile. Choosing an address only fills the
 * form; the customer can edit what was filled, and those edits stay in the order.
 */
import React from 'react';
import { CircleUser, MapPin } from 'lucide-react';
import type { UserAddress } from '@/types/api';
import { AUTH_HY } from '@/lib/copy/authHy';
import { addressPickerLabel } from '@/lib/address';
import { cn } from '@/lib/utils';

/** Non-blocking: it never interrupts typing and never gates the pay button. */
export function CheckoutGuestHint({ onSignIn }: { onSignIn: () => void }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
      <CircleUser className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
      <span>{AUTH_HY.CHECKOUT_GUEST_HINT}</span>
      <button
        type="button"
        onClick={onSignIn}
        className="min-h-[44px] inline-flex items-center rounded-control px-2 text-xs font-bold text-accent underline-offset-4 transition-colors duration-hover hover:text-accent-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {AUTH_HY.LOGIN_TAB}
      </button>
    </p>
  );
}

/**
 * Native `<select>` on purpose: it is the one control every customer already
 * knows, it needs no focus trap, and a screen reader announces the whole list.
 * Picking an entry fills the two delivery fields; «other address» leaves whatever
 * is typed alone, so a customer can never lose their text by accident.
 */
export function SavedAddressPicker({
  addresses,
  value,
  onSelect,
  loading = false,
}: {
  addresses: UserAddress[];
  value: string | null;
  onSelect: (id: string | null) => void;
  /** The account read has not settled yet: hold the exact height of the select. */
  loading?: boolean;
}) {
  if (!loading && addresses.length === 0) return null;

  return (
    <div>
      <label
        htmlFor="checkout-saved-address"
        className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-body"
      >
        <MapPin className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
        <span>{AUTH_HY.CHOOSE_ADDRESS}</span>
      </label>
      <select
        id="checkout-saved-address"
        name="savedAddress"
        value={value ?? ''}
        disabled={loading}
        aria-hidden={loading || undefined}
        tabIndex={loading ? -1 : undefined}
        onChange={(event) => onSelect(event.target.value || null)}
        className="h-12 w-full rounded-control border border-line bg-white px-3.5 text-base font-medium text-ink transition-colors duration-hover focus:border-accent focus:ring-2 focus:ring-accent/20 focus-visible:outline-none md:text-xs"
      >
        {/* The loading placeholder keeps the exact geometry of the real list, so
            the fields under it never jump when the account read settles. */}
        {loading ? (
          <option>{AUTH_HY.LOADING}</option>
        ) : (
          <>
            <option value="">{AUTH_HY.OTHER_ADDRESS}</option>
            {addresses.map((address) => (
              <option key={address.id} value={address.id}>
                {addressPickerLabel(address)}
                {address.isDefault ? ` · ${AUTH_HY.DEFAULT_ADDRESS}` : ''}
              </option>
            ))}
          </>
        )}
      </select>
    </div>
  );
}

/**
 * Opt-in saving. The note under it is `aria-live` because the save happens after
 * the customer has already pressed pay: a failure must be announced, but it never
 * cancels the order.
 */
export function SaveAddressToggle({
  checked,
  onChange,
  note,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  note: string | null;
}) {
  return (
    <div>
      <label
        className={cn(
          'flex min-h-[44px] cursor-pointer items-start gap-2.5 text-xs font-semibold text-body',
          'hover:text-ink'
        )}
      >
        <input
          type="checkbox"
          name="saveAddressForNextTime"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
        <span>{AUTH_HY.SAVE_ADDRESS_CHECKBOX}</span>
      </label>
      <p aria-live="polite" className="empty:hidden pt-1 text-xs leading-relaxed text-danger">
        {note ?? ''}
      </p>
    </div>
  );
}
