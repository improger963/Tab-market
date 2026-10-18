/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * RUNTIME RESPONSE VALIDATION for the customer-account endpoints.
 *
 * TypeScript types describe the contract; they verify nothing at runtime. Before
 * any API payload reaches a component it is narrowed by the guards below, so a
 * malformed or unexpected response degrades to "could not load" instead of
 * rendering `undefined`, and — importantly for privacy — a field that is not
 * part of the documented shape can never travel further into the UI.
 *
 * The rules mirror `lib/auth/schema.ts`: the same limits the server validates,
 * applied in the direction of the response.
 */
import { ORDER_STATUS, type OrderStatus } from '@/types/api';
import type { User, UserAddress, UserOrderItem, UserOrderSummary } from '@/types/api';
import { LIMITS } from './schema';

const STATUSES: string[] = Object.values(ORDER_STATUS);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function text(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > max) return null;
  // Control bytes never belong in a response the UI renders.
  return /[\u0000-\u001f\u007f]/.test(trimmed) ? null : trimmed;
}

function optionalText(value: unknown, max: number): string | undefined | null {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;
  if (trimmed.length > max || /[\u0000-\u001f\u007f]/.test(trimmed)) return null;
  return trimmed;
}

function identifier(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  return /^[A-Za-z0-9_-]{1,64}$/.test(value) ? value : null;
}

/** An E.164 Armenian number, exactly as `toE164` produces it. */
function e164(value: unknown): string | null {
  return typeof value === 'string' && /^\+374\d{8}$/.test(value) ? value : null;
}

function isoDate(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  return Number.isNaN(new Date(value).getTime()) ? null : value;
}

function integer(value: unknown, min: number, max: number): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const rounded = Math.round(value);
  return rounded >= min && rounded <= max ? rounded : null;
}

export function asUser(value: unknown): User | null {
  if (!isRecord(value)) return null;
  const id = identifier(value.id);
  const fullName = text(value.fullName, LIMITS.fullNameMax);
  const phone = e164(value.phone);
  const createdAt = isoDate(value.createdAt);
  const email = optionalText(value.email, LIMITS.emailMax);
  if (!id || !fullName || !phone || !createdAt || email === null) return null;
  return {
    id,
    fullName,
    phone,
    ...(email ? { email } : {}),
    createdAt,
  };
}

export function asAddress(value: unknown): UserAddress | null {
  if (!isRecord(value)) return null;
  const id = identifier(value.id);
  const region = text(value.region, LIMITS.regionMax);
  const city = text(value.city, LIMITS.cityMax);
  const street = text(value.street, LIMITS.streetMax);
  const building = text(value.building, LIMITS.buildingMax);
  const label = optionalText(value.label, LIMITS.labelMax);
  const entrance = optionalText(value.entrance, LIMITS.entranceMax);
  const floor = optionalText(value.floor, LIMITS.floorMax);
  const apartment = optionalText(value.apartment, LIMITS.apartmentMax);
  const intercom = optionalText(value.intercom, LIMITS.intercomMax);
  const recipientName = optionalText(value.recipientName, LIMITS.recipientNameMax);
  const recipientPhone = value.recipientPhone === undefined || value.recipientPhone === null || value.recipientPhone === ''
    ? undefined
    : e164(value.recipientPhone);
  const comment = optionalText(value.comment, LIMITS.commentMax);
  if (
    !id || !region || !city || !street || !building ||
    label === null || entrance === null || floor === null || apartment === null ||
    intercom === null || recipientName === null || recipientPhone === null || comment === null
  ) {
    return null;
  }
  // `isDefault` is required in the contract: a missing flag is a broken row,
  // not something to guess about.
  if (typeof value.isDefault !== 'boolean') return null;
  return {
    id,
    region,
    city,
    street,
    building,
    isDefault: value.isDefault,
    ...(label ? { label } : {}),
    ...(entrance ? { entrance } : {}),
    ...(floor ? { floor } : {}),
    ...(apartment ? { apartment } : {}),
    ...(intercom ? { intercom } : {}),
    ...(recipientName ? { recipientName } : {}),
    ...(recipientPhone ? { recipientPhone } : {}),
    ...(comment ? { comment } : {}),
  };
}

export function asAddresses(value: unknown): UserAddress[] | null {
  if (!Array.isArray(value)) return null;
  const out: UserAddress[] = [];
  for (const raw of value) {
    const address = asAddress(raw);
    if (!address) return null;
    out.push(address);
  }
  return out;
}

function asOrderItem(value: unknown): UserOrderItem | null {
  if (!isRecord(value)) return null;
  const productId = identifier(value.productId) ?? (typeof value.productId === 'number' ? String(value.productId) : null);
  const title = text(value.title, 200);
  const quantity = integer(value.quantity, 1, 999);
  if (!productId || !title || quantity === null) return null;
  let image: string | null = null;
  if (typeof value.image === 'string' && value.image.length <= 500) image = value.image;
  return { productId, title, image, quantity };
}

export function asOrder(value: unknown): UserOrderSummary | null {
  if (!isRecord(value)) return null;
  const id = identifier(value.id);
  const number = typeof value.number === 'string' && /^TAB-\d{1,10}$/.test(value.number) ? value.number : null;
  const createdAt = isoDate(value.createdAt);
  const total = integer(value.total, 0, 1_000_000_000);
  if (!id || !number || !createdAt || total === null) return null;
  if (typeof value.status !== 'string' || !STATUSES.includes(value.status)) return null;
  if (!Array.isArray(value.items) || value.items.length > 50) return null;
  const items: UserOrderItem[] = [];
  for (const raw of value.items) {
    const item = asOrderItem(raw);
    if (!item) return null;
    items.push(item);
  }
  return { id, number, createdAt, status: value.status as OrderStatus, total, items };
}

export function asOrders(value: unknown): UserOrderSummary[] | null {
  if (!Array.isArray(value)) return null;
  const out: UserOrderSummary[] = [];
  for (const raw of value) {
    const order = asOrder(raw);
    if (!order) return null;
    out.push(order);
  }
  return out;
}

/** `GET /me` payload: `{ user }`, with the same strictness as `asUser`. */
export function asUserPayload(value: unknown): User | null {
  if (!isRecord(value)) return null;
  return asUser(value.user);
}

export function asAddressPayload(value: unknown): UserAddress | null {
  if (!isRecord(value)) return null;
  return asAddress(value.address);
}

export function asAddressesPayload(value: unknown): UserAddress[] | null {
  if (!isRecord(value)) return null;
  return asAddresses(value.addresses);
}

export function asOrderPayload(value: unknown): UserOrderSummary | null {
  if (!isRecord(value)) return null;
  return asOrder(value.order);
}

export function asOrdersPayload(value: unknown): UserOrderSummary[] | null {
  if (!isRecord(value)) return null;
  return asOrders(value.orders);
}
