import Link from "next/link";
import { createPageMetadata } from "@/lib/metadata";
import { WhatsAppOrderLink } from "@/components/store/WhatsAppOrderLink";
import { orderBrowseMessage } from "@/lib/order";
import { site } from "@/lib/site";
import { formatInr } from "@/lib/pricing";

export const metadata = createPageMetadata({
  title: "How to order",
  description:
    "How to buy Silk Room polos — cart, WhatsApp checkout, COD, and combo pricing.",
  path: "/how-to-order",
});

export default function HowToOrderPage() {
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
          <Link href="/shop">Shop</Link> or ready{" "}
          <Link href="/combos">Combos</Link>. Choose size on each product.
        </li>
        <li>
          <strong>Add to cart.</strong> Mix any colours — 3 polos for{" "}
          {formatInr(799)}, 5 for {formatInr(1299)}. The cart applies the best tier
          automatically.
        </li>
        <li>
          <strong>Checkout on WhatsApp.</strong> Open the cart and tap order. We confirm
          stock, address, and payment (
          {site.codAvailable ? "COD or prepaid" : "prepaid"}).
        </li>
        <li>
          <strong>Track on the same chat.</strong> Tracking arrives when we ship. Reply
          anytime during {site.responseHours}.
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
            Message {site.whatsappDisplay}
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
