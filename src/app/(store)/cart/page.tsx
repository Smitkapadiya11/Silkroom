"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartProvider";
import { formatInr } from "@/lib/pricing";

export default function CartPage() {
  const { items, pricing, setQuantity, removeItem } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <article className="policy-page checkout-page meesho-cart-page">
      <header className="store-page-header">
        <p className="eyebrow">Cart</p>
        <h1>My cart ({itemCount})</h1>
      </header>

      {!items.length ? (
        <div className="cart-empty">
          <p>Your cart is empty.</p>
          <Link href="/shop" className="button button-primary">
            Start shopping
          </Link>
        </div>
      ) : (
        <>
          <ul className="cart-lines checkout-lines meesho-cart-lines">
            {items.map((item) => (
              <li key={item.id} className="cart-line meesho-cart-line">
                <Link href={`/product/${item.slug}`} className="cart-line-image aspect-product">
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
                      onClick={() => setQuantity(item.id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
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
              <span>Price ({itemCount} items)</span>
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

          <div className="meesho-cart-bar meesho-cart-bar--page">
            <div>
              <span>{formatInr(pricing.total)}</span>
              <small>incl. offers · COD available</small>
            </div>
            <Link href="/checkout" className="meesho-place-order">
              Place order
            </Link>
          </div>
        </>
      )}
    </article>
  );
}
