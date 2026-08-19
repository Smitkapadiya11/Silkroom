import { CartDrawer } from "@/components/store/CartDrawer";
import { FloatingWhatsApp } from "@/components/store/FloatingWhatsApp";
import { V2Landing } from "@/components/v2/V2Landing";
import { products } from "@/data/products";
import { createPageMetadata, itemListJsonLd } from "@/lib/metadata";
import { getStoreSettings } from "@/lib/store-settings";

export const metadata = createPageMetadata({
  title: "Silk Room | Men's Polo T-Shirts Online in India | silkroom.shop",
  description:
    "Official Silk Room store (silkroom.shop). Men's polo t-shirts and ribbed zip polos from Surat. ₹399 each, 3 for ₹799. Shop men's clothes online across India.",
  path: "/",
  absolute: true,
  keywords: ["Silk Room", "Silkroom", "silkroom.shop", "mens polo t shirts", "mens clothes india"],
});

export default async function Home() {
  const settings = await getStoreSettings();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd(products, "/")) }}
      />
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
