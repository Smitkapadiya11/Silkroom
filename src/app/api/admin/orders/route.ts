import { NextResponse } from "next/server";
import { listOrders } from "@/lib/admin/orders";
import { requireAdminSession } from "@/lib/admin/session";

export async function GET(request: Request) {
  const session = await requireAdminSession();
  if (!session.ok) return session.response;
  const q = new URL(request.url).searchParams;
  return NextResponse.json(await listOrders({
    page: Math.max(1, Number(q.get("page") ?? 1)),
    pageSize: Math.min(100, Math.max(1, Number(q.get("pageSize") ?? 30))),
    status: q.get("status") ?? undefined, paymentMethod: q.get("paymentMethod") ?? undefined,
    courier: q.get("courier") ?? undefined, hasAwb: q.has("hasAwb") ? q.get("hasAwb") === "true" : undefined,
    from: q.get("from") ?? undefined, to: q.get("to") ?? undefined, q: q.get("q") ?? undefined,
  }));
}
