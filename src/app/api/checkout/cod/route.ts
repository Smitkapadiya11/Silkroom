import { NextResponse } from "next/server";
import {
  checkoutAddressSchema,
  computePayableTotal,
  insertOrder,
  requireDatabase,
  validateCheckoutItems,
} from "@/lib/checkout";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const dbReady = requireDatabase();
  if (!dbReady.ok) return dbReady.response;

  const body = await request.json();
  const address = checkoutAddressSchema.safeParse(body.address ?? body.details);
  if (!address.success) {
    return NextResponse.json({ error: "Delivery details are invalid." }, { status: 400 });
  }

  const validated = validateCheckoutItems(body.items ?? []);
  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const payable = computePayableTotal(validated.pricing.total, "cod");
  const order = await insertOrder({
    paymentMethod: "cod",
    status: "cod_pending",
    address: address.data,
    items: validated.items,
    subtotalInr: validated.pricing.subtotal,
    discountInr: validated.pricing.discount,
    feeInr: payable.feeInr,
    prepaidDiscountInr: payable.prepaidDiscountInr,
    totalInr: payable.totalInr,
  });

  return NextResponse.json({
    orderNumber: order.orderNumber,
    status: order.status,
    totalInr: order.totalInr,
  });
}
