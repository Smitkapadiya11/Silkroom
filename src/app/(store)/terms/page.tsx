import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Terms of service",
  description: "Terms for ordering Silk Room polos via WhatsApp.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <article className="policy-page prose-page">
      <header className="store-page-header">
        <h1>Terms of service</h1>
      </header>
      <p>Last updated: August 2026</p>
      <p>
        By placing an order with {site.name}, you agree to provide accurate contact and
        delivery details. Prices are in INR and include applicable combo discounts shown
        at checkout.
      </p>
      <p>
        Orders are confirmed on WhatsApp. We reserve the right to cancel if an item is
        unavailable, with a full refund if payment was collected.
      </p>
      <p>
        Exchanges follow our {site.exchangeWindowDays}-day policy on unworn goods. See
        Shipping & returns for delivery timelines.
      </p>
    </article>
  );
}
