"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { getCartPricing, type CartItem } from "@/lib/cart";
import type { Product } from "@/lib/products";
import { useCartStore } from "@/store/cart";

type CartContextValue = {
  items: CartItem[];
  count: number;
  pricing: ReturnType<typeof getCartPricing>;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addProduct: (
    product: Product,
    size: string,
    color: string,
    quantity?: number,
    options?: { open?: boolean },
  ) => void;
  setQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useCartStore((state) => state.items);
  const isOpen = useCartStore((state) => state.isOpen);
  const openCart = useCartStore((state) => state.openCart);
  const closeCart = useCartStore((state) => state.closeCart);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const addProduct = useCartStore((state) => state.addProduct);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const value = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const pricing = getCartPricing(items);
    return {
      items,
      count,
      pricing,
      isOpen,
      openCart,
      closeCart,
      toggleCart,
      addProduct,
      setQuantity,
      removeItem,
      clearCart,
    };
  }, [
    items,
    isOpen,
    openCart,
    closeCart,
    toggleCart,
    addProduct,
    setQuantity,
    removeItem,
    clearCart,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
