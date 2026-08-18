import { NextResponse } from "next/server";
import bwipjs from "bwip-js";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { requireAdminSession } from "@/lib/admin/session";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const session = await requireAdminSession();
  if (!session.ok) return session.response;

  const { orderNumber } = await params;
  const [order] = await getDb()
    .select({ orderNumber: orders.orderNumber })
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber.toUpperCase()))
    .limit(1);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const png = await bwipjs.toBuffer({
    bcid: "code128",
    text: order.orderNumber,
    scale: 3,
    height: 16,
    includetext: true,
    textsize: 10,
    textxalign: "center",
    backgroundcolor: "FFFFFF",
  });

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, max-age=60",
    },
  });
}
