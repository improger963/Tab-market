/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Product, Category } from '@/types';

/**
 * Canonical order lifecycle statuses (single source of truth).
 * The mock server and (future) Laravel API return these exact string values.
 */
export const ORDER_STATUS = {
  RECEIVED: 'received',
  PROCESSING: 'processing',
  READY_FOR_PICKUP: 'ready_for_pickup',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export type DeliveryMethod = 'showroom_pickup' | 'yerevan_delivery' | 'regional_delivery';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Envelope used by the customer-account endpoints. It is the same shape as
 * `ApiResponse` with two optional additions, so existing consumers that only
 * read `success`/`data`/`message` keep working:
 *  - `error` carries a stable machine code plus per-field messages, which is
 *    what the Laravel (Sanctum) backend will return on 422;
 *  - `meta` carries pagination/limit information.
 */
export interface ApiErrorEnvelope {
  /** Stable, documented code the client switches on (never localized). */
  code: string;
  message: string;
  /** Field name -> already-localized (Armenian) message. */
  fields?: Record<string, string>;
}

export interface ApiMeta {
  [key: string]: string | number | boolean | null;
}

export interface ApiEnvelope<T> extends ApiResponse<T> {
  error?: ApiErrorEnvelope;
  meta?: ApiMeta;
}

// ---------------------------------------------------------------------------
// Customer account (optional convenience — guests are never required to sign in)
// ---------------------------------------------------------------------------

/**
 * A saved delivery address. Fetched separately from `User` and never nested
 * inside it, so the profile payload stays minimal.
 */
export interface UserAddress {
  id: string;
  label?: string; // «Տուն», «Աշխատանք»
  region: string; // Երևան / մարզ
  city: string; // քաղաք
  street: string;
  building: string;
  entrance?: string;
  floor?: string;
  apartment?: string;
  intercom?: string;
  recipientName?: string;
  recipientPhone?: string;
  comment?: string;
  isDefault: boolean;
}

/**
 * Account owner. `phone` is canonical E.164 (`+374XXXXXXXX`); the UI never
 * renders it unmasked outside the checkout prefill, and it is never persisted
 * in a browser store.
 */
export interface User {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  createdAt: string; // ISO
}

/** Minimal, non-sensitive snapshot safe to inline into the served document. */
export interface SessionSnapshot {
  id: string;
  fullName: string;
  maskedPhone: string;
}

/**
 * Order line as shown in the account list. `productId` is a string so the
 * Laravel backend can switch to UUIDs without a type change; the mock emits the
 * numeric catalog id as a string.
 */
export interface UserOrderItem {
  productId: string;
  title: string;
  image: string | null;
  quantity: number;
}

export interface UserOrderSummary {
  id: string;
  number: string; // TAB-xxxxx
  createdAt: string;
  status: OrderStatus;
  total: number; // integer AMD
  items: UserOrderItem[];
}

export type AuthMode = 'login' | 'register';

export interface LoginPayload {
  phone: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  phone: string;
  password: string;
  acceptTerms: boolean;
}

/** Phone is deliberately absent: it is read-only until a verified flow exists. */
export interface UpdateProfilePayload {
  fullName?: string;
  email?: string;
}

export type AddressInput = Omit<UserAddress, 'id'>;

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
}

export interface ProductFilterParams {
  category?: string;
  brand?: string;
  finish?: string;
  diameter?: string;
  material?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  search?: string;
  sortBy?: 'popular' | 'price-asc' | 'price-desc' | 'newest';
  page?: number;
  limit?: number;
}

export interface CreateOrderPayload {
  customer: {
    fullName: string;
    phone: string;
    email?: string;
  };
  delivery: {
    method: DeliveryMethod;
    address?: {
      marz?: string;
      city?: string;
      street: string;
      apartment?: string;
      entrance?: string;
      floor?: string;
    };
    notes?: string;
  };
  payment: {
    method: 'idram' | 'telcell' | 'card' | 'cash';
  };
  b2b?: {
    isB2B: boolean;
    companyName?: string;
    tin?: string; // 8-digit TIN / ՀՎՀՀ
  };
  couponCode?: string;
  items: Array<{
    productId: number;
    productCode: string; // SKU
    quantity: number;
    unitPrice: number;
  }>;
}

export type OrderCreationStatus = 'pending' | 'confirmed' | 'reserved';

export interface OrderConfirmation {
  orderId: string; // e.g. "TAB-84920"
  status: OrderCreationStatus;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  createdAt: string;
}

export interface OrderTrackingStep {
  id: string;
  title: string;
  description: string;
  timestamp?: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface TrackedOrderDetails {
  orderId: string;
  createdAt: string;
  customerName: string;
  phone: string;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending';
  currentStatus: OrderStatus;
  timeline: OrderTrackingStep[];
  items: Array<{
    id: number;
    code: string; // SKU
    title: string;
    image: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
}
