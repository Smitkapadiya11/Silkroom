import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { transitionOrderStatus } from "@/lib/admin/orders";
import { clientIp, requireAdminSession } from "@/lib/admin/session";
import type { OrderStatus } from "@/lib/admin/order-status";
import { writeAdminAudit } from "@/lib/admin/audit";

type Context = { params: Promise<{ orderNumber: string }> };

export async function GET(_: Request, { params }: Context) {
  const session = await requireAdminSession();
  if (!session.ok) return session.response;
  const { orderNumber } = await params;
  const [order] = await getDb()
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber.toUpperCase()))
    .limit(1);
  if (!order) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const items = await getDb().select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return NextResponse.json({ order, items });
}

export async function PATCH(request: Request, { params }: Context) {
  const session = await requireAdminSession();
  if (!session.ok) return session.response;
  const { orderNumber } = await params;
  const body = await request.json();
  const number = orderNumber.toUpperCase();

  if (typeof body.status === "string") {
    const result = await transitionOrderStatus({
      orderNumber: number,
      to: body.status as OrderStatus,
      actorEmail: session.email,
      ipAddress: clientIp(request),
      awbNumber: body.awbNumber,
      courier: body.courier,
      cancelReason: body.cancelReason,
      note: body.note,
    });
    return "error" in result
      ? NextResponse.json(result, { status: 400 })
      : NextResponse.json(result);
  }

  const db = getDb();
  const [existing] = await db.select().from(orders).where(eq(orders.orderNumber, number)).limit(1);
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const patch: Partial<typeof orders.$inferInsert> = { updatedAt: new Date() };
  if (typeof body.awbNumber === "string") patch.awbNumber = body.awbNumber;
  if (typeof body.courier === "string") patch.courier = body.courier;
  if (typeof body.note === "string" && body.note.trim()) {
    const stamp = new Date().toISOString();
    patch.internalNotes = `${existing.internalNotes ? `${existing.internalNotes}\n` : ""}[${stamp}] ${session.email}: ${body.note.trim()}`;
  }

  const [order] = await db.update(orders).set(patch).where(eq(orders.id, existing.id)).returning();

  if (typeof body.note === "string" && body.note.trim()) {
    await writeAdminAudit({
      actorEmail: session.email,
      action: "order_note_appended",
      entityType: "order",
      entityId: number,
      ipAddress: clientIp(request),
    });
  }

  return NextResponse.json({ order });
}
