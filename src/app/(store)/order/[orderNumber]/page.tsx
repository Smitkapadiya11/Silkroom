import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { createPageMetadata } from "@/lib/metadata";
import { hasOrderAccess } from "@/lib/order-access";
import { formatInr } from "@/lib/pricing";
import { whatsappUrl } from "@/lib/order";
import { site } from "@/lib/site";

type Props = { params: Promise<{ orderNumber: string }> };

export async function generateMetadata({ params }: Props) {
  const { orderNumber } = await params;
  return createPageMetadata({
    title: `Order ${orderNumber}`,
    description: `Silk Room order confirmation.`,
    path: `/order/${orderNumber}`,
    noIndex: true,
  });
}

export default async function OrderPage({ params }: Props) {
  const { orderNumber } = await params;
  const normalised = orderNumber.toUpperCase();

  if (!isDatabaseConfigured()) {
    return (
      <article className="policy-page">
        <h1>Order {normalised}</h1>
        <p>Order lookup needs DATABASE_URL. Message us on WhatsApp with your order number.</p>
      </article>
    );
  }

  const allowed = await hasOrderAccess(normalised);
  if (!allowed) {
    return (
      <article className="policy-page">
        <header className="store-page-header">
          <p className="eyebrow">Protected</p>
          <h1>Verify to view this order</h1>
        </header>
        <p>
          For your privacy, order details open only after checkout or after you confirm the
          order number with the phone used at purchase.
        </p>
        <p>
          <Link className="v2-button v2-button--ink" href="/track">
            Track with order number + phone
          </Link>
        </p>
      </article>
    );
  }

  const db = getDb();
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, normalised))
    .limit(1);
  if (!order) notFound();

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  const dispatchNote =
    order.paymentMethod === "cod"
      ? "We will confirm COD and dispatch in 24–48 hours."
      : "Payment received. We pack and dispatch in 24–48 hours.";
  const wa = whatsappUrl(
    `Hello Silk Room, I placed order ${order.orderNumber}. Total ${formatInr(order.totalInr)}.`,
  );

  return (
    <article className="policy-page checkout-page">
      <header className="store-page-header">
        <p className="eyebrow">Order confirmed</p>
        <h1>{order.orderNumber}</h1>
        <p>
          Status: <strong>{order.status.replace("_", " ")}</strong>
        </p>
      </header>

      <dl className="v2-receipt">
        <div>
          <dt>Payment</dt>
          <dd>{order.paymentMethod === "cod" ? "Cash on delivery" : "Prepaid (Razorpay)"}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>{formatInr(order.totalInr)}</dd>
        </div>
        <div>
          <dt>Ship to</dt>
          <dd>
            {order.customerName}, {order.city} {order.pincode}
          </dd>
        </div>
        <div>
          <dt>Next</dt>
          <dd>{dispatchNote}</dd>
        </div>
      </dl>

      <ul className="policy-list">
        {items.map((item) => (
          <li key={item.id}>
            {item.productName} · {item.color} · {item.size} × {item.quantity} —{" "}
            {formatInr(item.lineTotalInr)}
          </li>
        ))}
      </ul>

      <p>
        {wa ? (
          <a className="v2-button v2-button--ink" href={wa} target="_blank" rel="noreferrer">
            Message us about this order
          </a>
        ) : (
          <a className="v2-button v2-button--ink" href={`mailto:${site.email}`}>
            Email {site.email}
          </a>
        )}
      </p>
      <p>
        <Link href="/track">Track another order</Link> · <Link href="/shop">Keep shopping</Link>
      </p>
    </article>
  );
}
