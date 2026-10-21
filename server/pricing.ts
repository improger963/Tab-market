/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Server-side order math (Phase 4). The shipped mock route already applied
 * exactly these rules; they are now one tested function instead of inline
 * arithmetic that trusted client prices.
 */
import 'server-only';

export const SHIPPING_RULES = {
  /** Yerevan delivery is flat ... */
  yerevanFlat: 1500,
  /** ... until this subtotal makes it free. */
  yerevanFreeFrom: 30000,
  /** Regional delivery is a flat fee. */
  regionalFlat: 3000,
};

/** Base shipping before coupon overrides; unknown/pickup methods are free. */
export function baseShippingCost(method: string, subtotal: number): number {
  if (method === 'yerevan_delivery') {
    return subtotal >= SHIPPING_RULES.yerevanFreeFrom ? 0 : SHIPPING_RULES.yerevanFlat;
  }
  if (method === 'regional_delivery') return SHIPPING_RULES.regionalFlat;
  return 0;
}

export interface TotalsInput {
  subtotal: number;
  method: string;
  discount: number;
  freeShipping: boolean;
}

export interface OrderTotals {
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
}

/** The authoritative money path: never trust anything the browser computed. */
export function finalOrderTotals(input: TotalsInput): OrderTotals {
  const shippingCost = input.freeShipping
    ? 0
    : baseShippingCost(input.method, input.subtotal);
  const total = Math.max(0, input.subtotal - input.discount + shippingCost);
  return {
    subtotal: input.subtotal,
    discount: input.discount,
    shippingCost,
    total,
  };
}
