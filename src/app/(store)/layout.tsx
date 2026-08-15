import { StoreFooter } from "@/components/store/StoreFooter";
import { StoreHeader } from "@/components/store/StoreHeader";
import { CartDrawer } from "@/components/store/CartDrawer";
import { ComboOfferBar } from "@/components/store/ComboOfferBar";
import { FloatingWhatsApp } from "@/components/store/FloatingWhatsApp";
import { getStoreSettings } from "@/lib/store-settings";

export default async function StoreLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getStoreSettings();
  return (
    <>
      <div className="store-sticky-stack">
        {settings.announcementEnabled ? <ComboOfferBar text={settings.announcementText} /> : null}
        <StoreHeader variant="store" />
      </div>
      <main className="store-main">{children}</main>
      <StoreFooter />
      <CartDrawer />
      <FloatingWhatsApp />
    </>
  );
}
