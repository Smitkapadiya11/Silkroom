"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ProductGallery } from "@/components/store/ProductGallery";
import { ProductReviews } from "@/components/store/ProductReviews";
import { useCart } from "@/context/CartProvider";
import { formatInr, calculateCartPricing } from "@/lib/pricing";
import { SIZES, type Product } from "@/lib/products";
import { ProductCard } from "@/components/store/ProductCard";

export function ProductDetailClient({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const { addProduct, items } = useCart();
  const [size, setSize] = useState<string>("M");
  const color = product.colors[0]?.name ?? "Default";

  const upsell = useMemo(() => {
    const lines = [
      ...items.map((item) => ({
        slug: item.slug,
        price: item.price,
        quantity: item.quantity,
      })),
      { slug: product.slug, price: product.price, quantity: 1 },
    ];
    const pricing = calculateCartPricing(lines);
    if (pricing.nextRule && pricing.itemsToNext > 0) {
      return `Add ${pricing.itemsToNext} more, save ${formatInr(pricing.nextSaving)}`;
    }
    return pricing.rule?.blurb ?? null;
  }, [items, product]);

  return (
    <article className="product-detail">
      <ProductGallery product={product} />
      <div className="product-detail-copy">
        <p className="eyebrow">{product.colors[0]?.name}</p>
        <h1>{product.name}</h1>
        <p className="product-detail-price">{formatInr(product.price)}</p>
        <p>{product.blurb}</p>
        {upsell ? <p className="store-product-upsell">{upsell}</p> : null}

        <dl className="product-specs">
          <div>
            <dt>GSM</dt>
            <dd>{product.fabric.gsm}</dd>
          </div>
          <div>
            <dt>Composition</dt>
            <dd>{product.fabric.composition}</dd>
          </div>
          <div>
            <dt>Fit</dt>
            <dd>{product.fabric.fit}</dd>
          </div>
          <div>
            <dt>Pre-shrunk</dt>
            <dd>{product.fabric.preShrunk ? "Yes" : "No"}</dd>
          </div>
        </dl>

        <p className="product-delivery">
          <strong>Delivery estimate:</strong> {product.deliveryEstimate}
        </p>

        <div className="size-row" role="group" aria-label="Select size">
          {SIZES.map((item) => (
            <button
              key={item}
              type="button"
              className={size === item ? "size-chip is-active" : "size-chip"}
              onClick={() => setSize(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <Link href="/size-guide" className="product-size-link">
          Size chart & how to measure
        </Link>

        <button
          type="button"
          className="button button-primary"
          onClick={() => addProduct(product, size, color, 1)}
        >
          Add to cart — {size}
        </button>

        <section className="product-care" aria-labelledby="care-title">
          <h2 id="care-title">Care</h2>
          <ul>
            {product.care.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>

        <ProductReviews reviews={product.reviews} />
      </div>

      {related.length ? (
        <section className="product-related" aria-labelledby="related-title">
          <h2 id="related-title">More from the room</h2>
          <div className="store-grid">
            {related.map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
