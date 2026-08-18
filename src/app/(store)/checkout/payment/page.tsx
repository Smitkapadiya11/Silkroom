"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CheckoutStepper } from "@/components/store/CheckoutStepper";
import { useCart } from "@/context/CartProvider";
import {
  CHECKOUT_ADDRESS_KEY,
  COD_FEE_INR,
  type CheckoutAddress,
} from "@/lib/checkout-shared";
import { formatInr } from "@/lib/pricing";

function loadRazorpay() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PaymentPage() {
  const router = useRouter();
  const { items, pricing, clearCart } = useCart();
  const [address, setAddress] = useState<CheckoutAddress | null>(null);
  const [method, setMethod] = useState<"prepaid" | "cod">("prepaid");
  const [busy, setBusy] = useState<"prepaid" | "cod" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(CHECKOUT_ADDRESS_KEY);
      setAddress(raw ? (JSON.parse(raw) as CheckoutAddress) : null);
    } catch {
      setAddress(null);
    }
  }, []);

  const prepaidTotal = pricing.total;
  const codTotal = useMemo(() => pricing.total + COD_FEE_INR, [pricing.total]);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const payTotal = method === "cod" ? codTotal : prepaidTotal;

  if (items.length === 0) {
    return (
      <article className="policy-page">
        <h1>Payment</h1>
        <p>
          Cart is empty. <Link href="/shop">Shop polos</Link>.
        </p>
      </article>
    );
  }

  if (!address) {
    return (
      <article className="policy-page">
        <h1>Payment</h1>
        <p>
          Delivery details missing. <Link href="/checkout">Go back to address</Link>.
        </p>
      </article>
    );
  }

  const payloadItems = items.map((item) => ({
    slug: item.slug,
    size: item.size,
    color: item.color,
    quantity: item.quantity,
  }));

  async function payPrepaid() {
    setBusy("prepaid");
    setError(null);
    try {
      const ready = await loadRazorpay();
      if (!ready || !window.Razorpay) {
        throw new Error("Could not load Razorpay Checkout.");
      }
      const response = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payloadItems, address }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not create order.");

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay!({
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          name: "Silk Room",
          description: `Order ${data.orderNumber}`,
          order_id: data.razorpayOrderId,
          prefill: {
            name: address!.name,
            contact: address!.phone,
            email: address!.email || undefined,
          },
          handler: async (payment: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            try {
              const verify = await fetch("/api/checkout/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...payment,
                  orderNumber: data.orderNumber,
                }),
              });
              const verified = await verify.json();
              if (!verify.ok) throw new Error(verified.error ?? "Verification failed.");
              clearCart();
              window.sessionStorage.removeItem(CHECKOUT_ADDRESS_KEY);
              router.push(`/order/${verified.orderNumber}`);
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          modal: {
            ondismiss: () => reject(new Error("Payment cancelled.")),
          },
        });
        rzp.open();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed.");
    } finally {
      setBusy(null);
    }
  }

  async function payCod() {
    setBusy("cod");
    setError(null);
    try {
      const response = await fetch("/api/checkout/cod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payloadItems, address }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not place COD order.");
      clearCart();
      window.sessionStorage.removeItem(CHECKOUT_ADDRESS_KEY);
      router.push(`/order/${data.orderNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "COD failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <article className="checkout-secure">
      <CheckoutStepper step={3} />
      <header className="store-page-header">
        <p className="eyebrow">Secure checkout</p>
        <h1>Choose payment</h1>
        <p>Pay online and save the COD fee, or pay cash when the parcel arrives.</p>
      </header>

      <div className="checkout-secure-grid">
        <section className="checkout-secure-main">
          <fieldset className="pay-methods" disabled={busy !== null}>
            <legend>Payment method</legend>
            <label className={`pay-method${method === "prepaid" ? " is-selected" : ""}`}>
              <input
                type="radio"
                name="pay"
                checked={method === "prepaid"}
                onChange={() => setMethod("prepaid")}
              />
              <span>
                <strong>Pay now · UPI / Card / Netbanking</strong>
                <em>Recommended · Razorpay secure checkout</em>
              </span>
              <b>{formatInr(prepaidTotal)}</b>
            </label>
            <label className={`pay-method${method === "cod" ? " is-selected" : ""}`}>
              <input type="radio" name="pay" checked={method === "cod"} onChange={() => setMethod("cod")} />
              <span>
                <strong>Cash on delivery</strong>
                <em>Pay at your door · {formatInr(COD_FEE_INR)} handling fee</em>
              </span>
              <b>{formatInr(codTotal)}</b>
            </label>
          </fieldset>

          <div className="pay-trust-grid" aria-label="Why this checkout is safe">
            <p>Razorpay encrypted pay</p>
            <p>UPI · Cards · Netbanking</p>
            <p>7-day size exchange</p>
            <p>Packed in Surat</p>
          </div>

          {error ? <p className="checkout-error">{error}</p> : null}

          <button
            type="button"
            className="pay-cta"
            disabled={busy !== null}
            onClick={() => (method === "prepaid" ? payPrepaid() : payCod())}
          >
            {busy
              ? busy === "prepaid"
                ? "Opening Razorpay…"
                : "Placing COD order…"
              : method === "prepaid"
                ? `Pay ${formatInr(payTotal)} securely`
                : `Place COD order · ${formatInr(payTotal)}`}
          </button>
          <p className="pay-legal">
            By placing this order you agree to our <Link href="/terms">terms</Link> and{" "}
            <Link href="/shipping-returns">shipping & returns</Link>.
          </p>
        </section>

        <aside className="checkout-summary" aria-label="Order summary">
          <h2>Order summary</h2>
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                <span className="checkout-summary-thumb aspect-product">
                  <Image src={item.image} alt="" fill sizes="56px" />
                </span>
                <span>
                  <strong>
                    {item.quantity}× {item.name}
                  </strong>
                  <em>
                    Size {item.size} · {item.color}
                  </em>
                </span>
                <b>{formatInr(item.price * item.quantity)}</b>
              </li>
            ))}
          </ul>
          <dl>
            <div>
              <dt>Price ({itemCount} items)</dt>
              <dd>{formatInr(pricing.subtotal)}</dd>
            </div>
            {pricing.discount > 0 ? (
              <div className="is-save">
                <dt>{pricing.rule?.label ?? "Offer"}</dt>
                <dd>-{formatInr(pricing.discount)}</dd>
              </div>
            ) : (
              <div>
                <dt>Offer</dt>
                <dd>Add more for 3 @ ₹799</dd>
              </div>
            )}
            {method === "cod" ? (
              <div>
                <dt>COD fee</dt>
                <dd>{formatInr(COD_FEE_INR)}</dd>
              </div>
            ) : null}
            <div className="is-total">
              <dt>To pay</dt>
              <dd>{formatInr(payTotal)}</dd>
            </div>
          </dl>
          <p className="checkout-ship-to">
            Deliver to <strong>{address.name}</strong>, {address.city} {address.pincode}
            <Link href="/checkout">Change</Link>
          </p>
        </aside>
      </div>
    </article>
  );
}
