import crypto from "node:crypto";
import { NextResponse } from "next/server";
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
        };
      };
    };
  };

  const payment = payload.payload?.payment?.entity;
  if (
    payload.event === "payment.captured" &&
    payment?.id &&
    payment.order_id &&
    payment.status === "captured"
  ) {
    await markOrderPaid({
      razorpayOrderId: payment.order_id,
      razorpayPaymentId: payment.id,
    });
  }

  return NextResponse.json({ received: true });
}
