/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Category } from '@/types';

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

export type OrderCreationStatus = 'pending' | 'confirmed' | 'reserved_in_armsoft';

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
