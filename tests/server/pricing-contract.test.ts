/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Pricing & coupon contract (Phase 4): coupon truth and order math live on
 * the server only. The client table is gone; these tests lock the registry,
 * the money rules and both route behaviors, including the anti-tamper
 * guarantee (client-sent unitPrice must never reach the total).
 */
import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import {
  COUPONS,
  COUPON_MESSAGES,
  couponDiscountFor,
  lookupCoupon,
  normalizeCouponCode,
} from '@/server/coupons';
import { baseShippingCost, finalOrderTotals } from '@/server/pricing';
import { allProducts } from '@/server/catalog';
import { stockCap } from '@/lib/utils';
import type { CreateOrderPayload } from '@/types/api';

const ARMENIAN = /[\u0530-\u058F]/;

describe('coupon registry', () => {
  it('carries exactly the shipped codes with the shipped economics', () => {
    expect(Object.keys(COUPONS).sort()).toEqual(['FREE', 'TAB10', 'VARPET']);
    expect(COUPONS.TAB10).toMatchObject({ discountPercent: 10, freeShipping: false });
    expect(COUPONS.VARPET).toMatchObject({ discountPercent: 15, freeShipping: false });
    expect(COUPONS.FREE).toMatchObject({ discountPercent: 0, freeShipping: true });
  });

  it('every user-facing string is Armenian and non-empty', () => {
    for (const coupon of Object.values(COUPONS)) {
      expect(coupon.description).toMatch(ARMENIAN);
      expect(coupon.successMessage).toMatch(ARMENIAN);
    }
    expect(COUPON_MESSAGES.EMPTY_CODE).toMatch(ARMENIAN);
    expect(COUPON_MESSAGES.INVALID).toMatch(ARMENIAN);
  });

  it('normalizes case and whitespace before the exact-match lookup', () => {
    expect(normalizeCouponCode('  tab10 ')).toBe('TAB10');
    expect(lookupCoupon('  VaRpEt')?.discountPercent).toBe(15);
    expect(lookupCoupon('')).toBeUndefined();
    expect(lookupCoupon('   ')).toBeUndefined();
    expect(lookupCoupon('NOPE')).toBeUndefined();
  });

  it('rounds discounts to whole AMD like the cart display does', () => {
    // 33 333 * 10% = 3 333.3 -> 3 333
    expect(couponDiscountFor(33333, COUPONS.TAB10)).toBe(3333);
    // 1 000 * 15% = 150 exactly
    expect(couponDiscountFor(1000, COUPONS.VARPET)).toBe(150);
    // FREE never discounts the goods
    expect(couponDiscountFor(5000, COUPONS.FREE)).toBe(0);
    expect(couponDiscountFor(5000, undefined)).toBe(0);
  });
});

describe('shipping + totals', () => {
  it('applies the shipped Yerevan threshold and regional flat fee', () => {
    expect(baseShippingCost('yerevan_delivery', 29_999)).toBe(1500);
    expect(baseShippingCost('yerevan_delivery', 30_000)).toBe(0);
    expect(baseShippingCost('regional_delivery', 10)).toBe(3000);
    expect(baseShippingCost('showroom_pickup', 10)).toBe(0);
  });

  it('FREE coupon zeroes shipping without touching the goods discount', () => {
    const totals = finalOrderTotals({
      subtotal: 10_000,
      method: 'yerevan_delivery',
      discount: couponDiscountFor(10_000, COUPONS.FREE),
      freeShipping: true,
    });
    expect(totals).toEqual({ subtotal: 10_000, discount: 0, shippingCost: 0, total: 10_000 });
  });

  it('total never dips below zero and always lands on whole AMD', () => {
    const totals = finalOrderTotals({
      subtotal: 33_333,
      method: 'regional_delivery',
      discount: couponDiscountFor(33_333, COUPONS.VARPET),
      freeShipping: false,
    });
    expect(totals.discount).toBe(5000); // round(33333*0.15)=5000
    expect(totals.total).toBe(33_333 - 5000 + 3000);
    expect(Number.isInteger(totals.total)).toBe(true);
  });
});

describe('POST /api/v1/coupons/validate', () => {
  const post = (body: unknown) =>
    new NextRequest('http://localhost/api/v1/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

  it('confirms a valid code with the full registry truth', async () => {
    const res = await (await import('@/app/api/v1/coupons/validate/route')).POST(post({ code: 'tab10' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toMatchObject({
      valid: true,
      code: 'TAB10',
      discountPercent: 10,
      freeShipping: false,
    });
    // The toast body is the exact string the pre-Phase-4 client table showed.
    expect(json.data.message).toBe(COUPONS.TAB10.successMessage);
  });

  it('rejects unknown codes with 400 and the shipped localized reason', async () => {
    const res = await (await import('@/app/api/v1/coupons/validate/route')).POST(post({ code: 'NOPE' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.message).toBe(COUPON_MESSAGES.INVALID);
  });

  it('rejects an empty code with the empty-submission message', async () => {
    const res = await (await import('@/app/api/v1/coupons/validate/route')).POST(post({ code: '  ' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toBe(COUPON_MESSAGES.EMPTY_CODE);
  });
});

describe('POST /api/v1/orders is price-authoritative', () => {
  const product = allProducts().find((p) => stockCap(p.stockQuantity) >= 2) ?? allProducts()[0];

  const payloadFor = (overrides: Partial<CreateOrderPayload> = {}): CreateOrderPayload => {
    return {
      customer: { fullName: 'Test', phone: '+37411111111' },
      delivery: { method: 'showroom_pickup' },
      payment: { method: 'cash' },
      items: [{ productId: product.id, productCode: product.code, quantity: 2, unitPrice: product.price }],
      ...overrides,
    };
  }

  const postOrder = (payload: CreateOrderPayload) =>
    new NextRequest('http://localhost/api/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

  it('ignores a tampered client price and bills the server price', async () => {
    const payload = payloadFor({
      items: [{ productId: product.id, productCode: product.code, quantity: 2, unitPrice: 1 }],
    });
    const res = await (await import('@/app/api/v1/orders/route')).POST(postOrder(payload));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.subtotal).toBe(product.price * 2);
    expect(json.data.total).toBe(product.price * 2);
    expect(json.data.orderId).toMatch(/^TAB-\d{5}$/);
  });

  it('applies registry discounts to the server-side subtotal', async () => {
    const payload = payloadFor({ couponCode: 'tab10' });
    const res = await (await import('@/app/api/v1/orders/route')).POST(postOrder(payload));
    const json = await res.json();
    const expectedDiscount = Math.round((product.price * 2 * 10) / 100);
    expect(json.data.discount).toBe(expectedDiscount);
    expect(json.data.total).toBe(product.price * 2 - expectedDiscount);
  });

  it('clamps quantities to the server stock cap', async () => {
    const cap = stockCap(product.stockQuantity);
    if (!Number.isFinite(cap)) return; // unbounded stock: nothing to clamp
    const payload = payloadFor({
      items: [{ productId: product.id, productCode: product.code, quantity: cap + 500, unitPrice: product.price }],
    });
    const res = await (await import('@/app/api/v1/orders/route')).POST(postOrder(payload));
    const json = await res.json();
    expect(json.data.subtotal).toBe(product.price * cap);
  });

  it('refuses unknown product ids through the shipped generic error', async () => {
    const payload = payloadFor({
      items: [{ productId: 99_999_999, productCode: 'NOPE', quantity: 1, unitPrice: 100 }],
    });
    const res = await (await import('@/app/api/v1/orders/route')).POST(postOrder(payload));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.message).toMatch(ARMENIAN);
  });
});
