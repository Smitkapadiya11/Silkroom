import Link from "next/link";
import { createPageMetadata } from "@/lib/metadata";
import { WhatsAppOrderLink } from "@/components/store/WhatsAppOrderLink";
import { orderBrowseMessage } from "@/lib/order";
import { resolveStoreContact } from "@/lib/store-contact";
import { getStoreSettings } from "@/lib/store-settings";
import { site } from "@/lib/site";
import { formatInr } from "@/lib/pricing";

export const metadata = createPageMetadata({
  title: "How to order",
  description:
    "How to buy Silk Room polos — cart, checkout, COD, and combo pricing.",
  path: "/how-to-order",
});

export default async function HowToOrderPage() {
  const settings = await getStoreSettings();
  const contact = resolveStoreContact(settings);

  return (
    <article className="policy-page">
      <header className="store-page-header">
        <p className="eyebrow">Ordering</p>
        <h1>How to order</h1>
        <p>Four short steps from colour pick to doorstep.</p>
      </header>

      <ol className="policy-list how-to-order-steps">
        <li>
          <strong>Pick your polos.</strong> Browse{" "}
          <Link href="/shop">Shop</Link> — use the combo builder or add singles from the
          grid. Choose size on each product.
        </li>
        <li>
          <strong>Add to cart.</strong> Mix any colours — 3 polos for{" "}
          {formatInr(settings.combo3PriceInr)}, 5 for {formatInr(settings.combo5PriceInr)}.
          The cart shows how many more you need for the offer.
        </li>
        <li>
          <strong>Checkout online.</strong> Enter your address, then pay with UPI/card or
          choose COD ({site.codAvailable ? "available on most pincodes" : "where offered"}).
        </li>
        <li>
          <strong>Track your order.</strong> Use the order number on{" "}
          <Link href="/track">Track</Link> or message us on WhatsApp during{" "}
          {contact.responseHours}.
        </li>
      </ol>

      <section aria-labelledby="direct-title">
        <h2 id="direct-title">Prefer a direct message?</h2>
        <p>
          Skip the cart and message us with the colours and sizes you want. We will
          confirm availability and total before you pay.
        </p>
        <p>
          <WhatsAppOrderLink message={orderBrowseMessage()}>
            Message {contact.phone}
          </WhatsAppOrderLink>
        </p>
      </section>

      <p>
        Still reading first? See our <Link href="/guarantee">guarantee</Link>,{" "}
        <Link href="/size-guide">size guide</Link>, and{" "}
        <Link href="/shipping-returns">shipping &amp; returns</Link>.
      </p>
    </article>
  );
}
