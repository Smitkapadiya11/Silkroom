import Link from "next/link";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Fabric care",
  description:
    "How to wash and keep Silk Room ribbed zip polos — cold wash, no bleach, line dry.",
  path: "/care",
});

export default function CarePage() {
  return (
    <article className="policy-page">
      <header className="store-page-header">
        <p className="eyebrow">Care</p>
        <h1>Keep the rib honest</h1>
        <p>Simple habits so the knit stays soft and the zip runs clean.</p>
      </header>

      <section aria-labelledby="wash-title">
        <h2 id="wash-title">Wash</h2>
        <ul className="policy-list">
          <li>Turn inside out before washing.</li>
          <li>Cold machine wash, gentle cycle — or hand wash.</li>
          <li>Mild detergent only. No bleach, no fabric softener.</li>
          <li>Wash with similar colours; darks separately the first few times.</li>
        </ul>
      </section>

      <section aria-labelledby="dry-title">
        <h2 id="dry-title">Dry &amp; finish</h2>
        <ul className="policy-list">
          <li>Line dry in shade when you can — heat ages elastane.</li>
          <li>Low tumble only if needed; pull the hem straight while damp.</li>
          <li>Do not iron over the zip. Low heat on the fabric if required.</li>
          <li>Hang by the shoulders, not the collar, to keep the neckline shape.</li>
        </ul>
      </section>

      <section aria-labelledby="fabric-title">
        <h2 id="fabric-title">What you are wearing</h2>
        <p>
          Every polo is 220 GSM ribbed knit — 95% cotton, 5% elastane, pre-shrunk.
          Expect a small settle after the first wash; sizing stays true when you follow
          the care above.
        </p>
      </section>

      <p>
        Between sizes or unsure on fit? See the{" "}
        <Link href="/size-guide">size guide</Link> or{" "}
        <Link href="/contact">message us</Link> before you order.
      </p>
    </article>
  );
}
