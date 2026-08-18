"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckoutStepper } from "@/components/store/CheckoutStepper";
import { useCart } from "@/context/CartProvider";
import {
  CHECKOUT_ADDRESS_KEY,
  checkoutAddressSchema,
  type CheckoutAddress,
} from "@/lib/checkout-shared";
import { formatInr } from "@/lib/pricing";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, pricing } = useCart();
  const form = useForm<CheckoutAddress>({
    resolver: zodResolver(checkoutAddressSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
    },
  });

  if (items.length === 0) {
    return (
      <article className="policy-page">
        <h1>Checkout</h1>
        <p>
          Your cart is empty. <Link href="/shop">Browse polos</Link>.
        </p>
      </article>
    );
  }

  return (
    <article className="policy-page checkout-page">
      <CheckoutStepper step={2} />
      <header className="store-page-header">
        <p className="eyebrow">Checkout</p>
        <h1>Delivery address</h1>
        <p>Cart total {formatInr(pricing.total)}. Payment is next — UPI, card, or cash on delivery.</p>
      </header>

      <form
        className="checkout-form"
        onSubmit={form.handleSubmit((values) => {
          window.sessionStorage.setItem(CHECKOUT_ADDRESS_KEY, JSON.stringify(values));
          router.push("/checkout/payment");
        })}
      >
        <label>
          <span>Name</span>
          <input {...form.register("name")} autoComplete="name" />
          {form.formState.errors.name ? <em>{form.formState.errors.name.message}</em> : null}
        </label>
        <label>
          <span>Phone</span>
          <input {...form.register("phone")} inputMode="tel" autoComplete="tel" />
          {form.formState.errors.phone ? <em>{form.formState.errors.phone.message}</em> : null}
        </label>
        <label>
          <span>Email (optional)</span>
          <input {...form.register("email")} inputMode="email" autoComplete="email" />
        </label>
        <label>
          <span>Address</span>
          <textarea {...form.register("addressLine1")} rows={3} autoComplete="street-address" />
          {form.formState.errors.addressLine1 ? (
            <em>{form.formState.errors.addressLine1.message}</em>
          ) : null}
        </label>
        <label>
          <span>Apartment / landmark</span>
          <input {...form.register("addressLine2")} />
        </label>
        <div className="checkout-form-row">
          <label>
            <span>City</span>
            <input {...form.register("city")} autoComplete="address-level2" />
          </label>
          <label>
            <span>State</span>
            <input {...form.register("state")} autoComplete="address-level1" />
          </label>
          <label>
            <span>Pincode</span>
            <input {...form.register("pincode")} inputMode="numeric" autoComplete="postal-code" />
          </label>
        </div>
        <button type="submit" className="v2-button v2-button--ink">
          Continue to payment
        </button>
        <p className="pay-legal">Your address is used only to pack and ship this order from Surat.</p>
      </form>
    </article>
  );
}
