"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckoutStepper } from "@/components/store/CheckoutStepper";
import { PrepaidTrustBar } from "@/components/store/PrepaidTrustBar";
import { useCart } from "@/context/CartProvider";
import { CHECKOUT_ADDRESS_KEY, type CheckoutAddress } from "@/lib/checkout-shared";
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
  const [busy, setBusy] = useState(false);
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
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

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
    setBusy(true);
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
      setBusy(false);
    }
  }

  return (
    <article className="checkout-secure checkout-secure--premium">
      <CheckoutStepper step={3} />
      <header className="store-page-header checkout-secure-header">
        <p className="eyebrow">Secure checkout</p>
        <h1>Complete your order</h1>
        <p>
          Pay once, securely — powered by Razorpay. Your card and UPI details never touch our
          servers.
        </p>
      </header>

      <PrepaidTrustBar className="prepaid-trust-bar--checkout" />

      <div className="checkout-secure-grid">
        <section className="checkout-secure-main">
          <div className="pay-premium-card" aria-label="Payment method">
            <div className="pay-premium-badge">
              <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
                <path
                  d="M12 3 5 6v6c0 4.2 3 7.9 7 9 4-1.1 7-4.8 7-9V6l-7-3Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
              Razorpay secure payment
            </div>
            <h2>Pay {formatInr(prepaidTotal)}</h2>
            <p className="pay-premium-lede">
              UPI · Visa · Mastercard · RuPay · Netbanking · Wallets
            </p>
            <ul className="pay-premium-features">
              <li>Instant order confirmation</li>
              <li>Bank-grade encryption</li>
              <li>Dispatch from Surat in 24–48 hours</li>
              <li>{itemCount} item{itemCount === 1 ? "" : "s"} in this order</li>
            </ul>
          </div>

          {error ? <p className="checkout-error">{error}</p> : null}

          <button type="button" className="pay-cta pay-cta--premium" disabled={busy} onClick={payPrepaid}>
            {busy ? "Opening secure checkout…" : `Pay ${formatInr(prepaidTotal)} securely`}
          </button>
          <p className="pay-legal">
            By placing this order you agree to our <Link href="/terms">terms</Link> and{" "}
            <Link href="/shipping-returns">shipping & returns</Link>. GST invoice available on
            request.
          </p>
        </section>

        <aside className="checkout-summary checkout-summary--premium" aria-label="Order summary">
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
            <div className="is-total">
              <dt>To pay</dt>
              <dd>{formatInr(prepaidTotal)}</dd>
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
