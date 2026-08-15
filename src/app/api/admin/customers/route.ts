import { desc, ilike, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { customers } from "@/db/schema";
import { requireAdminSession } from "@/lib/admin/session";

export async function GET(request: Request) {
  const session = await requireAdminSession(); if (!session.ok) return session.response;
  const q = new URL(request.url).searchParams.get("q")?.trim();
  const where = q ? or(ilike(customers.name, `%${q}%`), ilike(customers.phone, `%${q}%`), ilike(customers.email, `%${q}%`)) : undefined;
  return NextResponse.json({ rows: await getDb().select().from(customers).where(where).orderBy(desc(customers.lastOrderAt)).limit(100) });
}
