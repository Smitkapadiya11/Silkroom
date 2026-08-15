"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import type { Product } from "@/lib/products";

const BLUR =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjgiIGhlaWdodD0iMTAiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjEwIiBmaWxsPSIjN0I3NjY4Ii8+PC9zdmc+";

export function ProductGallery({ product }: { product: Product }) {
  const images = product.detailImages?.length ? product.detailImages : [product.image];
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "start" });
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setIndex(emblaApi.selectedScrollSnap());
    setZoomed(false);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="product-gallery">
      <div className="product-gallery-viewport" ref={emblaRef}>
        <div className="product-gallery-track">
          {images.map((src, imageIndex) => (
            <figure key={src} className="product-gallery-slide aspect-product">
              <button
                type="button"
                className={zoomed && index === imageIndex ? "is-zoomed" : undefined}
                aria-label={zoomed ? "Zoom out" : "Zoom in"}
                onClick={() => setZoomed((current) => (index === imageIndex ? !current : true))}
              >
                <Image
                  src={src}
                  alt={`${product.name} — view ${imageIndex + 1}`}
                  fill
                  priority={imageIndex === 0}
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  placeholder="blur"
                  blurDataURL={BLUR}
                />
              </button>
            </figure>
          ))}
        </div>
      </div>

      {images.length > 1 ? (
        <>
          <div className="product-gallery-dots" aria-hidden="true">
            {images.map((src, dotIndex) => (
              <button
                key={src}
                type="button"
                className={dotIndex === index ? "is-active" : undefined}
                aria-label={`Show image ${dotIndex + 1}`}
                onClick={() => emblaApi?.scrollTo(dotIndex)}
              />
            ))}
          </div>
          <div className="product-gallery-thumbs" aria-label="Product views">
            {images.map((src, thumbIndex) => (
              <button
                key={src}
                type="button"
                className={thumbIndex === index ? "is-active" : undefined}
                aria-label={`Thumbnail ${thumbIndex + 1}`}
                onClick={() => emblaApi?.scrollTo(thumbIndex)}
              >
                <Image src={src} alt="" fill sizes="72px" placeholder="blur" blurDataURL={BLUR} />
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
