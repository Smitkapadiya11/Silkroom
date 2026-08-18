import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import {
  checkoutAddressSchema,
  computePayableTotal,
  insertOrder,
  requireDatabase,
  validateCheckoutItems,
} from "@/lib/checkout";
import { grantOrderAccess } from "@/lib/order-access";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const dbReady = requireDatabase();
  if (!dbReady.ok) return dbReady.response;

  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return NextResponse.json({ error: "Razorpay is not configured." }, { status: 503 });
  }

  const body = await request.json();
  const address = checkoutAddressSchema.safeParse(body.address ?? body.details);
  if (!address.success) {
    return NextResponse.json({ error: "Delivery details are invalid." }, { status: 400 });
  }

  const validated = await validateCheckoutItems(body.items ?? []);
  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const payable = computePayableTotal(validated.pricing.total, "prepaid");
  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  const rzOrder = await razorpay.orders.create({
    amount: payable.totalInr * 100,
    currency: "INR",
    receipt: `sr_${Date.now()}`,
    notes: {
      customer: address.data.name.slice(0, 100),
      phone: address.data.phone,
      city: address.data.city,
    },
  });

  const order = await insertOrder({
    paymentMethod: "prepaid",
    status: "awaiting_payment",
    address: address.data,
    items: validated.items,
    subtotalInr: validated.pricing.subtotal,
    discountInr: validated.pricing.discount,
    feeInr: payable.feeInr,
    prepaidDiscountInr: payable.prepaidDiscountInr,
    totalInr: payable.totalInr,
    razorpayOrderId: rzOrder.id,
  });

  await grantOrderAccess(order.orderNumber);

  return NextResponse.json({
    orderNumber: order.orderNumber,
    razorpayOrderId: rzOrder.id,
    amount: rzOrder.amount,
    currency: rzOrder.currency,
    keyId,
  });
}
