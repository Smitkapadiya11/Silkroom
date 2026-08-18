import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { markOrderPaid, requireDatabase } from "@/lib/checkout";
import { grantOrderAccess } from "@/lib/order-access";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const dbReady = requireDatabase();
  if (!dbReady.ok) return dbReady.response;

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!keyId || !keySecret) {
    return NextResponse.json({ error: "Razorpay is not configured." }, { status: 503 });
  }

  const body = await request.json();
  const {
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: razorpaySignature,
  } = body as {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
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

  const db = getDb();
  const [storedOrder] = await db
    .select({
      orderNumber: orders.orderNumber,
      status: orders.status,
      paymentMethod: orders.paymentMethod,
      totalInr: orders.totalInr,
    })
    .from(orders)
    .where(eq(orders.razorpayOrderId, razorpayOrderId))
    .limit(1);

  if (
    !storedOrder ||
    storedOrder.paymentMethod !== "prepaid" ||
    (storedOrder.status !== "pending" &&
      storedOrder.status !== "awaiting_payment" &&
      storedOrder.status !== "paid" &&
      storedOrder.status !== "confirmed")
  ) {
    return NextResponse.json({ error: "Payment order is invalid." }, { status: 400 });
  }

  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  const payment = (await razorpay.payments.fetch(razorpayPaymentId)) as {
    amount?: number;
    order_id?: string;
    status?: string;
  };
  if (
    payment.status !== "captured" ||
    payment.order_id !== razorpayOrderId ||
    payment.amount !== storedOrder.totalInr * 100
  ) {
    return NextResponse.json({ error: "Payment amount or status could not be confirmed." }, { status: 400 });
  }

  const paid = await markOrderPaid({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });

  if (!paid) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  await grantOrderAccess(paid.orderNumber);

  return NextResponse.json({
    orderNumber: paid.orderNumber,
    status: paid.status,
  });
}
