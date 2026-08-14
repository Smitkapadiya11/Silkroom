"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/context/CartProvider";
import {
  buildWhatsAppOrderMessage,
  validateCheckout,
  type CheckoutDetails,
} from "@/lib/cart";
import { formatInr } from "@/lib/pricing";
import { whatsappUrl } from "@/lib/order";
import { products } from "@/lib/products";

const emptyDetails: CheckoutDetails = {
  name: "",
  phone: "",
  address: "",
  pincode: "",
  city: "",
  state: "",
};

export function CartDrawer() {
  const router = useRouter();
  const {
    items,
    pricing,
    isOpen,
    closeCart,
    setQuantity,
    removeItem,
    addProduct,
  } = useCart();
  const panel = useRef<HTMLDivElement>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [details, setDetails] = useState<CheckoutDetails>(emptyDetails);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutDetails, string>>>({});

  useEffect(() => {
    if (!isOpen) {
      setCheckoutOpen(false);
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKey);
    panel.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  const progress =
    pricing.nextRule && pricing.nextRule.minQty > 0
      ? Math.min(
          100,
          ((pricing.nextRule.minQty - pricing.itemsToNext) / pricing.nextRule.minQty) * 100,
        )
      : 100;

  const handlePlaceOrder = () => {
    const nextErrors = validateCheckout(details);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const message = buildWhatsAppOrderMessage(items, details, pricing);
    window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
    sessionStorage.setItem(
      "silk-last-order",
      JSON.stringify({ items, details, pricing, at: Date.now() }),
    );
    closeCart();
    router.push("/order-confirmed");
  };

  const suggestAdd = () => {
    const inCart = new Set(items.map((item) => item.slug));
    const candidate = products.find((product) => !inCart.has(product.slug));
    if (!candidate) return;
    addProduct(candidate, "M", candidate.colors[0]?.name ?? "Default", 1);
  };

  return (
    <div className="cart-drawer-backdrop" role="presentation" onMouseDown={closeCart}>
      <aside
        ref={panel}
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="cart-drawer-header">
          <h2>Your cart</h2>
          <button type="button" onClick={closeCart} aria-label="Close cart">
            ×
          </button>
        </header>

        {pricing.nextRule && pricing.itemsToNext > 0 ? (
          <div className="cart-upsell">
            <p>
              You&apos;re {pricing.itemsToNext} tee{pricing.itemsToNext > 1 ? "s" : ""} away from{" "}
              {pricing.nextRule.blurb}
            </p>
            <div className="cart-progress" aria-hidden="true">
              <span style={{ transform: `scaleX(${progress / 100})` }} />
            </div>
            <button type="button" className="button button-ghost" onClick={suggestAdd}>
              Add a tee
            </button>
          </div>
        ) : null}

        {items.length === 0 ? (
          <div className="cart-empty">
            <p>Your cart is empty.</p>
            <Link href="/shop" className="button button-primary" onClick={closeCart}>
              Browse the shop
            </Link>
          </div>
        ) : (
          <>
            <ul className="cart-lines">
              {items.map((item) => (
                <li key={item.id} className="cart-line">
                  <span className="cart-line-image aspect-product">
                    <Image src={item.image} alt="" fill sizes="80px" />
                  </span>
                  <div className="cart-line-body">
                    <p className="cart-line-name">{item.name}</p>
                    <p className="cart-line-variant">
                      {item.color} · Size {item.size}
                    </p>
                    <div className="cart-line-actions">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => setQuantity(item.id, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => setQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                      <button type="button" onClick={() => removeItem(item.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="cart-line-price">
                    {formatInr(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="cart-totals">
              <p>
                <span>Subtotal</span>
                <span>{formatInr(pricing.subtotal)}</span>
              </p>
              {pricing.discount > 0 ? (
                <p className="cart-discount">
                  <span>{pricing.rule?.label ?? "Combo saving"}</span>
                  <span>-{formatInr(pricing.discount)}</span>
                </p>
              ) : null}
              <p className="cart-total">
                <span>Total</span>
                <span>{formatInr(pricing.total)}</span>
              </p>
            </div>

            {!checkoutOpen ? (
              <button
                type="button"
                className="button button-primary cart-checkout-button"
                onClick={() => setCheckoutOpen(true)}
              >
                Checkout on WhatsApp
              </button>
            ) : (
              <form
                className="cart-checkout-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  handlePlaceOrder();
                }}
              >
                {(
                  [
                    ["name", "Full name"],
                    ["phone", "Phone (10 digits)"],
                    ["address", "Full address"],
                    ["city", "City"],
                    ["state", "State"],
                    ["pincode", "Pincode"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="cart-field">
                    <span>{label}</span>
                    <input
                      type={key === "phone" || key === "pincode" ? "tel" : "text"}
                      inputMode={key === "phone" || key === "pincode" ? "numeric" : "text"}
                      value={details[key]}
                      onChange={(event) =>
                        setDetails((current) => ({
                          ...current,
                          [key]: event.target.value,
                        }))
                      }
                      aria-invalid={Boolean(errors[key])}
                    />
                    {errors[key] ? <em>{errors[key]}</em> : null}
                  </label>
                ))}
                <button type="submit" className="button button-primary">
                  Place order on WhatsApp
                </button>
              </form>
            )}
          </>
        )}
      </aside>
    </div>
  );
}
