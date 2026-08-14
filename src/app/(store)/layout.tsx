import { StoreFooter } from "@/components/store/StoreFooter";
import { StoreHeader } from "@/components/store/StoreHeader";
import { CartDrawer } from "@/components/store/CartDrawer";
import { ComboOfferBar } from "@/components/store/ComboOfferBar";

export default function StoreLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ComboOfferBar />
      <StoreHeader variant="store" />
      <main className="store-main">{children}</main>
      <StoreFooter />
      <CartDrawer />
    </>
  );
}
