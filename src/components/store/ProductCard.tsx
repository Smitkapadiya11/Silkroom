"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SizeSheet } from "@/components/store/SizeSheet";
import { formatInr } from "@/lib/pricing";
import type { Product } from "@/lib/products";

const BLUR =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjgiIGhlaWdodD0iMTAiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjEwIiBmaWxsPSIjN0I3NjY4Ii8+PC9zdmc+";

export function ProductCard({
  product,
  className = "",
  priority = false,
  compact = false,
}: {
  product: Product;
  className?: string;
  priority?: boolean;
  compact?: boolean;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const color = product.colors[0]?.name ?? "Default";
  const rating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : null;

  return (
    <>
      <article className={`store-product-card meesho-card${compact ? " meesho-card--compact" : ""} ${className}`.trim()}>
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
            {rating ? (
              <span className="store-product-rating">{rating.toFixed(1)} ★ · {product.reviews.length} ratings</span>
            ) : null}
            <span className="store-product-price-row">
              <span className="store-product-price">{formatInr(product.price)}</span>
              <span className="store-product-mrp">Free delivery on 3+</span>
            </span>
          </span>
        </Link>

        {!compact ? (
          <button
            type="button"
            className="meesho-card-add"
            onClick={() => setSheetOpen(true)}
            aria-label={`Add ${product.name} to cart`}
          >
            Add
          </button>
        ) : null}
      </article>

      {!compact ? (
        <SizeSheet product={product} open={sheetOpen} onClose={() => setSheetOpen(false)} />
      ) : null}
    </>
  );
}
