import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { inventory, orders } from "@/db/schema";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
export default async function AdminOverview() {
  const db = getDb(); const now = new Date(); const ago = (days: number) => new Date(now.getTime() - days * 86400000);
  const [statusRows, lowStock, today, week, month, previousWeek] = await Promise.all([
    db.select({ status: orders.status, count: sql<number>`count(*)::int` }).from(orders).groupBy(orders.status),
    db.select({ count: sql<number>`count(*)::int` }).from(inventory).where(sql`${inventory.quantity} <= ${inventory.lowStockThreshold}`),
    db.select({ count: sql<number>`count(*)::int`, revenue: sql<number>`coalesce(sum(${orders.totalInr}),0)::int` }).from(orders).where(sql`${orders.createdAt} >= ${ago(1)}`),
    db.select({ count: sql<number>`count(*)::int`, revenue: sql<number>`coalesce(sum(${orders.totalInr}),0)::int` }).from(orders).where(sql`${orders.createdAt} >= ${ago(7)}`),
    db.select({ count: sql<number>`count(*)::int`, revenue: sql<number>`coalesce(sum(${orders.totalInr}),0)::int` }).from(orders).where(sql`${orders.createdAt} >= ${ago(30)}`),
    db.select({ revenue: sql<number>`coalesce(sum(${orders.totalInr}),0)::int` }).from(orders).where(sql`${orders.createdAt} >= ${ago(14)} and ${orders.createdAt} < ${ago(7)}`),
  ]);
  const statuses = new Map(statusRows.map((row) => [row.status, row.count]));
  const cards = [["Pending confirmation", statuses.get("pending") ?? 0], ["Confirmed not packed", statuses.get("confirmed") ?? 0], ["Packed not dispatched", statuses.get("packed") ?? 0], ["Low stock", lowStock[0]?.count ?? 0], ["Prepaid pending/failed", 0]];
  const metric = (label: string, row: { count: number; revenue: number }, change?: number) => <div className="admin-card" key={label}><span>{label}</span><strong>{money.format(row.revenue)}</strong><span>{row.count} orders{change !== undefined ? ` · ${change >= 0 ? "+" : ""}${change}% vs prior` : ""}</span></div>;
  const weekChange = previousWeek[0]?.revenue ? Math.round(((week[0].revenue - previousWeek[0].revenue) / previousWeek[0].revenue) * 100) : 0;
  return <section className="admin-page"><h1>Overview</h1><h2>Action queue</h2><div className="admin-grid">{cards.map(([label, value]) => <div className="admin-card" key={String(label)}><span>{label}</span><strong>{value}</strong></div>)}</div><h2>Revenue (Asia/Kolkata operational day)</h2><div className="admin-grid">{metric("Today", today[0])}{metric("Last 7 days", week[0], weekChange)}{metric("Last 30 days", month[0])}</div><h2>Status counts</h2><table className="admin-table"><thead><tr><th>Status</th><th>Orders</th></tr></thead><tbody>{statusRows.map((row) => <tr key={row.status}><td>{row.status}</td><td>{row.count}</td></tr>)}</tbody></table></section>;
}
