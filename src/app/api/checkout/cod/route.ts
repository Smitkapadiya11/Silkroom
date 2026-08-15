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

  const body = await request.json();
  const address = checkoutAddressSchema.safeParse(body.address ?? body.details);
  if (!address.success) {
    return NextResponse.json({ error: "Delivery details are invalid." }, { status: 400 });
  }

  const validated = await validateCheckoutItems(body.items ?? []);
  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const codFee =
    "codFeeInr" in validated.settings ? Number(validated.settings.codFeeInr) : undefined;
  const payable = computePayableTotal(
    validated.pricing.total,
    "cod",
    Number.isFinite(codFee) ? codFee : undefined,
  );
  const order = await insertOrder({
    paymentMethod: "cod",
    status: "pending",
    address: address.data,
    items: validated.items,
    subtotalInr: validated.pricing.subtotal,
    discountInr: validated.pricing.discount,
    feeInr: payable.feeInr,
    prepaidDiscountInr: payable.prepaidDiscountInr,
    totalInr: payable.totalInr,
  });

  await grantOrderAccess(order.orderNumber);

  return NextResponse.json({
    orderNumber: order.orderNumber,
    status: order.status,
    totalInr: order.totalInr,
  });
}
