import { CartDrawer } from "@/components/store/CartDrawer";
import { FloatingWhatsApp } from "@/components/store/FloatingWhatsApp";
import { V2Landing } from "@/components/v2/V2Landing";
import { products } from "@/data/products";
import { getStoreSettings } from "@/lib/store-settings";

export default async function Home() {
  const settings = await getStoreSettings();
  return (
    <>
      <V2Landing
        products={products}
        announcementEnabled={settings.announcementEnabled}
        announcementText={settings.announcementText}
      />
      <CartDrawer />
      <FloatingWhatsApp />
    </>
  );
}
