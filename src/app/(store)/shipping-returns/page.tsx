import Link from "next/link";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";
import { formatInr } from "@/lib/pricing";

export const metadata = createPageMetadata({
  title: "Shipping & returns",
  description:
    "Silk Room delivery timelines, shipping charges, free-shipping threshold, and 7-day exchange policy.",
  path: "/shipping-returns",
});

export default function ShippingReturnsPage() {
  return (
    <article className="policy-page">
      <header className="store-page-header">
        <p className="eyebrow">Delivery</p>
        <h1>Shipping & returns</h1>
      </header>

      <section aria-labelledby="delivery-title">
        <h2 id="delivery-title">Delivery timelines</h2>
        <ul className="policy-list">
          <li>Metro cities: 3–6 business days after dispatch</li>
          <li>Rest of India: 5–8 business days after dispatch</li>
          <li>Remote / NE regions: up to 10 business days</li>
        </ul>
        <p>You&apos;ll receive tracking on WhatsApp once the order ships.</p>
      </section>

      <section aria-labelledby="charges-title">
        <h2 id="charges-title">Shipping charges</h2>
        <p>
          Standard shipping applies on single-polo orders. Free shipping on orders above{" "}
          {formatInr(site.freeShippingThreshold)} {/* TODO: confirm threshold */}.
        </p>
      </section>

      <section aria-labelledby="returns-title">
        <h2 id="returns-title">Exchange window</h2>
        <p>
          {site.exchangeWindowDays}-day exchange on unworn polos with tags intact. Raise a
          request on <Link href="/contact">Contact</Link> with your order phone number.
        </p>
      </section>

      <section aria-labelledby="cod-title">
        <h2 id="cod-title">Cash on delivery</h2>
        <p>
          {site.codAvailable
            ? "COD is available on most pincodes. We'll confirm when you order on WhatsApp."
            : "COD availability varies by pincode — ask us before ordering."}
        </p>
      </section>
    </article>
  );
}
