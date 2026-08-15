import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { orderItems, orders } from "@/db/schema";
import { requireDatabase } from "@/lib/checkout";
import { grantOrderAccess } from "@/lib/order-access";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const dbReady = requireDatabase();
  if (!dbReady.ok) return dbReady.response;

  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get("orderNumber")?.trim() ?? "";
  const phone = (searchParams.get("phone") ?? "").replace(/\D/g, "").slice(-10);

  if (!/^SR-\d{2}-\d{4}$/i.test(orderNumber) || !/^\d{10}$/.test(phone)) {
    return NextResponse.json({ error: "Enter a valid order number and phone." }, { status: 400 });
  }

  const db = dbReady.db;
  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.orderNumber, orderNumber.toUpperCase()), eq(orders.phone, phone)))
    .limit(1);

  if (!order) {
    return NextResponse.json({ error: "No order found for that number and phone." }, { status: 404 });
  }

  await grantOrderAccess(order.orderNumber);
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));

  return NextResponse.json({
    orderNumber: order.orderNumber,
    status: order.status,
    paymentMethod: order.paymentMethod,
    totalInr: order.totalInr,
    createdAt: order.createdAt,
    city: order.city,
    items: items.map((item) => ({
      name: item.productName,
      color: item.color,
      size: item.size,
      quantity: item.quantity,
      lineTotalInr: item.lineTotalInr,
    })),
  });
}
