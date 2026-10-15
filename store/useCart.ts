/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, Product } from '../types';

export interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;

  // Actions
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, qty: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;

  // Computed getters
  totalPrice: () => number;
  totalCount: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,

      addItem: (product: Product, qty: number = 1) => {
        if (qty <= 0) return;
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((item) => item.product.id === product.id);

        if (existingIndex > -1) {
          const updatedItems = [...currentItems];
          const newQty = updatedItems[existingIndex].quantity + qty;
          // Ensure we don't exceed stock if finite stock
          const finalQty = product.stockQuantity > 0 
            ? Math.min(newQty, product.stockQuantity) 
            : newQty;

          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity: finalQty,
          };
          set({ items: updatedItems });
        } else {
          const initialQty = product.stockQuantity > 0 
            ? Math.min(qty, product.stockQuantity) 
            : qty;
          set({
            items: [...currentItems, { product, quantity: initialQty }],
          });
        }
      },

      removeItem: (productId: number) => {
        set({
          items: get().items.filter((item) => item.product.id !== productId),
        });
      },

      updateQuantity: (productId: number, qty: number) => {
        if (qty <= 0) {
          get().removeItem(productId);
          return;
        }

        set({
          items: get().items.map((item) => {
            if (item.product.id === productId) {
              const maxStock = item.product.stockQuantity;
              const safeQty = maxStock > 0 ? Math.min(qty, maxStock) : qty;
              return { ...item, quantity: safeQty };
            }
            return item;
          }),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      openDrawer: () => {
        set({ isDrawerOpen: true });
      },

      closeDrawer: () => {
        set({ isDrawerOpen: false });
      },

      toggleDrawer: () => {
        set({ isDrawerOpen: !get().isDrawerOpen });
      },

      totalPrice: () => {
        return get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      },

      totalCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'tab-cart-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist cart items, not the ephemeral drawer UI state
      partialize: (state) => ({ items: state.items }),
    }
  )
);
