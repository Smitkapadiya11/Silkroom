import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { requireAdminSession } from "@/lib/admin/session";

export async function GET() {
  const session = await requireAdminSession(); if (!session.ok) return session.response;
  const rows = await getDb().select({ day: sql<string>`to_char(${orders.createdAt} at time zone 'Asia/Kolkata', 'YYYY-MM-DD')`, revenue: sql<number>`coalesce(sum(${orders.totalInr}), 0)::int`, orders: sql<number>`count(*)::int` }).from(orders).where(sql`${orders.createdAt} >= now() - interval '30 days'`).groupBy(sql`1`).orderBy(sql`1`);
  return NextResponse.json({ revenueByDay: rows });
}
