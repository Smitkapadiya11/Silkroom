"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CART_STORAGE_KEY,
  getCartPricing,
  mergeCartItem,
  removeCartItem,
  updateCartQuantity,
  type CartItem,
} from "@/lib/cart";
import type { Product } from "@/lib/products";
import { productToCartItem } from "@/lib/cart";

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
  ) => void;
  setQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setItems(readStoredCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addProduct = useCallback(
    (product: Product, size: string, color: string, quantity = 1) => {
      setItems((current) =>
        mergeCartItem(current, productToCartItem(product, size, color, quantity)),
      );
      setIsOpen(true);
    },
    [],
  );

  const setQuantity = useCallback((id: string, quantity: number) => {
    setItems((current) => updateCartQuantity(current, id, quantity));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) => removeCartItem(current, id));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const pricing = getCartPricing(items);
    return {
      items,
      count,
      pricing,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      toggleCart: () => setIsOpen((open) => !open),
      addProduct,
      setQuantity,
      removeItem,
      clearCart,
    };
  }, [items, isOpen, addProduct, setQuantity, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
