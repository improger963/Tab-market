/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, Product } from '../types';
import { loadFullCatalog } from '../lib/clientCatalog';
import { validateCoupon } from '../services/api';
import { stockCap } from '../lib/utils';

// Persisted schema version. Bump when the stored shape changes and add a
// matching branch in `migrate` below.
const CART_SCHEMA_VERSION = 1;

/**
 * Shipped localized rejection for an empty submission (escaped from the
 * pre-Phase-4 client coupon table). Every other verdict comes from the API.
 */
const EMPTY_COUPON_MESSAGE = '\u053d\u0576\u0564\u0580\u0578\u0582\u0574 \u0565\u0576\u0584 \u0574\u0578\u0582\u057f\u0584\u0561\u0563\u0580\u0565\u056c \u057a\u0580\u0578\u0574\u0578\u056f\u0578\u0564';

/**
 * Re-validates persisted cart lines against the live catalog:
 *  - drops items that no longer exist in the catalog,
 *  - refreshes price/availability truth from the catalog,
 *  - clamps quantity to the current min/max (1..stock).
 * Phase 3: the catalog arrives through the shared once-per-session loader
 * instead of a static import, so the 2.2 MB price list never enters the
 * client bundle. Until it resolves, stored lines render from their snapshot
 * (prices were persisted from the same source, so drift is transient).
 */
function revalidateCartItems(items: CartItem[], catalog: Product[]): CartItem[] {
  return items.reduce<CartItem[]>((acc, item) => {
    const fresh = catalog.find((p) => p.id === item.product.id);
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
    const maxQty = stockCap(fresh.stockQuantity);
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
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
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
          const finalQty = Math.min(newQty, stockCap(product.stockQuantity));

          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity: finalQty,
          };
          set({ items: updatedItems });
        } else {
          const initialQty = Math.min(qty, stockCap(product.stockQuantity));
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
              const safeQty = Math.min(qty, stockCap(item.product.stockQuantity));
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

      applyCoupon: async (codeRaw: string) => {
        const code = codeRaw.trim().toUpperCase();
        if (!code) {
          return { success: false, message: EMPTY_COUPON_MESSAGE };
        }
        // Phase 4: the server owns coupon truth; this mirrors its verdict and
        // only stores what it confirmed. A rejection leaves any currently
        // applied coupon untouched, exactly like the old client table did.
        const result = await validateCoupon(code);
        if (result.valid) {
          set({
            appliedCoupon: {
              code: result.code,
              discountPercent: result.discountPercent,
              freeShipping: result.freeShipping,
              description: result.description,
            },
          });
        }
        return { success: result.valid, message: result.message };
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
          // Validate against the live catalog once the shared loader resolves;
          // if it fails, keep the persisted snapshot (least destructive choice).
          loadFullCatalog()
            .then((catalog) => {
              useCart.setState({ items: revalidateCartItems(state.items, catalog) });
            })
            .catch(() => {});
        }
      },
    }
  )
);
