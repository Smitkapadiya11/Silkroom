import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { inventory, orders } from "@/db/schema";
import { istDayStart, unpaidPrepaidClause } from "@/lib/commerce";

export const preferredRegion = "icn1";
export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

type MetricRow = {
  pending_confirm: number;
  confirmed: number;
  packed: number;
  prepaid_unpaid: number;
  today_orders: number;
  today_revenue: number;
  week_orders: number;
  week_revenue: number;
  month_orders: number;
  month_revenue: number;
  prior_week_revenue: number;
};

export default async function AdminOverview() {
  const db = getDb();
  const today = istDayStart(0);
  const week = istDayStart(7);
  const month = istDayStart(30);
  const priorWeek = istDayStart(14);

  const [[metrics], [lowStock], statusRows] = await Promise.all([
    db.execute(sql`
      select
        count(*) filter (where status = 'pending' and not ${unpaidPrepaidClause})::int as pending_confirm,
        count(*) filter (where status = 'confirmed')::int as confirmed,
        count(*) filter (where status = 'packed')::int as packed,
        count(*) filter (where ${unpaidPrepaidClause})::int as prepaid_unpaid,
        count(*) filter (where created_at >= ${today}::timestamptz and not ${unpaidPrepaidClause})::int as today_orders,
        coalesce(sum(total_inr) filter (where created_at >= ${today}::timestamptz and not ${unpaidPrepaidClause}), 0)::int as today_revenue,
        count(*) filter (where created_at >= ${week}::timestamptz and not ${unpaidPrepaidClause})::int as week_orders,
        coalesce(sum(total_inr) filter (where created_at >= ${week}::timestamptz and not ${unpaidPrepaidClause}), 0)::int as week_revenue,
        count(*) filter (where created_at >= ${month}::timestamptz and not ${unpaidPrepaidClause})::int as month_orders,
        coalesce(sum(total_inr) filter (where created_at >= ${month}::timestamptz and not ${unpaidPrepaidClause}), 0)::int as month_revenue,
        coalesce(sum(total_inr) filter (
          where created_at >= ${priorWeek}::timestamptz
            and created_at < ${week}::timestamptz
            and not ${unpaidPrepaidClause}
        ), 0)::int as prior_week_revenue
      from ${orders}
    `) as Promise<MetricRow[]>,
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(inventory)
      .where(sql`${inventory.quantity} <= ${inventory.lowStockThreshold}`),
    db
      .select({
        status: orders.status,
        count: sql<number>`count(*)::int`,
      })
      .from(orders)
      .where(sql`not ${unpaidPrepaidClause}`)
      .groupBy(orders.status),
  ]);

  const row = metrics ?? {
    pending_confirm: 0,
    confirmed: 0,
    packed: 0,
    prepaid_unpaid: 0,
    today_orders: 0,
    today_revenue: 0,
    week_orders: 0,
    week_revenue: 0,
    month_orders: 0,
    month_revenue: 0,
    prior_week_revenue: 0,
  };

  const weekChange = row.prior_week_revenue
    ? Math.round(((row.week_revenue - row.prior_week_revenue) / row.prior_week_revenue) * 100)
    : 0;

  const cards = [
    ["Pending confirmation", row.pending_confirm],
    ["Confirmed not packed", row.confirmed],
    ["Packed not dispatched", row.packed],
    ["Low stock", lowStock?.count ?? 0],
    ["Prepaid unpaid (not an order)", row.prepaid_unpaid],
  ];

  return (
    <section className="admin-page">
      <h1>Overview</h1>
      <h2>Action queue</h2>
      <div className="admin-grid">
        {cards.map(([label, value]) => (
          <div className="admin-card" key={String(label)}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <h2>Revenue (Asia/Kolkata, paid and COD only)</h2>
      <div className="admin-grid">
        <div className="admin-card">
          <span>Today</span>
          <strong>{money.format(row.today_revenue)}</strong>
          <span>{row.today_orders} orders</span>
        </div>
        <div className="admin-card">
          <span>Last 7 days</span>
          <strong>{money.format(row.week_revenue)}</strong>
          <span>
            {row.week_orders} orders · {weekChange >= 0 ? "+" : ""}
            {weekChange}% vs prior
          </span>
        </div>
        <div className="admin-card">
          <span>Last 30 days</span>
          <strong>{money.format(row.month_revenue)}</strong>
          <span>{row.month_orders} orders</span>
        </div>
      </div>
      <h2>Status counts</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Orders</th>
          </tr>
        </thead>
        <tbody>
          {statusRows.map((item) => (
            <tr key={item.status}>
              <td>{item.status}</td>
              <td>{item.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
