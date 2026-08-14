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

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json({ error: "Razorpay is not configured." }, { status: 503 });
  }

  const body = await request.json();
  const {
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: razorpaySignature,
    orderNumber,
  } = body as {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    orderNumber?: string;
  };

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return NextResponse.json({ error: "Missing payment verification fields." }, { status: 400 });
  }

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(razorpaySignature);
  if (
    expectedBuf.length !== actualBuf.length ||
    !crypto.timingSafeEqual(expectedBuf, actualBuf)
  ) {
    return NextResponse.json({ error: "Payment signature mismatch." }, { status: 400 });
  }

  const paid = await markOrderPaid({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });

  if (!paid) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (orderNumber && paid.orderNumber !== orderNumber) {
    const db = getDb();
    await db
      .update(orders)
      .set({ updatedAt: new Date() })
      .where(eq(orders.orderNumber, paid.orderNumber));
  }

  return NextResponse.json({
    orderNumber: paid.orderNumber,
    status: paid.status,
  });
}
