/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { CreateOrderPayload, OrderConfirmation, ApiResponse } from '@/types/api';

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

    // Calculate subtotal
    const subtotal = payload.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    // Compute shipping cost
    let shippingCost = 0;
    if (payload.delivery.method === 'yerevan_delivery') {
      shippingCost = subtotal >= 30000 ? 0 : 1500;
    } else if (payload.delivery.method === 'regional_delivery') {
      shippingCost = 3000;
    }

    // Apply coupon discount if any
    let discount = 0;
    if (payload.couponCode) {
      const coupon = payload.couponCode.toUpperCase().trim();
      if (coupon === 'TAB10') {
        discount = subtotal * 0.10;
      } else if (coupon === 'VARPET') {
        discount = subtotal * 0.15;
      } else if (coupon === 'FREE') {
        shippingCost = 0;
      }
    }

    const total = Math.max(0, subtotal - discount + shippingCost);
    const randomId = Math.floor(10000 + Math.random() * 90000);
    const orderId = `TAB-${randomId}`;

    const confirmation: OrderConfirmation = {
      orderId,
      status: 'reserved_in_armsoft',
      subtotal,
      discount,
      shippingCost,
      total,
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
