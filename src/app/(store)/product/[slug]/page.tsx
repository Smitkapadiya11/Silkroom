import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/store/Breadcrumbs";
import { ProductDetailClient } from "@/components/store/ProductDetailClient";
import { breadcrumbJsonLd, createPageMetadata, organizationJsonLd, productJsonLd } from "@/lib/metadata";
import { getProduct, getRelatedProducts, products } from "@/lib/products";
import { getDb, isDatabaseConfigured } from "@/db";
import { inventory } from "@/db/schema";
import { eq } from "drizzle-orm";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  const color = product.colors[0]?.name ?? "polo";
  return createPageMetadata({
    title: `${product.name} | Men's Polo T-Shirt`,
    description: `${product.name} men's polo t-shirt from Silk Room (silkroom.shop). ${product.blurb} ${product.fabric.gsm} GSM ${product.fabric.composition}. Buy online in India — ₹${product.price}, sizes S–XL, colour ${color}.`,
    path: `/product/${product.slug}`,
    image: product.image,
    keywords: [
      product.name,
      `${color} polo t shirt`,
      "mens polo t shirt",
      "silkroom.shop",
      "Silk Room polo",
    ],
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = getRelatedProducts(slug);
  const inventoryMap: Record<string, number> = {};
  if (isDatabaseConfigured()) {
    try {
      const rows = await getDb().select().from(inventory).where(eq(inventory.productSlug, slug));
      for (const row of rows) inventoryMap[row.size] = row.quantity;
    } catch {
      // Keep purchasing available if inventory is temporarily unavailable.
    }
  }
  const jsonLd = [
    productJsonLd({
      slug: product.slug,
      name: product.name,
      blurb: product.blurb,
      price: product.price,
      image: product.image,
      detailImages: product.detailImages,
      colors: product.colors,
      fabric: product.fabric,
      reviews: product.reviews,
    }),
    organizationJsonLd(),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Shop", path: "/shop" },
      { name: product.name, path: `/product/${product.slug}` },
    ]),
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
          { href: `/product/${product.slug}`, label: product.name },
        ]}
      />
      <ProductDetailClient product={product} related={related} inventoryMap={inventoryMap} />
    </>
  );
}
