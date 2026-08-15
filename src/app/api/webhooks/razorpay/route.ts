import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { markOrderPaid, requireDatabase } from "@/lib/checkout";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const dbReady = requireDatabase();
  if (!dbReady.ok) return dbReady.response;

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret is not configured." }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signature);
  if (
    !signature ||
    expectedBuf.length !== actualBuf.length ||
    !crypto.timingSafeEqual(expectedBuf, actualBuf)
  ) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  const payload = JSON.parse(rawBody) as {
    event?: string;
    payload?: {
      payment?: {
        entity?: {
          id?: string;
          order_id?: string;
          status?: string;
          amount?: number;
        };
      };
    };
  };

  const payment = payload.payload?.payment?.entity;
  if (
    payload.event === "payment.captured" &&
    payment?.id &&
    payment.order_id &&
    typeof payment.amount === "number" &&
    payment.status === "captured"
  ) {
    const db = getDb();
    const [storedOrder] = await db
      .select({
        totalInr: orders.totalInr,
        paymentMethod: orders.paymentMethod,
        status: orders.status,
      })
      .from(orders)
      .where(eq(orders.razorpayOrderId, payment.order_id))
      .limit(1);
    if (
      storedOrder &&
      storedOrder.paymentMethod === "prepaid" &&
      payment.amount === storedOrder.totalInr * 100
    ) {
      await markOrderPaid({
        razorpayOrderId: payment.order_id,
        razorpayPaymentId: payment.id,
      });
    }
  }

  return NextResponse.json({ received: true });
}
