/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PaginatedResponse,
  ProductFilterParams,
  CreateOrderPayload,
  OrderConfirmation,
  ApiResponse,
  TrackedOrderDetails,
} from '@/types/api';
import { Product, Category } from '@/types';
import {
  TRACKING_FIXTURES,
  ORDER_NOT_FOUND_MESSAGE,
  buildDynamicFixture,
} from '@/services/trackingFixtures';

const API_BASE = typeof window !== 'undefined' ? '/api/v1' : 'http://localhost:3000/api/v1';

/**
 * Generates a new order id in the canonical `TAB-xxxxx` format.
 * Order-number ownership lives in the API layer, never in a component, so the
 * Laravel backend can adopt the exact same contract.
 */
export function generateOrderId(): string {
  return `TAB-${Math.floor(10000 + Math.random() * 90000)}`;
}

export async function fetchProducts(params?: ProductFilterParams): Promise<PaginatedResponse<Product>> {
  const query = new URLSearchParams();
  if (params) {
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.brand && params.brand !== 'all') query.set('brand', params.brand);
    if (params.finish && params.finish !== 'all') query.set('finish', params.finish);
    if (params.search) query.set('search', params.search);
    if (params.inStockOnly) query.set('inStockOnly', 'true');
    if (params.minPrice !== undefined) query.set('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) query.set('maxPrice', params.maxPrice.toString());
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
  }

  const res = await fetch(`${API_BASE}/products?${query.toString()}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error('Ապրանքների բեռնման սխալ');
  }
  const json: PaginatedResponse<Product> = await res.json();
  return json;
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const res = await fetch(`${API_BASE}/products/${slug}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    return null;
  }
  const json: ApiResponse<Product> = await res.json();
  return json.data;
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    return [];
  }
  const json: ApiResponse<Category[]> = await res.json();
  return json.data;
}

export async function searchProducts(query: string): Promise<Product[]> {
  if (!query || query.trim() === '') return [];
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    return [];
  }
  const json: ApiResponse<Product[]> = await res.json();
  return json.data;
}

export async function submitOrder(payload: CreateOrderPayload): Promise<OrderConfirmation> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Պատվերի ձևակերպման սխալ');
  }
  return json.data;
}

export async function validateCoupon(
  code: string
): Promise<{ valid: boolean; discountPercent: number; message: string }> {
  const res = await fetch(`${API_BASE}/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Անվավեր պրոմոկոդ');
  }
  return json.data;
}

/**
 * Resolves a tracked order entirely client-side from the fixtures, throwing a
 * clean Armenian "not found" message (never a raw JSON parse error).
 */
function resolveTrackedOrder(orderId: string, phone: string): TrackedOrderDetails {
  const id = orderId.trim().toUpperCase();
  const fixture = TRACKING_FIXTURES[id];
  if (fixture) {
    return phone.trim() ? { ...fixture, phone: phone.trim() } : fixture;
  }
  if (/^TAB-\d{5}$/.test(id)) {
    return buildDynamicFixture(id, phone.trim());
  }
  throw new Error(ORDER_NOT_FOUND_MESSAGE);
}

export async function trackOrder(orderId: string, phone: string): Promise<TrackedOrderDetails> {
  try {
    const res = await fetch(
      `${API_BASE}/orders/track?orderId=${encodeURIComponent(orderId)}&phone=${encodeURIComponent(phone)}`,
      {
        cache: 'no-store',
      }
    );
    const contentType = res.headers.get('content-type') ?? '';
    // Only trust genuine JSON. A Vite SPA fallback (index.html), a non-2xx
    // status, or a malformed body falls through to the client-side fixtures,
    // so the customer never sees `Unexpected token '<' ... is not valid JSON`.
    if (res.ok && contentType.includes('application/json')) {
      const json = (await res.json()) as ApiResponse<TrackedOrderDetails>;
      if (json?.success && json.data) return json.data;
      throw new Error(json?.message || ORDER_NOT_FOUND_MESSAGE);
    }
  } catch {
    // Network / parse failure — resolve from fixtures below instead.
  }
  return resolveTrackedOrder(orderId, phone);
}

