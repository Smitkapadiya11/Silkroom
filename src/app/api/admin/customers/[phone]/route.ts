import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { customers, orders } from "@/db/schema";
import { normalizePhone } from "@/lib/admin/orders";
import { requireAdminSession } from "@/lib/admin/session";

export async function GET(_: Request, { params }: { params: Promise<{ phone: string }> }) {
  const session = await requireAdminSession(); if (!session.ok) return session.response;
  const { phone } = await params; const normalized = normalizePhone(phone);
  const [customer] = await getDb().select().from(customers).where(eq(customers.phone, normalized)).limit(1);
  if (!customer) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const rows = await getDb().select().from(orders).where(eq(orders.phone, normalized));
  return NextResponse.json({ customer, orders: rows });
}
