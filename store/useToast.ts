/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { Product } from '@/types';

export interface ToastItem {
  id: string;
  type: 'cart' | 'copy' | 'info';
  title?: string;
  message: string;
  product?: Product;
  quantity?: number;
  duration?: number;
}

interface ToastStore {
  toasts: ToastItem[];
  showCartToast: (product: Product, quantity?: number) => void;
  showCopyToast: (code: string) => void;
  showToast: (message: string, title?: string) => void;
  removeToast: (id: string) => void;
}

export const useToast = create<ToastStore>((set, get) => ({
  toasts: [],

  showCartToast: (product: Product, quantity = 1) => {
    const id = `cart-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newToast: ToastItem = {
      id,
      type: 'cart',
      title: 'Ավելացվել է զամբյուղ',
      message: product.title,
      product,
      quantity,
      duration: 4000,
    };

    set((state) => ({
      toasts: [...state.toasts.slice(-3), newToast], // keep maximum 4 active toasts
    }));

    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },

  showCopyToast: (code: string) => {
    const id = `copy-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newToast: ToastItem = {
      id,
      type: 'copy',
      title: 'Պատճենված է',
      message: `ՀԾ Կոդ ${code}-ը պատճենվեց`,
      duration: 3000,
    };

    set((state) => ({
      toasts: [...state.toasts.slice(-3), newToast],
    }));

    setTimeout(() => {
      get().removeToast(id);
    }, 3000);
  },

  showToast: (message: string, title?: string) => {
    const id = `info-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newToast: ToastItem = {
      id,
      type: 'info',
      title,
      message,
      duration: 3500,
    };

    set((state) => ({
      toasts: [...state.toasts.slice(-3), newToast],
    }));

    setTimeout(() => {
      get().removeToast(id);
    }, 3500);
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));
