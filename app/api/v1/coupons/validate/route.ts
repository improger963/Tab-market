/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { COUPON_MESSAGES, lookupCoupon, normalizeCouponCode } from '@/server/coupons';
import type { ApiResponse } from '@/types/api';

export interface CouponValidationData {
  valid: boolean;
  code: string;
  discountPercent: number;
  freeShipping: boolean;
  description: string;
  message: string;
}

/**
 * Phase 4: the registry in `server/coupons.ts` is the only coupon truth.
 * The browser store mirrors whatever this endpoint decides, so enabling or
 * disabling a code never requires a client deploy.
 */
export async function POST(req: NextRequest) {
  await new Promise((resolve) => setTimeout(resolve, 150));

  try {
    const { code } = await req.json();
    const normalized = normalizeCouponCode(code ?? '');
    const coupon = lookupCoupon(normalized);

    if (coupon) {
      return NextResponse.json({
        success: true,
        data: {
          valid: true,
          code: coupon.code,
          discountPercent: coupon.discountPercent,
          freeShipping: coupon.freeShipping,
          description: coupon.description,
          message: coupon.successMessage,
        },
      } as ApiResponse<CouponValidationData>);
    }

    return NextResponse.json(
      {
        success: false,
        message: normalized ? COUPON_MESSAGES.INVALID : COUPON_MESSAGES.EMPTY_CODE,
      },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: '\u054d\u056d\u0561\u056c \u057a\u0580\u0578\u0574\u0578\u056f\u0578\u0564\u056b \u057d\u057f\u0578\u0582\u0563\u0574\u0561\u0576 \u0568\u0576\u0569\u0561\u0581\u0584\u0578\u0582\u0574' },
      { status: 500 }
    );
  }
}
