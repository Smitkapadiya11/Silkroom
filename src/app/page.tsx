import { CartDrawer } from "@/components/store/CartDrawer";
import { V2Landing } from "@/components/v2/V2Landing";
import { products } from "@/data/products";

export default function Home() {
  return (
    <>
      <V2Landing products={products} />
      <CartDrawer />
    </>
  );
}
