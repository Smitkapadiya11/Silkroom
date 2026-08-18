"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, type MouseEvent } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { Product } from "@/lib/products";

const BLUR =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjgiIGhlaWdodD0iMTAiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjEwIiBmaWxsPSIjN0I3NjY4Ii8+PC9zdmc+";

export function ProductGallery({ product }: { product: Product }) {
  const images = product.detailImages?.length ? product.detailImages : [product.image];
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1, align: "start", dragFree: false });
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [origin, setOrigin] = useState("50% 50%");

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setIndex(emblaApi.selectedScrollSnap());
    setZoom(1);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(false);
      if (event.key === "ArrowRight") emblaApi?.scrollNext();
      if (event.key === "ArrowLeft") emblaApi?.scrollPrev();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [lightbox, emblaApi]);

  const openZoom = (event: MouseEvent<HTMLButtonElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width) * 100;
    const y = ((event.clientY - box.top) / box.height) * 100;
    setOrigin(`${x}% ${y}%`);
    setZoom(1);
    setLightbox(true);
  };

  return (
    <div className="product-gallery">
      <div className="product-gallery-main">
        <div className="product-gallery-viewport" ref={emblaRef}>
          <div className="product-gallery-track">
            {images.map((src, imageIndex) => (
              <figure key={src} className="product-gallery-slide aspect-product">
                <button type="button" aria-label="Zoom image" onClick={openZoom}>
                  <Image
                    src={src}
                    alt={`${product.name} — photo ${imageIndex + 1} of ${images.length}`}
                    fill
                    priority={imageIndex === 0}
                    sizes="(min-width: 1024px) 48vw, 100vw"
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
            <p className="product-gallery-count">
              {index + 1} / {images.length}
            </p>
            <p className="product-gallery-hint">Swipe for more · tap to zoom</p>
            <div className="product-gallery-dots" role="tablist" aria-label="Product photos">
              {images.map((src, dotIndex) => (
                <button
                  key={src}
                  type="button"
                  role="tab"
                  aria-selected={dotIndex === index}
                  className={dotIndex === index ? "is-active" : undefined}
                  aria-label={`Photo ${dotIndex + 1}`}
                  onClick={() => emblaApi?.scrollTo(dotIndex)}
                />
              ))}
            </div>
          </>
        ) : (
          <p className="product-gallery-hint">Tap photo to zoom</p>
        )}
      </div>

      {images.length > 1 ? (
        <div className="product-gallery-thumbs" aria-label="Product views">
          {images.map((src, thumbIndex) => (
            <button
              key={src}
              type="button"
              className={thumbIndex === index ? "is-active" : undefined}
              aria-label={`View photo ${thumbIndex + 1}`}
              onClick={() => emblaApi?.scrollTo(thumbIndex)}
            >
              <Image src={src} alt="" fill sizes="72px" placeholder="blur" blurDataURL={BLUR} />
            </button>
          ))}
        </div>
      ) : null}

      {lightbox ? (
        <div className="product-lightbox" role="dialog" aria-modal="true" aria-label="Zoomed product photo">
          <header className="product-lightbox-bar">
            <p>
              {index + 1} / {images.length}
            </p>
            <div>
              <button type="button" onClick={() => setZoom((value) => (value > 1 ? 1 : 2.2))}>
                {zoom > 1 ? "Zoom out" : "Zoom in"}
              </button>
              <button type="button" onClick={() => setLightbox(false)} aria-label="Close zoom">
                Close
              </button>
            </div>
          </header>
          <button
            type="button"
            className="product-lightbox-stage"
            onClick={(event) => {
              const box = event.currentTarget.getBoundingClientRect();
              setOrigin(
                `${((event.clientX - box.left) / box.width) * 100}% ${((event.clientY - box.top) / box.height) * 100}%`,
              );
              setZoom((value) => (value > 1 ? 1 : 2.2));
            }}
          >
            <Image
              src={images[index]}
              alt={`${product.name} zoomed`}
              fill
              sizes="100vw"
              style={{ transform: `scale(${zoom})`, transformOrigin: origin }}
            />
          </button>
        </div>
      ) : null}
    </div>
  );
}
