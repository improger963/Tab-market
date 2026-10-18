/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

/**
 * CHECKOUT-SIDE ACCOUNT READ — optional by construction.
 *
 * A guest pays exactly as before: no request is issued, and this hook only ever
 * reports `authed: false`. For a signed-in customer it reads `GET /me` and
 * `GET /me/addresses` once and keeps the results in local component state — not
 * in a store and never in `localStorage`/`sessionStorage`, because a full phone
 * number and a home address are precisely the data that must not outlive the
 * page. The account store keeps its masked snapshot only.
 *
 * Nothing here writes back: the delivery fields are prefilled FROM this data, and
 * editing them afterwards never touches the profile. Saving an address is a
 * separate, explicit action the customer opts into.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getMe, listAddresses } from '@/services/api';
import type { User, UserAddress } from '@/types/api';
import { sortAddresses } from '@/lib/address';
import { useAuth } from '@/store/useAuth';

/** Picker value for «Այլ հասցե»: type it yourself. */
export const CUSTOM_ADDRESS = null;

export interface CheckoutAccountState {
  /** Session snapshot present — the only condition that fetches anything. */
  authed: boolean;
  /** Settled: the account read either succeeded or failed. */
  loaded: boolean;
  /** Full profile, kept in memory for this page only. */
  me: User | null;
  addresses: UserAddress[];
  defaultAddress: UserAddress | null;
  /** `null` means the customer is typing their own address. */
  selectedAddressId: string | null;
  selectAddress: (id: string | null) => void;
  saveAddress: boolean;
  setSaveAddress: (value: boolean) => void;
  /** Inline note after an optional save; never blocks the order. */
  saveNote: string | null;
  setSaveNote: (message: string | null) => void;
}

export function useCheckoutAccount(): CheckoutAccountState {
  const hydrated = useAuth((state) => state.hydrated);
  const snapshot = useAuth((state) => state.user);
  const authed = hydrated && snapshot !== null;

  const [me, setMe] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(CUSTOM_ADDRESS);
  const [saveAddress, setSaveAddress] = useState(false);
  const [saveNote, setSaveNote] = useState<string | null>(null);

  // Once per page: a refetch on every render would re-read the cookie for no
  // reason, and a late response would overwrite what the customer is typing.
  const requestedRef = useRef(false);

  useEffect(() => {
    if (!authed || requestedRef.current) return;
    requestedRef.current = true;
    let active = true;

    // A dead cookie, a 501 or a slow network must never stand between a customer
    // and the pay button: the failure path simply leaves the form as a guest's.
    Promise.all([getMe(), listAddresses()])
      .then(([profile, list]) => {
        if (!active) return;
        const sorted = sortAddresses(list);
        const preferred = sorted.find((row) => row.isDefault) ?? null;
        setMe(profile);
        setAddresses(sorted);
        setSelectedAddressId(preferred ? preferred.id : CUSTOM_ADDRESS);
        setLoaded(true);
      })
      .catch(() => {
        // No PII is logged; the form just stays empty and fully usable.
        if (active) {
          setMe(null);
          setLoaded(true);
        }
      });

    return () => {
      active = false;
    };
  }, [authed]);

  const defaultAddress = useMemo(
    () => addresses.find((row) => row.isDefault) ?? null,
    [addresses]
  );

  const selectAddress = useCallback((id: string | null) => {
    setSelectedAddressId(id);
    setSaveNote(null);
  }, []);

  return {
    authed,
    loaded,
    me,
    addresses,
    defaultAddress,
    selectedAddressId,
    selectAddress,
    saveAddress,
    setSaveAddress,
    saveNote,
    setSaveNote,
  };
}
