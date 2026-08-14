import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { calculateCartPricing, type CartLine } from "@/lib/pricing";
import { getProduct } from "@/lib/products";
import { validateCheckout, type CheckoutDetails } from "@/lib/cart";

export const runtime = "nodejs";

type RequestItem = {
  slug: string;
  quantity: number;
  size: string;
  color: string;
};

export async function POST(request: Request) {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return NextResponse.json(
      { error: "Razorpay is not configured." },
      { status: 503 },
    );
  }

  const body = (await request.json()) as {
    items?: RequestItem[];
    details?: CheckoutDetails;
  };
  const items = body.items ?? [];
  if (!Array.isArray(items) || items.length === 0 || items.length > 7) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }
  const details = body.details;
  if (!details || Object.keys(validateCheckout(details)).length > 0) {
    return NextResponse.json({ error: "Delivery details are invalid." }, { status: 400 });
  }

  const validatedItems = items.map((item) => {
    const product = getProduct(item.slug);
    const quantity = item.quantity;
    const validVariant =
      product &&
      product.sizes.includes(item.size) &&
      product.colors.some((color) => color.name === item.color);
    if (!validVariant || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      return null;
    }
    return { product, quantity, size: item.size, color: item.color };
  });
  if (validatedItems.some((item) => !item)) {
    return NextResponse.json({ error: "Your cart contains an invalid product." }, { status: 400 });
  }

  const validItems = validatedItems.filter(
    (
      item,
    ): item is { product: NonNullable<ReturnType<typeof getProduct>>; quantity: number; size: string; color: string } =>
      item !== null,
  );
  const validLines: CartLine[] = validItems.map(({ product, quantity }) => ({
    slug: product.slug,
    price: product.price,
    quantity,
  }));
  const pricing = calculateCartPricing(validLines);
  const orderItems = validItems
    .map((item) => `${item.product.name} / ${item.color} / ${item.size} x${item.quantity}`)
    .join(" | ")
    .slice(0, 240);
  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  const order = await razorpay.orders.create({
    amount: pricing.total * 100,
    currency: "INR",
    receipt: `sr_${Date.now()}`,
    notes: {
      customer: details.name.slice(0, 100),
      phone: details.phone.replace(/\D/g, "").slice(-10),
      address: details.address.slice(0, 200),
      location: `${details.city}, ${details.state} - ${details.pincode}`.slice(0, 200),
      polos: orderItems,
      combo: pricing.rule?.id ?? "mixed",
    },
  });

  return NextResponse.json({
    id: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId,
  });
}
