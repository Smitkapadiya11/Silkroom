import { listOrders } from "@/lib/admin/orders";
import { OrdersTable } from "./OrdersTable";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
export default async function OrdersPage({ searchParams }: Props) {
  const q = await searchParams;
  const result = await listOrders({ page: Math.max(1, Number(q.page ?? 1)), pageSize: 30, status: typeof q.status === "string" ? q.status : undefined, paymentMethod: typeof q.paymentMethod === "string" ? q.paymentMethod : undefined, courier: typeof q.courier === "string" ? q.courier : undefined, hasAwb: q.hasAwb === "true" ? true : q.hasAwb === "false" ? false : undefined, from: typeof q.from === "string" ? q.from : undefined, to: typeof q.to === "string" ? q.to : undefined, q: typeof q.q === "string" ? q.q : undefined });
  return <section className="admin-page"><h1>Orders</h1><p className="admin-muted">{result.total} orders</p><OrdersTable rows={result.rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }))} /></section>;
}
