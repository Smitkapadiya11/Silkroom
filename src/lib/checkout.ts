import { and, eq, sql } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { orderCounters, orderItems, orders } from "@/db/schema";
import {
  checkoutItemSchema,
  COD_FEE_INR,
  type CheckoutAddress,
  type CheckoutItemInput,
} from "@/lib/checkout-shared";
import { decrementInventoryForOrder, upsertCustomerFromOrder } from "@/lib/admin/orders";
import { calculateCartPricing, type CartLine, type ComboRule } from "@/lib/pricing";
import { getProduct } from "@/lib/products";
import { getStoreSettings } from "@/lib/store-settings";

export {
  checkoutAddressSchema,
  checkoutItemSchema,
  COD_FEE_INR,
  type CheckoutAddress,
  type CheckoutItemInput,
} from "@/lib/checkout-shared";

export type ValidatedCheckoutItem = {
  slug: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export function requireDatabase() {
  if (!isDatabaseConfigured()) {
    return {
      ok: false as const,
      response: Response.json(
        { error: "Orders database is not configured. Set DATABASE_URL in Vercel." },
        { status: 503 },
      ),
    };
  }
  return { ok: true as const, db: getDb() };
}

export async function validateCheckoutItems(items: CheckoutItemInput[]) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 12) {
    return { error: "Your cart is empty or too large." as const };
  }

  const settings = await getStoreSettings();
  const unitPrice = "unitPriceInr" in settings ? Number(settings.unitPriceInr) : undefined;
  const comboOverrides: ComboRule[] | undefined =
    "combo3PriceInr" in settings
      ? [
          {
            id: "trio",
            label: "Any 3 polos",
            minQty: 3,
            discountType: "fixedPrice",
            value: Number(settings.combo3PriceInr),
            blurb: `3 polos for ₹${Number(settings.combo3PriceInr).toLocaleString("en-IN")}`,
          },
          {
            id: "five",
            label: "Any 5 polos",
            minQty: 5,
            discountType: "fixedPrice",
            value: Number(settings.combo5PriceInr),
            blurb: `5 polos for ₹${Number(settings.combo5PriceInr).toLocaleString("en-IN")}`,
          },
        ]
      : undefined;

  const validated: ValidatedCheckoutItem[] = [];
  for (const item of items) {
    const parsed = checkoutItemSchema.safeParse(item);
    if (!parsed.success) return { error: "Your cart contains an invalid line." as const };
    const product = getProduct(parsed.data.slug);
    if (
      !product ||
      !product.sizes.includes(parsed.data.size) ||
      !product.colors.some((color) => color.name === parsed.data.color)
    ) {
      return { error: "Your cart contains an invalid product." as const };
    }
    const price = unitPrice && Number.isFinite(unitPrice) ? unitPrice : product.price;
    validated.push({
      slug: product.slug,
      name: product.name,
      size: parsed.data.size,
      color: parsed.data.color,
      quantity: parsed.data.quantity,
      unitPrice: price,
      lineTotal: price * parsed.data.quantity,
    });
  }

  const lines: CartLine[] = validated.map((item) => ({
    slug: item.slug,
    price: item.unitPrice,
    quantity: item.quantity,
  }));
  const pricing = calculateCartPricing(lines, { rules: comboOverrides, unitPrice });
  return { items: validated, pricing, settings };
}

export function computePayableTotal(
  pricingTotal: number,
  method: "prepaid" | "cod",
  codFeeInr = COD_FEE_INR,
) {
  if (method === "cod") {
    return {
      feeInr: codFeeInr,
      prepaidDiscountInr: 0,
      totalInr: pricingTotal + codFeeInr,
    };
  }
  return {
    feeInr: 0,
    prepaidDiscountInr: 0,
    totalInr: pricingTotal,
  };
}

export async function nextOrderNumber() {
  const db = getDb();
  const year = Number(
    new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", year: "2-digit" }),
  );
  await db.insert(orderCounters).values({ year, lastValue: 0 }).onConflictDoNothing();

  const [row] = await db
    .update(orderCounters)
    .set({ lastValue: sql`${orderCounters.lastValue} + 1` })
    .where(eq(orderCounters.year, year))
    .returning({ lastValue: orderCounters.lastValue });

  return `SR-${year}-${String(row.lastValue).padStart(4, "0")}`;
}

export async function insertOrder(input: {
  paymentMethod: "prepaid" | "cod";
  status: string;
  address: CheckoutAddress;
  items: ValidatedCheckoutItem[];
  subtotalInr: number;
  discountInr: number;
  feeInr: number;
  prepaidDiscountInr: number;
  totalInr: number;
  razorpayOrderId?: string | null;
}) {
  const db = getDb();
  const orderNumber = await nextOrderNumber();
  const [order] = await db
    .insert(orders)
    .values({
      orderNumber,
      status: input.status,
      paymentMethod: input.paymentMethod,
      customerName: input.address.name,
      phone: input.address.phone,
      email: input.address.email || null,
      addressLine1: input.address.addressLine1,
      addressLine2: input.address.addressLine2 || null,
      city: input.address.city,
      state: input.address.state,
      pincode: input.address.pincode,
      subtotalInr: input.subtotalInr,
      discountInr: input.discountInr,
      feeInr: input.feeInr,
      prepaidDiscountInr: input.prepaidDiscountInr,
      totalInr: input.totalInr,
      razorpayOrderId: input.razorpayOrderId ?? null,
    })
    .returning();

  await db.insert(orderItems).values(
    input.items.map((item) => ({
      orderId: order.id,
      productSlug: item.slug,
      productName: item.name,
      color: item.color,
      size: item.size,
      unitPriceInr: item.unitPrice,
      quantity: item.quantity,
      lineTotalInr: item.lineTotal,
    })),
  );

  return order;
}

export async function markOrderPaid(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string | null;
}) {
  const db = getDb();
  const [existing] = await db
    .select()
    .from(orders)
    .where(eq(orders.razorpayOrderId, input.razorpayOrderId))
    .limit(1);

  if (!existing) return null;
  if (existing.status === "confirmed" || existing.status === "paid") {
    return existing.razorpayPaymentId === input.razorpayPaymentId ? existing : null;
  }
  if (
    existing.paymentMethod !== "prepaid" ||
    (existing.status !== "pending" && existing.status !== "awaiting_payment")
  ) {
    return null;
  }

  const [updated] = await db
    .update(orders)
    .set({
      status: "confirmed",
      confirmedAt: new Date(),
      razorpayPaymentId: input.razorpayPaymentId,
      razorpaySignature: input.razorpaySignature ?? existing.razorpaySignature,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(orders.id, existing.id),
        sql`${orders.status} in ('pending', 'awaiting_payment')`,
        eq(orders.paymentMethod, "prepaid"),
      ),
    )
    .returning();

  if (updated) {
    await decrementInventoryForOrder(updated.id, "system:razorpay");
    await upsertCustomerFromOrder({
      phone: updated.phone,
      customerName: updated.customerName,
      email: updated.email,
      paymentMethod: updated.paymentMethod,
      totalInr: updated.totalInr,
      createdAt: updated.createdAt,
      status: updated.status,
    });
    return updated;
  }

  const [current] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, existing.id))
    .limit(1);
  return current &&
    (current.status === "confirmed" || current.status === "paid") &&
    current.razorpayPaymentId === input.razorpayPaymentId
    ? current
    : null;
}
