/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '../types';

export interface RecentlyViewedState {
  items: Product[];
  addProduct: (product: Product) => void;
  clearHistory: () => void;
}

export const useRecentlyViewed = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],

      addProduct: (product: Product) => {
        const currentItems = get().items;
        // Remove if already in list to move to front
        const filtered = currentItems.filter((p) => p.id !== product.id);
        // Keep at most 8 recent items
        set({ items: [product, ...filtered].slice(0, 8) });
      },

      clearHistory: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'tab-recently-viewed-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
