import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { storeSettings } from "@/db/schema";
import { requireAdminSession } from "@/lib/admin/session";
import { scrubCodCopy } from "@/lib/store-settings";

export async function GET() {
  const session = await requireAdminSession(); if (!session.ok) return session.response;
  const [raw] = await getDb().select().from(storeSettings).limit(1);
  const settings = raw
    ? { ...raw, announcementText: scrubCodCopy(String(raw.announcementText ?? "")) }
    : null;
  return NextResponse.json({ settings });
}
export async function PUT(request: Request) {
  const session = await requireAdminSession(); if (!session.ok) return session.response;
  const body = await request.json();
  const allowed = ["contactEmail", "contactPhone", "returnAddress", "responseHours", "combo3PriceInr", "combo5PriceInr", "unitPriceInr", "prepaidDiscountInr", "freeDeliveryThresholdInr", "packageWeightGrams", "packageLengthCm", "packageWidthCm", "packageHeightCm", "announcementEnabled", "announcementText"] as const;
  const patch = Object.fromEntries(allowed.filter((key) => key in body).map((key) => [key, body[key]]));
  if (typeof patch.announcementText === "string") {
    patch.announcementText = scrubCodCopy(patch.announcementText);
  }
  const [settings] = await getDb()
    .insert(storeSettings)
    .values({ id: "default", ...patch })
    .onConflictDoUpdate({
      target: storeSettings.id,
      set: { ...patch, updatedAt: new Date() },
    })
    .returning();
  revalidateTag("store-settings");
  revalidatePath("/", "layout");
  return NextResponse.json({ settings });
}
