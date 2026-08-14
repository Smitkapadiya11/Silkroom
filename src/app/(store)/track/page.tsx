import { OrderTrackingForm } from "@/components/checkout/OrderTrackingForm";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Track order",
  description: "Look up a Silk Room order by order number and phone.",
  path: "/track",
});

export default function TrackOrderPage() {
  return (
    <article className="policy-page checkout-page">
      <header className="store-page-header">
        <p className="eyebrow">Track</p>
        <h1>Find your order</h1>
        <p>Use SR-26-0001 style order numbers and the phone you checked out with.</p>
      </header>
      <OrderTrackingForm />
    </article>
  );
}
