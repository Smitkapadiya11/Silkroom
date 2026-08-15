"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
          Delivery details missing. <Link href="/checkout">Go back to checkout</Link>.
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
    <article className="policy-page checkout-page">
      <header className="store-page-header">
        <p className="eyebrow">Payment</p>
        <h1>How will you pay?</h1>
      </header>

      <div className="payment-options">
        <button type="button" className="payment-card" disabled={busy !== null} onClick={payPrepaid}>
          <span className="v2-kicker">Prepaid</span>
          <strong>{formatInr(prepaidTotal)}</strong>
          <span>{busy === "prepaid" ? "Opening Razorpay…" : "Pay securely with Razorpay"}</span>
        </button>
        <button type="button" className="payment-card" disabled={busy !== null} onClick={payCod}>
          <span className="v2-kicker">Cash on delivery</span>
          <strong>{formatInr(codTotal)}</strong>
          <span>Includes {formatInr(COD_FEE_INR)} COD handling fee</span>
          <span>{busy === "cod" ? "Placing order…" : "Place COD order"}</span>
        </button>
      </div>

      <p className="payment-trust">UPI · Cards · Netbanking via Razorpay. COD available nationwide.</p>
      {error ? <p className="is-flame">{error}</p> : null}
    </article>
  );
}
