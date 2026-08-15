import { StoreFooter } from "@/components/store/StoreFooter";
import { StoreHeader } from "@/components/store/StoreHeader";
import { CartDrawer } from "@/components/store/CartDrawer";
import { ComboOfferBar } from "@/components/store/ComboOfferBar";
import { FloatingWhatsApp } from "@/components/store/FloatingWhatsApp";

export default function StoreLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <div className="store-sticky-stack">
        <ComboOfferBar />
        <StoreHeader variant="store" />
      </div>
      <main className="store-main">{children}</main>
      <StoreFooter />
      <CartDrawer />
      <FloatingWhatsApp />
    </>
  );
}
