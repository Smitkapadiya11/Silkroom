"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartProvider";
import { formatInr } from "@/lib/pricing";

export default function CartPage() {
  const { items, pricing, setQuantity, removeItem } = useCart();

  return (
    <article className="policy-page checkout-page">
      <header className="store-page-header"><p className="eyebrow">Your selection</p><h1>Cart</h1></header>
      {!items.length ? <p>Your cart is empty. <Link href="/shop">Browse the shop</Link>.</p> : (
        <>
          <ul className="cart-lines checkout-lines">
            {items.map((item) => <li key={item.id} className="cart-line">
              <span className="cart-line-image aspect-product"><Image src={item.image} alt="" fill sizes="80px" /></span>
              <div className="cart-line-body"><p className="cart-line-name">{item.name}</p><p className="cart-line-variant">{item.color} · {item.size}</p>
                <div className="cart-line-actions"><button onClick={() => setQuantity(item.id, item.quantity - 1)} aria-label="Decrease quantity">−</button><span>{item.quantity}</span><button onClick={() => setQuantity(item.id, item.quantity + 1)} aria-label="Increase quantity">+</button><button onClick={() => removeItem(item.id)}>Remove</button></div>
              </div><p className="cart-line-price">{formatInr(item.price * item.quantity)}</p>
            </li>)}
          </ul>
          <div className="cart-totals"><p><span>Subtotal</span><span>{formatInr(pricing.subtotal)}</span></p>{pricing.discount ? <p className="cart-discount"><span>Combo saving</span><span>-{formatInr(pricing.discount)}</span></p> : null}<p className="cart-total"><span>Total</span><span>{formatInr(pricing.total)}</span></p></div>
          <Link className="button button-primary" href="/checkout">Continue to checkout</Link>
        </>
      )}
    </article>
  );
}
