"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  getCartPricing,
  mergeCartItem,
  productToCartItem,
  removeCartItem,
  updateCartQuantity,
  type CartItem,
} from "@/lib/cart";
import type { Product } from "@/lib/products";

type CartStore = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addProduct: (product: Product, size: string, color: string, quantity?: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      addProduct: (product, size, color, quantity = 1) =>
        set((state) => ({
          items: mergeCartItem(state.items, productToCartItem(product, size, color, quantity)),
          isOpen: true,
        })),
      setQuantity: (id, quantity) =>
        set((state) => ({ items: updateCartQuantity(state.items, id, quantity) })),
      removeItem: (id) => set((state) => ({ items: removeCartItem(state.items, id) })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "silk-room-cart-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export function getCartSnapshot() {
  const state = useCartStore.getState();
  return {
    ...state,
    count: state.items.reduce((sum, item) => sum + item.quantity, 0),
    pricing: getCartPricing(state.items),
  };
}
