import { ShopClient } from "@/components/store/ShopClient";
import { createPageMetadata } from "@/lib/metadata";
import { products } from "@/lib/products";

export const metadata = createPageMetadata({
  title: "Shop all tees",
  description:
    "Browse every Silk Room ribbed zip polo. Filter by colour and size. ₹399 each with combo savings.",
  path: "/shop",
});

export default function ShopPage() {
  return <ShopClient catalog={products} />;
}
