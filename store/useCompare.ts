/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '../types';

export interface CompareState {
  items: Product[];
  toggleCompare: (product: Product) => { success: boolean; added: boolean; message: string };
  isInCompare: (productId: number) => boolean;
  removeItem: (productId: number) => void;
  clearCompare: () => void;
  totalCount: () => number;
}

export const useCompare = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],

      toggleCompare: (product: Product) => {
        const currentItems = get().items;
        const exists = currentItems.some((item) => item.id === product.id);

        if (exists) {
          set({ items: currentItems.filter((item) => item.id !== product.id) });
          return { success: true, added: false, message: 'Հեռացվեց համեմատության ցանկից' };
        } else {
          if (currentItems.length >= 4) {
            return {
              success: false,
              added: false,
              message: 'Առավելագույնը կարող եք համեմատել 4 ապրանք միաժամանակ',
            };
          }
          set({ items: [...currentItems, product] });
          return { success: true, added: true, message: 'Ավելացվեց համեմատության ցանկում' };
        }
      },

      isInCompare: (productId: number) => {
        return get().items.some((item) => item.id === productId);
      },

      removeItem: (productId: number) => {
        set({ items: get().items.filter((item) => item.id !== productId) });
      },

      clearCompare: () => {
        set({ items: [] });
      },

      totalCount: () => {
        return get().items.length;
      },
    }),
    {
      name: 'tab-compare-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
