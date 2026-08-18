"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { StoreContact } from "@/lib/store-contact";

export type PublicStoreSettings = {
  contact: StoreContact;
  announcementEnabled: boolean;
  announcementText: string;
  combo3PriceInr: number;
  combo5PriceInr: number;
  unitPriceInr: number;
  freeDeliveryThresholdInr: number;
};

const StoreSettingsContext = createContext<PublicStoreSettings | null>(null);

export function StoreSettingsProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: PublicStoreSettings;
}) {
  const memo = useMemo(() => value, [value]);
  return (
    <StoreSettingsContext.Provider value={memo}>{children}</StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  const context = useContext(StoreSettingsContext);
  if (!context) {
    throw new Error("useStoreSettings must be used within StoreSettingsProvider");
  }
  return context;
}
