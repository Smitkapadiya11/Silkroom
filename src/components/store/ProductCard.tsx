"use client";

import Image from "next/image";
import Link from "next/link";
import { formatInr } from "@/lib/pricing";
import { calculateCartPricing, type CartLine } from "@/lib/pricing";
import { cartLinesFromItems } from "@/lib/cart";
import type { Product } from "@/lib/products";
import { useCart } from "@/context/CartProvider";

const BLUR =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjgiIGhlaWdodD0iMTAiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjEwIiBmaWxsPSIjN0I3NjY4Ii8+PC9zdmc+";

function upsellCopy(currentQty: number, lines: CartLine[]) {
  const pricing = calculateCartPricing(lines);
  if (pricing.nextRule && pricing.itemsToNext > 0) {
    return `Add ${pricing.itemsToNext} more — ${pricing.nextRule.label.replace("Any ", "")} for ${formatInr(pricing.nextRule.value)}, save ${formatInr(pricing.nextSaving)}`;
  }
  if (pricing.rule) return pricing.rule.blurb;
  return null;
}

export function ProductCard({
  product,
  className = "",
}: {
  product: Product;
  className?: string;
}) {
  const { items } = useCart();
  const cartQty = items.reduce((sum, item) => sum + item.quantity, 0);
  const hypothetical: CartLine[] = [
    ...cartLinesFromItems(items),
    { slug: product.slug, price: product.price, quantity: 1 },
  ];
  const upsell = upsellCopy(cartQty + 1, hypothetical);

  return (
    <article className={`store-product-card ${className}`.trim()}>
      <Link href={`/product/${product.slug}`} className="store-product-link">
        <span className="store-product-image aspect-product">
          <Image
            src={product.image}
            alt={`${product.name} ribbed quarter-zip polo in ${product.colors[0]?.name ?? "colour"}`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            placeholder="blur"
            blurDataURL={BLUR}
          />
        </span>
        <span className="store-product-meta">
          <span className="store-product-name">{product.name}</span>
          <span className="store-product-color">{product.colors[0]?.name}</span>
          <span className="store-product-price">{formatInr(product.price)}</span>
        </span>
      </Link>
      {upsell ? <p className="store-product-upsell">{upsell}</p> : null}
    </article>
  );
}
