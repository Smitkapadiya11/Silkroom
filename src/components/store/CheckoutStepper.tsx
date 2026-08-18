"use client";

import Link from "next/link";

export function CheckoutStepper({ step }: { step: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: "Cart", href: "/cart" },
    { n: 2, label: "Address", href: "/checkout" },
    { n: 3, label: "Payment", href: "/checkout/payment" },
  ] as const;

  return (
    <ol className="checkout-stepper" aria-label="Checkout steps">
      {steps.map((item) => (
        <li key={item.n} className={item.n === step ? "is-current" : item.n < step ? "is-done" : ""}>
          {item.n < step ? <Link href={item.href}>{item.label}</Link> : <span>{item.label}</span>}
        </li>
      ))}
    </ol>
  );
}
