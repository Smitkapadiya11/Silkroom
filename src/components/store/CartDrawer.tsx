"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCart } from "@/context/CartProvider";
import { formatInr } from "@/lib/pricing";

export function CartDrawer() {
  const { items, pricing, isOpen, closeCart, setQuantity, removeItem } = useCart();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKey);
    panel.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  return (
    <div className="cart-drawer-backdrop" role="presentation" onMouseDown={closeCart}>
      <aside
        ref={panel}
        className="cart-drawer meesho-cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="cart-drawer-header">
          <h2>My cart ({items.length})</h2>
          <button type="button" onClick={closeCart} aria-label="Close cart">
            ×
          </button>
        </header>

        {items.length === 0 ? (
          <div className="cart-empty">
            <p>Your cart is empty.</p>
            <Link href="/shop" className="button button-primary" onClick={closeCart}>
              Start shopping
            </Link>
          </div>
        ) : (
          <>
            <ul className="cart-lines">
              {items.map((item) => (
                <li key={item.id} className="cart-line meesho-cart-line">
                  <Link href={`/product/${item.slug}`} className="cart-line-image aspect-product" onClick={closeCart}>
                    <Image src={item.image} alt="" fill sizes="80px" />
                  </Link>
                  <div className="cart-line-body">
                    <p className="cart-line-name">{item.name}</p>
                    <p className="cart-line-variant">
                      Size {item.size} · {item.color}
                    </p>
                    <p className="cart-line-price">{formatInr(item.price * item.quantity)}</p>
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
                      <button type="button" className="cart-line-remove" onClick={() => removeItem(item.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="meesho-cart-summary">
              <p>
                <span>Price ({items.reduce((n, i) => n + i.quantity, 0)} items)</span>
                <span>{formatInr(pricing.subtotal)}</span>
              </p>
              {pricing.discount > 0 ? (
                <p className="cart-discount">
                  <span>Offer discount</span>
                  <span>-{formatInr(pricing.discount)}</span>
                </p>
              ) : null}
              <p className="cart-total">
                <span>Total amount</span>
                <span>{formatInr(pricing.total)}</span>
              </p>
            </div>

            <div className="meesho-cart-bar meesho-cart-bar--drawer">
              <div>
                <span>{formatInr(pricing.total)}</span>
                <small>incl. offers</small>
              </div>
              <Link href="/checkout" className="meesho-place-order" onClick={closeCart}>
                Place order
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
