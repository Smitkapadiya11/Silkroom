"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { animate, createScope } from "animejs";
import { useCart } from "@/context/CartProvider";
import { formatInr, calculateCartPricing } from "@/lib/pricing";
import { SIZES, type Product } from "@/lib/products";

const BLUR =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjgiIGhlaWdodD0iMTAiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjEwIiBmaWxsPSIjN0I3NjY4Ii8+PC9zdmc+";

export function ComboBuilder({ products }: { products: Product[] }) {
  const { addProduct } = useCart();
  const [picked, setPicked] = useState<string[]>([]);
  const [size, setSize] = useState("M");
  const priceRef = useRef<HTMLParagraphElement>(null);
  const scopeRoot = useRef<HTMLDivElement>(null);

  const lines = useMemo(
    () =>
      picked.map((slug) => {
        const product = products.find((item) => item.slug === slug);
        return {
          slug,
          price: product?.price ?? 0,
          quantity: 1,
        };
      }),
    [picked, products],
  );

  const pricing = useMemo(() => calculateCartPricing(lines), [lines]);
  const displayTotal = pricing.total;

  useEffect(() => {
    if (!priceRef.current) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      priceRef.current.textContent = formatInr(displayTotal);
      return;
    }

    const node = priceRef.current;
    const from = Number(node.dataset.value ?? displayTotal);
    const counter = { v: from };
    const scope = createScope({ root: scopeRoot });
    scope.add(() => {
      animate(counter, {
        v: displayTotal,
        duration: 480,
        ease: "outExpo",
        onUpdate: () => {
          const value = Math.round(counter.v);
          node.textContent = formatInr(value);
          node.dataset.value = String(value);
        },
      });
    });
    return () => scope.revert();
  }, [displayTotal]);

  const toggle = (slug: string) => {
    setPicked((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug],
    );
  };

  const addBundleToCart = () => {
    picked.forEach((slug) => {
      const product = products.find((item) => item.slug === slug);
      if (!product) return;
      addProduct(product, size, product.colors[0]?.name ?? "Default", 1);
    });
  };

  return (
    <div ref={scopeRoot} className="combo-builder">
      <div className="combo-builder-head">
        <p className="eyebrow">Bundle builder</p>
        <p ref={priceRef} className="combo-builder-price" data-value={String(displayTotal)}>
          {formatInr(displayTotal)}
        </p>
        {pricing.discount > 0 ? (
          <p className="combo-builder-saving">
            Saving {formatInr(pricing.discount)} · {pricing.rule?.label}
          </p>
        ) : pricing.nextRule ? (
          <p className="combo-builder-saving">
            Add {pricing.itemsToNext} more for {pricing.nextRule.blurb}
          </p>
        ) : null}
      </div>

      <div className="size-row">
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

      <div className="combo-builder-grid">
        {products.map((product) => {
          const active = picked.includes(product.slug);
          return (
            <button
              key={product.slug}
              type="button"
              className={active ? "combo-pick is-active" : "combo-pick"}
              onClick={() => toggle(product.slug)}
            >
              <span className="aspect-product combo-pick-image">
                <Image
                  src={product.image}
                  alt=""
                  fill
                  sizes="120px"
                  placeholder="blur"
                  blurDataURL={BLUR}
                />
              </span>
              <span>{product.name}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="button button-primary"
        disabled={picked.length === 0}
        onClick={addBundleToCart}
      >
        Add {picked.length} tee{picked.length === 1 ? "" : "s"} to cart
      </button>
    </div>
  );
}
