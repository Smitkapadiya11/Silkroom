import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import Papa from "papaparse";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { requireAdminSession } from "@/lib/admin/session";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await requireAdminSession(); if (!session.ok) return session.response;
  const form = await request.formData(); const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "CSV file required." }, { status: 400 });
  const parsed = Papa.parse<Record<string, string>>(await file.text(), { header: true, skipEmptyLines: true });
  let updated = 0;
  for (const row of parsed.data) {
    const orderNumber = row.orderNumber ?? row.order_id ?? row.order;
    const awbNumber = row.awbNumber ?? row.awb ?? row.awb_code;
    if (!orderNumber || !awbNumber) continue;
    await getDb().update(orders).set({ awbNumber, courier: row.courier ?? undefined, updatedAt: new Date() }).where(eq(orders.orderNumber, orderNumber.toUpperCase()));
    updated++;
  }
  return NextResponse.json({ updated, errors: parsed.errors });
}
