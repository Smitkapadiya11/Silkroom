import Image from "next/image";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { getProduct } from "@/lib/products";
import { isUnpaidPrepaid } from "@/lib/commerce";
import { normalizeLegacyStatus } from "@/lib/admin/order-status";
import { OrderActions } from "./OrderActions";
import { ShippingSticker } from "./ShippingSticker";

type Props = { params: Promise<{ orderNumber: string }> };
const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default async function OrderPage({ params }: Props) {
  const { orderNumber } = await params;
  const [order] = await getDb()
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber.toUpperCase()))
    .limit(1);
  if (!order) notFound();
  const items = await getDb().select().from(orderItems).where(eq(orderItems.orderId, order.id));
  const address = [
    order.customerName,
    order.addressLine1,
    order.addressLine2,
    `${order.city}, ${order.state} ${order.pincode}`,
    order.phone,
  ]
    .filter(Boolean)
    .join("\n");
  const whatsApp = `https://wa.me/${order.phone
    .replace(/\D/g, "")
    .slice(-10)
    .replace(/^/, "91")}?text=${encodeURIComponent(
    `Hi ${order.customerName}, your Silk Room order ${order.orderNumber} is ${normalizeLegacyStatus(order.status)}.`,
  )}`;
  const unpaid = isUnpaidPrepaid(order);

  return (
    <section className="admin-page">
      <p>
        <Link href="/admin/orders">← Orders</Link>
      </p>
      <h1>
        {order.orderNumber}{" "}
        <span className="admin-status">{normalizeLegacyStatus(order.status)}</span>
      </h1>
      {unpaid ? (
        <p className="admin-muted">
          This prepaid checkout was started and not paid. It is not a live order.
        </p>
      ) : null}
      <div className="admin-detail-grid">
        <div>
          <div className="admin-card">
            <h2>Items</h2>
            {items.map((item) => {
              const product = getProduct(item.productSlug);
              return (
                <div key={item.id} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  {product ? <Image src={product.image} alt="" width={52} height={52} /> : null}
                  <span>
                    {item.productName}
                    <br />
                    <small>
                      {item.color} · {item.size} × {item.quantity}
                    </small>
                  </span>
                  <strong style={{ marginLeft: "auto" }}>{money.format(item.lineTotalInr)}</strong>
                </div>
              );
            })}
            <hr />
            <strong>Total {money.format(order.totalInr)}</strong>
          </div>
          <div className="admin-card">
            <h2>Customer & delivery</h2>
            <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{address}</pre>
            <a href={whatsApp} target="_blank">
              WhatsApp customer
            </a>
          </div>
          <div className="admin-card">
            <h2>Payment</h2>
            <p>{unpaid ? "Prepaid · unpaid" : order.paymentMethod}</p>
            {order.razorpayPaymentId ? (
              <a
                href={`https://dashboard.razorpay.com/app/payments/${order.razorpayPaymentId}`}
                target="_blank"
              >
                Open Razorpay payment
              </a>
            ) : null}
          </div>
        </div>
        <div>
          <OrderActions
            orderNumber={order.orderNumber}
            status={normalizeLegacyStatus(order.status)}
            address={address}
            awbNumber={order.awbNumber}
            courier={order.courier}
          />
          <div className="admin-card">
            <h2>Meesho-style sticker</h2>
            <ShippingSticker
              orderNumber={order.orderNumber}
              customerName={order.customerName}
              addressLine1={order.addressLine1}
              addressLine2={order.addressLine2}
              city={order.city}
              state={order.state}
              pincode={order.pincode}
              phone={order.phone}
              paymentMethod={order.paymentMethod}
              totalInr={order.totalInr}
              paid={!unpaid}
              items={items}
            />
            <p>
              <a href={`/api/admin/labels?orderNumber=${order.orderNumber}`}>Download label PDF</a>
              {" · "}
              <a href={`/api/admin/packing-slips?orderNumber=${order.orderNumber}`}>
                Download packing slip
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
