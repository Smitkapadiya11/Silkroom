import { inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { requireAdminSession } from "@/lib/admin/session";

export const runtime = "nodejs";

function esc(value: unknown) {
  let text = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session.ok) return session.response;
  const { orderNumbers } = await request.json();
  if (!Array.isArray(orderNumbers)) {
    return NextResponse.json({ error: "Order numbers required." }, { status: 400 });
  }
  const rows = await getDb().select().from(orders).where(inArray(orders.orderNumber, orderNumbers));
  const ids = rows.map((row) => row.id);
  const items = ids.length
    ? await getDb().select().from(orderItems).where(inArray(orderItems.orderId, ids))
    : [];
  const itemMap = new Map<string, string>();
  for (const item of items) {
    itemMap.set(
      item.orderId,
      `${itemMap.get(item.orderId) ? `${itemMap.get(item.orderId)}; ` : ""}${item.productName} ${item.size} x${item.quantity}`,
    );
  }
  const header = [
    "order_id",
    "name",
    "phone",
    "address",
    "city",
    "state",
    "pincode",
    "payment_method",
    "amount",
    "items",
  ];
  const csv = [
    header.join(","),
    ...rows.map((row) =>
      [
        row.orderNumber,
        row.customerName,
        row.phone,
        [row.addressLine1, row.addressLine2].filter(Boolean).join(" "),
        row.city,
        row.state,
        row.pincode,
        row.paymentMethod,
        row.totalInr,
        itemMap.get(row.id),
      ]
        .map(esc)
        .join(","),
    ),
  ].join("\n");
  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=silk-room-shipments.csv",
    },
  });
}
