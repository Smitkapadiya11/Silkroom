"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { Product } from "@/lib/products";

const BLUR =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjgiIGhlaWdodD0iMTAiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjEwIiBmaWxsPSIjN0I3NjY4Ii8+PC9zdmc+";

export function ProductGallery({ product }: { product: Product }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const images = product.detailImages.length ? product.detailImages : [product.image];

  const scrollTo = (next: number) => {
    const node = track.current;
    if (!node) return;
    const clamped = Math.max(0, Math.min(images.length - 1, next));
    setIndex(clamped);
    node.scrollTo({ left: clamped * node.clientWidth, behavior: "auto" });
  };

  return (
    <div className="product-gallery">
      <div
        ref={track}
        className="product-gallery-track"
        onScroll={() => {
          const node = track.current;
          if (!node || !node.clientWidth) return;
          setIndex(Math.round(node.scrollLeft / node.clientWidth));
        }}
      >
        {images.map((src, imageIndex) => (
          <figure key={src} className="product-gallery-slide aspect-product">
            <Image
              src={src}
              alt={`${product.name} — view ${imageIndex + 1}`}
              fill
              priority={imageIndex === 0}
              sizes="(min-width: 1024px) 45vw, 100vw"
              placeholder="blur"
              blurDataURL={BLUR}
            />
          </figure>
        ))}
      </div>
      {images.length > 1 ? (
        <div className="product-gallery-dots" aria-hidden="true">
          {images.map((src, dotIndex) => (
            <button
              key={src}
              type="button"
              className={dotIndex === index ? "is-active" : undefined}
              aria-label={`Show image ${dotIndex + 1}`}
              onClick={() => scrollTo(dotIndex)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
