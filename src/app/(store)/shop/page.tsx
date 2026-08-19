import { Suspense } from "react";
import { Breadcrumbs } from "@/components/store/Breadcrumbs";
import { ShopClient } from "@/components/store/ShopClient";
import { breadcrumbJsonLd, createPageMetadata, itemListJsonLd } from "@/lib/metadata";
import { products } from "@/lib/products";

export const metadata = createPageMetadata({
  title: "Shop Men's Polo T-Shirts Online",
  description:
    "Shop all Silk Room men's polo t-shirts at silkroom.shop. Filter by colour and size. ₹399 each, 3 for ₹799. Men's clothes from Surat, delivered across India.",
  path: "/shop",
  keywords: [
    "shop polo t shirts",
    "mens polo t shirts online",
    "silkroom shop",
    "silkroom.shop",
    "mens clothes online india",
  ],
});

export default function ShopPage() {
  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Shop men's polo t-shirts", path: "/shop" },
    ]),
    itemListJsonLd(products, "/shop"),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/shop", label: "Shop" },
        ]}
      />
      <Suspense fallback={<div className="shop-page" aria-busy="true" />}>
        <ShopClient catalog={products} />
      </Suspense>
    </>
  );
}
