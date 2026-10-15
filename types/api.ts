/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Category } from '@/types';

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
    method: 'showroom_pickup' | 'yerevan_delivery' | 'regional_delivery';
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
    productCode: string; // ArmSoft SKU
    quantity: number;
    unitPrice: number;
  }>;
}

export interface OrderConfirmation {
  orderId: string; // e.g. "TAB-84920"
  status: 'pending' | 'confirmed' | 'reserved_in_armsoft';
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
  deliveryMethod: 'showroom_pickup' | 'yerevan_delivery' | 'regional_delivery';
  deliveryAddress?: string;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending';
  currentStatus: 'received' | 'processing' | 'ready_for_pickup' | 'in_transit' | 'delivered';
  timeline: OrderTrackingStep[];
  items: Array<{
    id: number;
    code: string; // ArmSoft SKU
    title: string;
    image: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
}
