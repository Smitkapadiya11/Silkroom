import { SilkRoomExperience } from "@/components/SilkRoomExperience";
import { CartDrawer } from "@/components/store/CartDrawer";
import { ComboOfferBar } from "@/components/store/ComboOfferBar";
import { StoreHeader } from "@/components/store/StoreHeader";
import { combos, products } from "@/data/products";

export default function Home() {
  return (
    <>
      <ComboOfferBar />
      <StoreHeader variant="landing" />
      <SilkRoomExperience products={products} combos={combos} />
      <CartDrawer />
    </>
  );
}
