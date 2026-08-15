import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/store/ProductDetailClient";
import { createPageMetadata, productJsonLd, organizationJsonLd } from "@/lib/metadata";
import { getProduct, getRelatedProducts, products } from "@/lib/products";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return createPageMetadata({
    title: product.name,
    description: `${product.blurb} ${product.fabric.gsm} GSM · ${product.fabric.composition}.`,
    path: `/product/${product.slug}`,
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = getRelatedProducts(slug);
  const jsonLd = [productJsonLd({
    slug: product.slug,
    name: product.name,
    blurb: product.blurb,
    price: product.price,
    image: product.image,
    reviews: product.reviews,
  }), organizationJsonLd()];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product} related={related} />
    </>
  );
}
