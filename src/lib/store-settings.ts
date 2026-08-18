import { unstable_cache } from "next/cache";
import { getDb, isDatabaseConfigured } from "@/db";
import { storeSettings } from "@/db/schema";

export const fallbackStoreSettings = {
  id: "default",
  contactEmail: "hello@silkroom.shop",
  contactPhone: "+91 75758 07403",
  returnAddress: "Silk Room, Surat, Gujarat, India",
  responseHours: "Mon–Sat, 10am–7pm IST",
  combo3PriceInr: 799,
  combo5PriceInr: 1299,
  unitPriceInr: 399,
  codFeeInr: 49,
  prepaidDiscountInr: 0,
  freeDeliveryThresholdInr: 799,
  packageWeightGrams: 350,
  packageLengthCm: 30,
  packageWidthCm: 25,
  packageHeightCm: 4,
  announcementEnabled: true,
  announcementText: "3 polos ₹799 · 5 for ₹1,299 · Free delivery over ₹799 · Secure prepaid checkout",
  updatedAt: null as Date | null,
};

const readSettings = unstable_cache(
  async () => {
    if (!isDatabaseConfigured()) return fallbackStoreSettings;
    try {
      const [settings] = await getDb().select().from(storeSettings).limit(1);
      return settings ?? fallbackStoreSettings;
    } catch {
      return fallbackStoreSettings;
    }
  },
  ["store-settings"],
  { revalidate: 300, tags: ["store-settings"] },
);

export function getStoreSettings() {
  return readSettings();
}
