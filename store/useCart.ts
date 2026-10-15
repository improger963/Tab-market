/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, Product } from '../types';
import { products } from '../data/products';

// Persisted schema version. Bump when the stored shape changes and add a
// matching branch in `migrate` below.
const CART_SCHEMA_VERSION = 1;

/**
 * Re-validates persisted cart lines against the live catalog on rehydration:
 *  - drops items that no longer exist in the catalog,
 *  - refreshes price/availability truth from the catalog,
 *  - clamps quantity to the current min/max (1..stock).
 */
function revalidateCartItems(items: CartItem[]): CartItem[] {
  return items.reduce<CartItem[]>((acc, item) => {
    const fresh = products.find((p) => p.id === item.product.id);
    if (!fresh) return acc; // product removed from catalog
    const merged: Product = {
      ...item.product,
      price: fresh.price,
      oldPrice: fresh.oldPrice,
      inStock: fresh.inStock,
      stockQuantity: fresh.stockQuantity,
      title: fresh.title,
      images: fresh.images,
    };
    const maxQty = fresh.stockQuantity > 0 ? fresh.stockQuantity : item.quantity;
    const quantity = Math.max(1, Math.min(item.quantity, maxQty));
    acc.push({ product: merged, quantity });
    return acc;
  }, []);
}

export interface CouponData {
  code: string;
  discountPercent: number; // e.g. 10 or 15
  freeShipping: boolean;
  description: string;
}

export interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  appliedCoupon: CouponData | null;

  // Actions
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, qty: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Computed getters
  totalPrice: () => number; // raw items subtotal
  totalCount: () => number;
  getDiscountAmount: () => number;
  getFinalTotal: (baseShippingCost: number) => number;
  getEffectiveShippingCost: (baseShippingCost: number) => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      appliedCoupon: null,

      addItem: (product: Product, qty: number = 1) => {
        if (qty <= 0) return;
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((item) => item.product.id === product.id);

        if (existingIndex > -1) {
          const updatedItems = [...currentItems];
          const newQty = updatedItems[existingIndex].quantity + qty;
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
        set({ items: [], appliedCoupon: null });
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

      applyCoupon: (codeRaw: string) => {
        const code = codeRaw.trim().toUpperCase();
        if (!code) {
          return { success: false, message: 'Խնդրում ենք մուտքագրել պրոմոկոդ' };
        }

        if (code === 'TAB10') {
          const coupon: CouponData = {
            code: 'TAB10',
            discountPercent: 10,
            freeShipping: false,
            description: '10% զեղչ պատվերի ամբողջ արժեքից',
          };
          set({ appliedCoupon: coupon });
          return { success: true, message: 'կիրառված է: 10% զեղչ ամբողջ զամբյուղի համար!' };
        }

        if (code === 'VARPET') {
          const coupon: CouponData = {
            code: 'VARPET',
            discountPercent: 15,
            freeShipping: false,
            description: '15% հատուկ վարպետական զեղչ',
          };
          set({ appliedCoupon: coupon });
          return { success: true, message: 'կիրառված է: 15% մասնագիտական զեղչ!' };
        }

        if (code === 'FREE') {
          const coupon: CouponData = {
            code: 'FREE',
            discountPercent: 0,
            freeShipping: true,
            description: 'Անվճար առաքում ամբողջ ՀՀ տարածքում',
          };
          set({ appliedCoupon: coupon });
          return { success: true, message: 'կիրառված է: Անվճար առաքում ՀՀ բոլոր մարզեր!' };
        }

        return { success: false, message: 'Անվավեր պրոմոկոդ: Փորձեք Պրոմոկոդ' };
      },

      removeCoupon: () => {
        set({ appliedCoupon: null });
      },

      totalPrice: () => {
        return get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      },

      totalCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getDiscountAmount: () => {
        const subtotal = get().totalPrice();
        const coupon = get().appliedCoupon;
        if (!coupon || coupon.discountPercent <= 0) return 0;
        return Math.round((subtotal * coupon.discountPercent) / 100);
      },

      getEffectiveShippingCost: (baseShippingCost: number) => {
        const coupon = get().appliedCoupon;
        if (coupon && coupon.freeShipping) return 0;
        return baseShippingCost;
      },

      getFinalTotal: (baseShippingCost: number) => {
        const subtotal = get().totalPrice();
        const discount = get().getDiscountAmount();
        const effectiveShipping = get().getEffectiveShippingCost(baseShippingCost);
        return Math.max(0, subtotal - discount + effectiveShipping);
      },
    }),
    {
      name: 'tab-cart-storage',
      storage: createJSONStorage(() => localStorage),
      version: CART_SCHEMA_VERSION,
      partialize: (state) => ({ items: state.items, appliedCoupon: state.appliedCoupon }),
      migrate: (persistedState, version) => {
        const state = (persistedState ?? {}) as Partial<CartState>;
        if (version < CART_SCHEMA_VERSION) {
          state.items = Array.isArray(state.items) ? state.items : [];
          state.appliedCoupon = state.appliedCoupon ?? null;
        }
        return state as CartState;
      },
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.items) && state.items.length > 0) {
          useCart.setState({ items: revalidateCartItems(state.items) });
        }
      },
    }
  )
);
