/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The single source of truth for promotional codes (Phase 4).
 *
 * The browser no longer decides what a coupon is worth: the client store
 * asks `/api/v1/coupons/validate` (backed by this registry) and the order
 * route recomputes every discount server-side. Codes, percentages and the
 * localized confirmations all live here - enabling, tuning or disabling a
 * code is a one-line server change (docs/MIGRATION_MAP.md section 5, owner
 * decision 4: VARPET/FREE stay live until the owner says otherwise).
 *
 * Every Armenian literal below was mechanically escaped from the shipped
 * client table it replaced (scripts/_gen_coupon_registry.mjs); none was
 * retyped by hand.
 */
import 'server-only';

export interface CouponDefinition {
  code: string;
  discountPercent: number;
  freeShipping: boolean;
  /** Localized (Armenian): rendered next to the applied code in the cart. */
  description: string;
  /** Localized (Armenian): the confirmation toast body. */
  successMessage: string;
}

export const COUPONS: Record<string, CouponDefinition> = {
  TAB10: {
    code: 'TAB10',
    discountPercent: 10,
    freeShipping: false,
    description: '10% \u0566\u0565\u0572\u0579 \u057a\u0561\u057f\u057e\u0565\u0580\u056b \u0561\u0574\u0562\u0578\u0572\u057b \u0561\u0580\u056a\u0565\u0584\u056b\u0581',
    successMessage: '\u056f\u056b\u0580\u0561\u057c\u057e\u0561\u056e \u0567: 10% \u0566\u0565\u0572\u0579 \u0561\u0574\u0562\u0578\u0572\u057b \u0566\u0561\u0574\u0562\u0575\u0578\u0582\u0572\u056b \u0570\u0561\u0574\u0561\u0580!',
  },
  VARPET: {
    code: 'VARPET',
    discountPercent: 15,
    freeShipping: false,
    description: '15% \u0570\u0561\u057f\u0578\u0582\u056f \u057e\u0561\u0580\u057a\u0565\u057f\u0561\u056f\u0561\u0576 \u0566\u0565\u0572\u0579',
    successMessage: '\u056f\u056b\u0580\u0561\u057c\u057e\u0561\u056e \u0567: 15% \u0574\u0561\u057d\u0576\u0561\u0563\u056b\u057f\u0561\u056f\u0561\u0576 \u0566\u0565\u0572\u0579!',
  },
  FREE: {
    code: 'FREE',
    discountPercent: 0,
    freeShipping: true,
    description: '\u0531\u0576\u057e\u0573\u0561\u0580 \u0561\u057c\u0561\u0584\u0578\u0582\u0574 \u0561\u0574\u0562\u0578\u0572\u057b \u0540\u0540 \u057f\u0561\u0580\u0561\u056e\u0584\u0578\u0582\u0574',
    successMessage: '\u056f\u056b\u0580\u0561\u057c\u057e\u0561\u056e \u0567: \u0531\u0576\u057e\u0573\u0561\u0580 \u0561\u057c\u0561\u0584\u0578\u0582\u0574 \u0540\u0540 \u0562\u0578\u056c\u0578\u0580 \u0574\u0561\u0580\u0566\u0565\u0580!',
  },
};

/** Client-visible rejections, carried over from the shipped table verbatim. */
export const COUPON_MESSAGES = {
  EMPTY_CODE: '\u053d\u0576\u0564\u0580\u0578\u0582\u0574 \u0565\u0576\u0584 \u0574\u0578\u0582\u057f\u0584\u0561\u0563\u0580\u0565\u056c \u057a\u0580\u0578\u0574\u0578\u056f\u0578\u0564',
  INVALID: '\u0531\u0576\u057e\u0561\u057e\u0565\u0580 \u057a\u0580\u0578\u0574\u0578\u056f\u0578\u0564: \u0553\u0578\u0580\u0571\u0565\u0584 \u054a\u0580\u0578\u0574\u0578\u056f\u0578\u0564',
};

export function normalizeCouponCode(raw: string): string {
  return (raw ?? '').toString().trim().toUpperCase();
}

/** The only place a code is judged: exact match against the registry. */
export function lookupCoupon(rawCode: string): CouponDefinition | undefined {
  const code = normalizeCouponCode(rawCode);
  return code ? COUPONS[code] : undefined;
}

/**
 * Whole-AMD rounding identical to the cart display rule
 * (`Math.round((subtotal * percent) / 100)`), so server totals are the
 * numbers the customer already saw.
 */
export function couponDiscountFor(
  subtotal: number,
  coupon: CouponDefinition | undefined
): number {
  if (!coupon || coupon.discountPercent <= 0) return 0;
  return Math.round((subtotal * coupon.discountPercent) / 100);
}
