"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCart } from "@/context/CartProvider";
import { formatInr } from "@/lib/pricing";
import { products } from "@/lib/products";

export function CartDrawer() {
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

  useEffect(() => {
    if (!isOpen) {
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
              You&apos;re {pricing.itemsToNext} polo{pricing.itemsToNext > 1 ? "s" : ""} away from{" "}
              {pricing.nextRule.blurb}
            </p>
            <div className="cart-progress" aria-hidden="true">
              <span style={{ transform: `scaleX(${progress / 100})` }} />
            </div>
            <button type="button" className="button button-ghost" onClick={suggestAdd}>
              Add a polo
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

            <div className="cart-checkout-form">
              <Link
                href="/checkout"
                className="button button-primary cart-checkout-button"
                onClick={closeCart}
              >
                Continue to secure checkout
              </Link>
              <Link href="/cart" className="button button-ghost" onClick={closeCart}>
                View full cart
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
