/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '../types';

export interface WishlistState {
  items: Product[];
  toggleWishlist: (product: Product) => boolean; // returns true if added, false if removed
  isInWishlist: (productId: number) => boolean;
  removeItem: (productId: number) => void;
  clearWishlist: () => void;
  totalCount: () => number;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggleWishlist: (product: Product) => {
        const currentItems = get().items;
        const exists = currentItems.some((item) => item.id === product.id);

        if (exists) {
          set({ items: currentItems.filter((item) => item.id !== product.id) });
          return false;
        } else {
          set({ items: [product, ...currentItems] });
          return true;
        }
      },

      isInWishlist: (productId: number) => {
        return get().items.some((item) => item.id === productId);
      },

      removeItem: (productId: number) => {
        set({ items: get().items.filter((item) => item.id !== productId) });
      },

      clearWishlist: () => {
        set({ items: [] });
      },

      totalCount: () => {
        return get().items.length;
      },
    }),
    {
      name: 'tab-wishlist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
