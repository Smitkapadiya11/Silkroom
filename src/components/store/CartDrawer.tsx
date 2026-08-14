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
import { isWhatsAppOrderingAvailable, whatsappUrl } from "@/lib/order";
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
  const [isPaying, setIsPaying] = useState(false);
  const whatsappAvailable = isWhatsAppOrderingAvailable();
  const razorpayAvailable = Boolean(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);

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
    const href = whatsappUrl(message);
    if (!href) return;
    window.open(href, "_blank", "noopener,noreferrer");
    sessionStorage.setItem(
      "silk-last-order",
      JSON.stringify({ items, details, pricing, at: Date.now() }),
    );
    closeCart();
    router.push("/order-confirmed");
  };

  const handleRazorpay = async () => {
    const nextErrors = validateCheckout(details);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || !razorpayAvailable) return;

    setIsPaying(true);
    try {
      const response = await fetch("/api/payments/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, details }),
      });
      const order = (await response.json()) as
        | { error: string }
        | { id: string; amount: number; currency: string; keyId: string };
      if (!response.ok || !("id" in order)) {
        throw new Error("error" in order ? order.error : "Unable to start payment.");
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      await new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Could not load Razorpay."));
        document.body.appendChild(script);
      });

      const RazorpayCheckout = window.Razorpay;
      if (!RazorpayCheckout) throw new Error("Razorpay checkout unavailable.");
      const checkout = new RazorpayCheckout({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Silk Room",
        description: "Silk Room polos",
        order_id: order.id,
        prefill: { name: details.name, contact: details.phone },
        notes: { pincode: details.pincode },
        handler: async (payment) => {
          const verify = await fetch("/api/payments/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payment),
          });
          if (!verify.ok) {
            setErrors({ address: "Payment could not be verified. Please contact us." });
            return;
          }
          sessionStorage.setItem(
            "silk-last-order",
            JSON.stringify({ items, details, pricing, at: Date.now(), payment: "razorpay" }),
          );
          closeCart();
          router.push("/order-confirmed");
        },
      });
      checkout.open();
    } catch (error) {
      setErrors({
        address: error instanceof Error ? error.message : "Unable to start payment.",
      });
    } finally {
      setIsPaying(false);
    }
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
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={!whatsappAvailable}
                >
                  {whatsappAvailable ? "Place order on WhatsApp" : "Ordering unavailable"}
                </button>
                <button
                  type="button"
                  className="button button-ghost"
                  disabled={!razorpayAvailable || isPaying}
                  onClick={handleRazorpay}
                >
                  {razorpayAvailable ? (isPaying ? "Opening Razorpay…" : "Pay securely with Razorpay") : "Razorpay unavailable"}
                </button>
              </form>
            )}
          </>
        )}
      </aside>
    </div>
  );
}
