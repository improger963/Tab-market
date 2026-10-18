/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { CreateOrderPayload, OrderConfirmation, ApiResponse } from '@/types/api';
import { allProducts } from '@/server/catalog';
import { couponDiscountFor, lookupCoupon } from '@/server/coupons';
import { finalOrderTotals } from '@/server/pricing';
import { stockCap } from '@/lib/utils';

export async function POST(req: NextRequest) {
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    const payload: CreateOrderPayload = await req.json();

    if (!payload.customer || !payload.customer.fullName || !payload.customer.phone) {
      return NextResponse.json(
        { success: false, message: 'Խնդրում ենք լրացնել անունը և հեռախոսահամարը' },
        { status: 400 }
      );
    }

    if (!payload.items || payload.items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Զամբյուղը դատարկ է' },
        { status: 400 }
      );
    }

    // Phase 4: prices are server truth. The client-sent unitPrice is ignored
    // entirely; quantities are clamped to the same stock cap the cart uses.
    // An unknown product id is a broken/tampered payload: it fails into the
    // shipped generic error below (no invented copy).
    const byId = new Map(allProducts().map((p) => [p.id, p]));
    let subtotal = 0;
    for (const item of payload.items) {
      const product = byId.get(item.productId);
      if (!product) throw new Error(`unknown product id ${item.productId}`);
      const qty = Math.max(
        1,
        Math.min(Math.floor(item.quantity) || 1, stockCap(product.stockQuantity))
      );
      subtotal += product.price * qty;
    }

    // Same registry and rounding the coupon endpoint and the cart display use.
    const coupon = lookupCoupon(payload.couponCode ?? '');
    const totals = finalOrderTotals({
      subtotal,
      method: payload.delivery.method,
      discount: couponDiscountFor(subtotal, coupon),
      freeShipping: Boolean(coupon?.freeShipping),
    });

    const randomId = Math.floor(10000 + Math.random() * 90000);
    const orderId = `TAB-${randomId}`;

    const confirmation: OrderConfirmation = {
      orderId,
      status: 'reserved_in_armsoft',
      subtotal: totals.subtotal,
      discount: totals.discount,
      shippingCost: totals.shippingCost,
      total: totals.total,
      createdAt: new Date().toISOString(),
    };

    const response: ApiResponse<OrderConfirmation> = {
      success: true,
      data: confirmation,
      message: 'Պատվերը հաջողությամբ գրանցվել է Երևանի Մելքումովի 40/1 պահեստում',
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { success: false, message: 'Սխալ պատվերի մշակման ընթացքում' },
      { status: 500 }
    );
  }
}
