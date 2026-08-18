import { getDb } from "@/db";
import { storeSettings } from "@/db/schema";
import { fallbackStoreSettings, scrubCodCopy } from "@/lib/store-settings";
import { SettingsForm } from "./SettingsForm";
export default async function SettingsPage() {
  const [settings] = await getDb().select().from(storeSettings).limit(1);
  const safe = {
    ...(settings ?? fallbackStoreSettings),
    announcementText: scrubCodCopy(String((settings ?? fallbackStoreSettings).announcementText ?? "")),
  };
  return <section className="admin-page"><h1>Settings</h1><SettingsForm settings={safe as Record<string, string | number | boolean | Date | null>} /></section>;
}
