/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * ADDRESS SHAPERS — the only place a stored `UserAddress` is turned into the
 * lines a customer reads, and back into a payload.
 *
 * The account cards, the address form and the checkout prefill have to agree
 * letter for letter: an address that reads one way under `/account/addresses`
 * must land in the checkout fields exactly that way, otherwise editing it at
 * checkout means editing a different string than the one on file.
 *
 * Every word comes from the validated copy module, so no Armenian literal is
 * typed here.
 */
import type { AddressInput, UserAddress } from '@/types/api';
import { AUTH_HY } from '@/lib/copy/authHy';

/** Default address first; the rest keep the order the server returned. */
export function sortAddresses(list: UserAddress[]): UserAddress[] {
  return [...list].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
}

/** The shop delivers free inside Yerevan only; everything else is regional. */
export function isYerevanCity(city: string): boolean {
  return city.trim().toLowerCase() === AUTH_HY.CITY_YEREVAN.toLowerCase();
}

/** `Երևան` (or `Կենտրոն · Երևան`); the duplicate Yerevan case collapses. */
export function addressAreaLine(address: UserAddress): string {
  const region = address.region.trim();
  const city = address.city.trim();
  return region && region.toLowerCase() !== city.toLowerCase()
    ? `${region} · ${city}`
    : city;
}

/** One readable `street, building` line — the checkout has a single field. */
export function addressStreetLine(address: UserAddress): string {
  const street = address.street.trim();
  const building = address.building.trim();
  return building ? `${street}, ${building}` : street;
}

/** Entrance / floor / apartment / intercom — only the lines that exist. */
export function addressDetailLine(address: UserAddress): string | null {
  const parts = [
    address.entrance ? `${AUTH_HY.FIELD_ENTRANCE} ${address.entrance}` : null,
    address.floor ? `${AUTH_HY.FIELD_FLOOR} ${address.floor}` : null,
    address.apartment ? `${AUTH_HY.FIELD_APARTMENT} ${address.apartment}` : null,
    address.intercom ? `${AUTH_HY.FIELD_INTERCOM} ${address.intercom}` : null,
  ].filter((part): part is string => Boolean(part));
  return parts.length ? parts.join(' · ') : null;
}

/** Option text for the checkout address picker. */
export function addressPickerLabel(address: UserAddress): string {
  const label = address.label?.trim() || AUTH_HY.LABEL_OTHER;
  return `${label} — ${addressStreetLine(address)}`;
}

/** What the two existing checkout delivery fields receive. */
export function addressToCheckoutFields(address: UserAddress): {
  addressStreet: string;
  addressApartment: string;
} {
  return {
    addressStreet: addressStreetLine(address),
    addressApartment: addressDetailLine(address) ?? '',
  };
}

/**
 * True when the two checkout lines still hold this saved address verbatim.
 * Used to skip a pointless "save" of an address that is already on file.
 */
export function addressMatchesCheckoutFields(
  address: UserAddress,
  fields: { addressStreet: string; addressApartment: string }
): boolean {
  return (
    addressStreetLine(address) === fields.addressStreet.trim() &&
    (addressDetailLine(address) ?? '') === fields.addressApartment.trim()
  );
}

/**
 * The reverse trip, used by «save this address for next time».
 *
 * Checkout carries street and building in ONE field, in the order the field's
 * own label and placeholder teach, so the building is whatever follows the last
 * comma. If the customer typed only a street the building stays empty and the
 * shared `validateAddress` (and the server behind it) rejects it with its own
 * localized message — nothing is invented here to make the payload pass, and
 * the order itself is never blocked by an optional save.
 *
 * The free "flat / entrance / floor" line cannot be split back into structured
 * columns without guessing, so it survives verbatim as the address comment: the
 * courier reads the same words the customer typed.
 */
export function checkoutFieldsToAddressInput(
  streetLine: string,
  apartmentLine: string,
): AddressInput {
  const line = streetLine.trim();
  const cut = line.lastIndexOf(',');
  const street = (cut > 0 ? line.slice(0, cut) : line).trim();
  const building = cut > 0 ? line.slice(cut + 1).trim() : '';

  // Yerevan delivery is the only method this block renders, so both lines are
  // the fact of that method rather than a guess.
  const yerevan = AUTH_HY.CITY_YEREVAN;

  return {
    region: yerevan,
    city: yerevan,
    street,
    building,
    isDefault: false,
    ...(apartmentLine.trim() ? { comment: apartmentLine.trim() } : {}),
  };
}
