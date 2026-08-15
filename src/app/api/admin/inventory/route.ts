import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { inventory, inventoryAdjustments } from "@/db/schema";
import { requireAdminSession } from "@/lib/admin/session";

export async function GET() {
  const session = await requireAdminSession(); if (!session.ok) return session.response;
  return NextResponse.json({ rows: await getDb().select().from(inventory) });
}
export async function PATCH(request: Request) {
  const session = await requireAdminSession(); if (!session.ok) return session.response;
  const { productSlug, size, quantity, reason = "admin_adjustment" } = await request.json();
  if (typeof quantity !== "number" || quantity < 0 || !productSlug || !size) return NextResponse.json({ error: "Invalid inventory update." }, { status: 400 });
  const db = getDb();
  const [current] = await db.select().from(inventory).where(and(eq(inventory.productSlug, productSlug), eq(inventory.size, size))).limit(1);
  const [row] = current ? await db.update(inventory).set({ quantity, updatedAt: new Date() }).where(eq(inventory.id, current.id)).returning() : await db.insert(inventory).values({ productSlug, size, quantity }).returning();
  await db.insert(inventoryAdjustments).values({ inventoryId: row.id, delta: quantity - (current?.quantity ?? 0), reason, actorEmail: session.email });
  return NextResponse.json({ row });
}
