import type { fallbackStoreSettings } from "@/lib/store-settings";

export type StoreContact = {
  email: string;
  phone: string;
  phoneTel: string;
  responseHours: string;
  address: string;
};

export function phoneToTel(phone: string) {
  const digits = phone.replace(/[^\d]/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `+91${digits}`;
  if (digits.startsWith("91") && digits.length >= 12) return `+${digits}`;
  return `+${digits}`;
}

export function resolveStoreContact(
  settings: Pick<
    typeof fallbackStoreSettings,
    "contactEmail" | "contactPhone" | "responseHours" | "returnAddress"
  >,
): StoreContact {
  return {
    email: settings.contactEmail,
    phone: settings.contactPhone,
    phoneTel: phoneToTel(settings.contactPhone),
    responseHours: settings.responseHours,
    address: settings.returnAddress,
  };
}
