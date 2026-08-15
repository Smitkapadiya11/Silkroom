import { NextResponse } from "next/server";
import { transitionOrderStatus } from "@/lib/admin/orders";
import { requireAdminSession } from "@/lib/admin/session";
import type { OrderStatus } from "@/lib/admin/order-status";

const actions: Record<string, OrderStatus> = { confirm: "confirmed", pack: "packed", dispatch: "dispatched", cancel: "cancelled" };
export async function POST(request: Request) {
  const session = await requireAdminSession(); if (!session.ok) return session.response;
  const { action, orderNumbers } = await request.json();
  if (!actions[action] || !Array.isArray(orderNumbers) || orderNumbers.length > 100) return NextResponse.json({ error: "Invalid bulk action." }, { status: 400 });
  const results = await Promise.all(orderNumbers.map((orderNumber: string) => transitionOrderStatus({ orderNumber, to: actions[action], actorEmail: session.email })));
  return NextResponse.json({ updated: results.filter((result) => "order" in result).length, results });
}
