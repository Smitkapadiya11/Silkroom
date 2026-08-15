import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { customers, orders } from "@/db/schema";
import { normalizePhone } from "@/lib/admin/orders";
export default async function CustomerPage({ params }: { params: Promise<{ phone: string }> }) {
  const { phone } = await params; const normalized = normalizePhone(phone); const [customer] = await getDb().select().from(customers).where(eq(customers.phone, normalized)).limit(1); if (!customer) notFound();
  const rows = await getDb().select().from(orders).where(eq(orders.phone, normalized));
  return <section className="admin-page"><p><Link href="/admin/customers">← Customers</Link></p><h1>{customer.name}</h1><dl className="admin-kv"><dt>Phone</dt><dd>{customer.phone}</dd><dt>Email</dt><dd>{customer.email ?? "—"}</dd><dt>Orders</dt><dd>{customer.orderCount}</dd><dt>RTO</dt><dd>{customer.rtoCount}</dd></dl><h2>Orders</h2><table className="admin-table"><tbody>{rows.map((order) => <tr key={order.id}><td><Link href={`/admin/orders/${order.orderNumber}`}>{order.orderNumber}</Link></td><td>{order.status}</td><td>₹{order.totalInr}</td></tr>)}</tbody></table></section>;
}
