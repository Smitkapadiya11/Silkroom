import {
  calculateCartPricing,
  formatInr,
  type CartLine,
  type PricingResult,
} from "@/lib/pricing";
import type { Product } from "@/lib/products";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  image: string;
};

export type CheckoutDetails = {
  name: string;
  phone: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
};

export const CART_STORAGE_KEY = "silk-room-cart-v1";

export function createCartItemId(slug: string, size: string, color: string) {
  return `${slug}::${size}::${color}`;
}

export function productToCartItem(
  product: Product,
  size: string,
  color: string,
  quantity = 1,
): CartItem {
  return {
    id: createCartItemId(product.slug, size, color),
    slug: product.slug,
    name: product.name,
    size,
    color,
    price: product.price,
    quantity,
    image: product.image,
  };
}

export function cartLinesFromItems(items: CartItem[]): CartLine[] {
  return items.map((item) => ({
    slug: item.slug,
    price: item.price,
    quantity: item.quantity,
  }));
}

export function getCartPricing(items: CartItem[]): PricingResult {
  return calculateCartPricing(cartLinesFromItems(items));
}

export function mergeCartItem(items: CartItem[], next: CartItem) {
  const existing = items.find((item) => item.id === next.id);
  if (!existing) return [...items, next];
  return items.map((item) =>
    item.id === next.id
      ? { ...item, quantity: item.quantity + next.quantity }
      : item,
  );
}

export function updateCartQuantity(items: CartItem[], id: string, quantity: number) {
  if (quantity <= 0) return items.filter((item) => item.id !== id);
  return items.map((item) => (item.id === id ? { ...item, quantity } : item));
}

export function removeCartItem(items: CartItem[], id: string) {
  return items.filter((item) => item.id !== id);
}

export function validateCheckout(details: CheckoutDetails) {
  const errors: Partial<Record<keyof CheckoutDetails, string>> = {};
  if (!details.name.trim()) errors.name = "Name is required";
  if (!/^\d{10}$/.test(details.phone.replace(/\D/g, "").slice(-10))) {
    errors.phone = "Enter a valid 10-digit phone number";
  }
  if (!details.address.trim()) errors.address = "Address is required";
  if (!/^\d{6}$/.test(details.pincode.trim())) {
    errors.pincode = "Pincode must be 6 digits";
  }
  if (!details.city.trim()) errors.city = "City is required";
  if (!details.state.trim()) errors.state = "State is required";
  return errors;
}

export function buildWhatsAppOrderMessage(
  items: CartItem[],
  details: CheckoutDetails,
  pricing: PricingResult,
) {
  const lines = items.map(
    (item, index) =>
      `${index + 1}. ${item.name} · ${item.color} · Size ${item.size} · Qty ${item.quantity} · ${formatInr(item.price * item.quantity)}`,
  );

  const discountLine =
    pricing.discount > 0
      ? `\nCombo discount (${pricing.rule?.label ?? "Bundle"}): -${formatInr(pricing.discount)}`
      : "";

  return [
    "Hello Silk Room, I'd like to place an order from silkroom.shop:",
    "",
    ...lines,
    "",
    `Subtotal: ${formatInr(pricing.subtotal)}${discountLine}`,
    `Total: ${formatInr(pricing.total)}`,
    "",
    "Delivery address:",
    details.name,
    details.phone,
    `${details.address}`,
    `${details.city}, ${details.state} — ${details.pincode}`,
    "",
    "Please confirm availability and payment (COD/UPI). Thank you.",
  ].join("\n");
}

/** Reserved for a future Razorpay integration — totals stay in one place. */
export function getPayableAmount(items: CartItem[]) {
  return getCartPricing(items).total;
}
