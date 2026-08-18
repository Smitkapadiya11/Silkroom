import { unstable_cache } from "next/cache";
import { getDb, isDatabaseConfigured } from "@/db";
import { storeSettings } from "@/db/schema";
import { CLEAN_ANNOUNCEMENT, scrubCodCopy } from "@/lib/copy";

export { CLEAN_ANNOUNCEMENT, scrubCodCopy } from "@/lib/copy";

export const fallbackStoreSettings = {
  id: "default",
  contactEmail: "hello@silkroom.shop",
  contactPhone: "+91 75758 07403",
  returnAddress: "Silk Room, Surat, Gujarat, India",
  responseHours: "Mon–Sat, 10am–7pm IST",
  combo3PriceInr: 799,
  combo5PriceInr: 1299,
  unitPriceInr: 399,
  codFeeInr: 0,
  prepaidDiscountInr: 0,
  freeDeliveryThresholdInr: 799,
  packageWeightGrams: 350,
  packageLengthCm: 30,
  packageWidthCm: 25,
  packageHeightCm: 4,
  announcementEnabled: true,
  announcementText: CLEAN_ANNOUNCEMENT,
  updatedAt: null as Date | null,
};

function withoutCodCopy<T extends { announcementText?: string | null }>(settings: T): T {
  return {
    ...settings,
    announcementText: scrubCodCopy(String(settings.announcementText ?? CLEAN_ANNOUNCEMENT)),
  };
}

const readSettings = unstable_cache(
  async () => {
    if (!isDatabaseConfigured()) return fallbackStoreSettings;
    try {
      const [settings] = await getDb().select().from(storeSettings).limit(1);
      return withoutCodCopy(settings ?? fallbackStoreSettings);
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
