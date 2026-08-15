"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { animate, createScope } from "animejs";
import { useCart } from "@/context/CartProvider";
import { formatInr, calculateCartPricing } from "@/lib/pricing";
import { SIZES, type Product } from "@/lib/products";

type ComboSelection = { slug: string; size: string };
const COMBO_STORAGE_KEY = "silkroom-combo-selection";

const BLUR =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjgiIGhlaWdodD0iMTAiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjEwIiBmaWxsPSIjN0I3NjY4Ii8+PC9zdmc+";

function validStoredSelections(value: unknown, products: Product[]): ComboSelection[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value
    .flatMap((item) => {
      if (
        !item ||
        typeof item !== "object" ||
        typeof item.slug !== "string" ||
        typeof item.size !== "string" ||
        seen.has(item.slug) ||
        !products.some((product) => product.slug === item.slug) ||
        !SIZES.includes(item.size as (typeof SIZES)[number])
      ) {
        return [];
      }
      seen.add(item.slug);
      return [{ slug: item.slug, size: item.size }];
    })
    .slice(0, 5);
}

export function ComboBuilder({ products }: { products: Product[] }) {
  const { addProduct } = useCart();
  const [picked, setPicked] = useState<ComboSelection[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const priceRef = useRef<HTMLParagraphElement>(null);
  const scopeRoot = useRef<HTMLDivElement>(null);

  const lines = useMemo(
    () =>
      picked.map((selection) => {
        const product = products.find((item) => item.slug === selection.slug);
        return {
          slug: selection.slug,
          price: product?.price ?? 0,
          quantity: 1,
        };
      }),
    [picked, products],
  );

  const pricing = useMemo(() => calculateCartPricing(lines), [lines]);
  const displayTotal = pricing.total;

  useEffect(() => {
    try {
      setPicked(validStoredSelections(JSON.parse(localStorage.getItem(COMBO_STORAGE_KEY) ?? "[]"), products));
    } catch {
      localStorage.removeItem(COMBO_STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, [products]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(COMBO_STORAGE_KEY, JSON.stringify(picked));
    } catch {
      // The builder remains usable when browser storage is unavailable.
    }
  }, [hydrated, picked]);

  useEffect(() => {
    if (!priceRef.current) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      priceRef.current.textContent = formatInr(displayTotal);
      priceRef.current.dataset.value = String(displayTotal);
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
      current.some((item) => item.slug === slug)
        ? current.filter((item) => item.slug !== slug)
        : [...current, { slug, size: "M" }],
    );
  };

  const setSelectionSize = (slug: string, size: string) => {
    setPicked((current) =>
      current.map((item) => (item.slug === slug ? { ...item, size } : item)),
    );
  };

  const upgradeToFive = () => {
    const remaining = products.filter((product) => !picked.some((item) => item.slug === product.slug));
    setPicked((current) => [
      ...current,
      ...remaining.slice(0, Math.max(0, 5 - current.length)).map((product) => ({
        slug: product.slug,
        size: "M",
      })),
    ]);
  };

  const addBundleToCart = () => {
    picked.forEach((selection) => {
      const product = products.find((item) => item.slug === selection.slug);
      if (!product) return;
      addProduct(product, selection.size, product.colors[0]?.name ?? "Default", 1);
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
          <p className="combo-builder-saving combo-savings-stamp">
            Saving {formatInr(pricing.discount)} · {pricing.rule?.label}
          </p>
        ) : (
          <p className="combo-builder-saving">
            {picked.length} of 3 chosen — add {Math.max(0, 3 - picked.length)} more to save ₹398.
          </p>
        )}
      </div>

      <div className="combo-builder-grid">
        {products.map((product) => {
          const selection = picked.find((item) => item.slug === product.slug);
          const active = Boolean(selection);
          return (
            <article
              key={product.slug}
              className={active ? "combo-pick is-active" : "combo-pick"}
            >
              <button
                type="button"
                className="combo-pick-select"
                onClick={() => toggle(product.slug)}
                aria-pressed={active}
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
                <span>{product.colors[0]?.name}</span>
              </button>
              {selection ? (
                <div className="combo-pick-sizes" role="group" aria-label={`Choose ${product.name} size`}>
                  {SIZES.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={selection.size === item ? "is-active" : ""}
                      aria-pressed={selection.size === item}
                      onClick={() => setSelectionSize(product.slug, item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      {picked.length === 3 ? (
        <button type="button" className="combo-upgrade" onClick={upgradeToFive}>
          Add 2 more for ₹500 and save ₹696 instead
        </button>
      ) : null}

      <button
        type="button"
        className="button button-primary combo-builder-cta"
        disabled={picked.length === 0}
        onClick={addBundleToCart}
      >
        Add {picked.length} polo{picked.length === 1 ? "" : "s"} to cart · {formatInr(displayTotal)}
      </button>
    </div>
  );
}
