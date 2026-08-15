import Link from "next/link";
import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { customers } from "@/db/schema";
const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
export default async function CustomersPage() {
  const rows = await getDb().select().from(customers).orderBy(desc(customers.lastOrderAt)).limit(100);
  return <section className="admin-page"><h1>Customers</h1><table className="admin-table"><thead><tr><th>Name</th><th>Phone</th><th>Orders</th><th>LTV</th><th>Last order</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td><Link href={`/admin/customers/${row.phone}`}>{row.name}</Link></td><td>+91 {row.phone.slice(0, 5)} •••••</td><td>{row.orderCount}</td><td>{money.format(row.lifetimeValue)}</td><td>{row.lastOrderAt.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}</td></tr>)}</tbody></table></section>;
}
