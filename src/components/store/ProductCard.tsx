"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/context/CartProvider";
import { cartLinesFromItems } from "@/lib/cart";
import { formatInr, calculateCartPricing } from "@/lib/pricing";
import { SIZES, type Product } from "@/lib/products";

const BLUR =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjgiIGhlaWdodD0iMTAiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjEwIiBmaWxsPSIjN0I3NjY4Ii8+PC9zdmc+";

function upsellCopy(lines: ReturnType<typeof cartLinesFromItems>) {
  const pricing = calculateCartPricing(lines);
  if (pricing.nextRule && pricing.itemsToNext > 0) {
    return `Add ${pricing.itemsToNext} more for ${pricing.nextRule.blurb}`;
  }
  if (pricing.rule && pricing.discount > 0) return pricing.rule.blurb;
  return "3 for ₹799 · save when you add more";
}

export function ProductCard({
  product,
  className = "",
  priority = false,
}: {
  product: Product;
  className?: string;
  priority?: boolean;
}) {
  const router = useRouter();
  const { items, addProduct } = useCart();
  const [size, setSize] = useState<string>("M");
  const color = product.colors[0]?.name ?? "Default";

  const hypothetical = [
    ...cartLinesFromItems(items),
    { slug: product.slug, price: product.price, quantity: 1 },
  ];
  const upsell = upsellCopy(hypothetical);

  const addToCart = (openCart = true) => {
    addProduct(product, size, color, 1, { open: openCart });
  };

  return (
    <article className={`store-product-card ${className}`.trim()}>
      <Link href={`/product/${product.slug}`} className="store-product-link">
        <span className="store-product-image aspect-product">
          {product.isNew ? <span className="product-new-tag">New</span> : null}
          <Image
            src={product.image}
            alt={`${product.name} ribbed quarter-zip polo in ${color}`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            placeholder="blur"
            blurDataURL={BLUR}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
          />
        </span>
        <span className="store-product-meta">
          <span className="store-product-name">{product.name}</span>
          <span className="store-product-color">{color}</span>
          <span className="store-product-price">{formatInr(product.price)}</span>
        </span>
      </Link>

      <p className="store-product-upsell">{upsell}</p>

      <div className="product-card-actions">
        <div className="product-card-sizes" role="group" aria-label={`Select ${product.name} size`}>
          {SIZES.map((item) => (
            <button
              key={item}
              type="button"
              className={size === item ? "is-active" : ""}
              aria-pressed={size === item}
              onClick={() => setSize(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="product-card-buy-row">
          <button type="button" className="button button-primary product-card-add" onClick={() => addToCart(true)}>
            Add to cart
          </button>
          <button
            type="button"
            className="button button-ghost product-card-buy-now"
            onClick={() => {
              addToCart(false);
              router.push("/checkout");
            }}
          >
            Buy now
          </button>
        </div>
      </div>
    </article>
  );
}
