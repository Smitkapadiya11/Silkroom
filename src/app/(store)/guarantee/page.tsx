import Link from "next/link";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";
import { formatInr } from "@/lib/pricing";

export const metadata = createPageMetadata({
  title: "Our guarantee",
  description:
    "Silk Room quality promise — honest fabric, Made in India, COD, and a 7-day exchange.",
  path: "/guarantee",
});

export default function GuaranteePage() {
  return (
    <article className="policy-page">
      <header className="store-page-header">
        <p className="eyebrow">Promise</p>
        <h1>What we stand behind</h1>
        <p>Clear policies so you can order without guessing.</p>
      </header>

      <section aria-labelledby="quality-title">
        <h2 id="quality-title">Quality</h2>
        <ul className="policy-list">
          <li>220 GSM cotton-elastane rib, cut and finished in Surat.</li>
          <li>Pre-shrunk fabric; collar and zip checked before dispatch.</li>
          <li>Single polo price stays {formatInr(399)} — no fake MRP games.</li>
        </ul>
      </section>

      <section aria-labelledby="pay-title">
        <h2 id="pay-title">Payment you can trust</h2>
        <ul className="policy-list">
          <li>
            {site.codAvailable
              ? "Cash on delivery on most serviceable pincodes — confirmed on WhatsApp."
              : "Payment options confirmed on WhatsApp before dispatch."}
          </li>
          <li>UPI / bank transfer when you prefer prepaid.</li>
          <li>Razorpay checkout when online payment is enabled on the cart.</li>
        </ul>
      </section>

      <section aria-labelledby="exchange-title">
        <h2 id="exchange-title">{site.exchangeWindowDays}-day exchange</h2>
        <p>
          Unworn polos with tags intact can be exchanged within{" "}
          {site.exchangeWindowDays} days of delivery. Start on{" "}
          <Link href="/contact">Contact</Link> with your order phone number. Full
          timelines live on{" "}
          <Link href="/shipping-returns">Shipping &amp; returns</Link>.
        </p>
      </section>

      <section aria-labelledby="ship-title">
        <h2 id="ship-title">Shipping</h2>
        <p>
          Free shipping on orders above {formatInr(site.freeShippingThreshold)}. Metro
          delivery typically 3–6 business days after dispatch; rest of India 5–8 days.
          Tracking is shared on WhatsApp when the parcel leaves Surat.
        </p>
      </section>

      <section aria-labelledby="people-title">
        <h2 id="people-title">A real person replies</h2>
        <p>
          Orders and questions go to WhatsApp {site.whatsappDisplay} or{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a> during{" "}
          {site.responseHours}. No bots — we confirm stock, size, and payment ourselves.
        </p>
      </section>
    </article>
  );
}
