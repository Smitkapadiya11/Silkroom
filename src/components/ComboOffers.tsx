"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  type Combo,
  type Product,
  PRICE,
  SIZES,
  comboSaving,
  productsBySlug,
} from "@/data/products";
import {
  formatInr,
  orderComboMessage,
  whatsappUrl,
} from "@/lib/order";

const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjgiIGhlaWdodD0iMTAiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjEwIiBmaWxsPSIjN0I3NjY4Ii8+PC9zdmc+";

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="icon-arrow">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function ComboOffers({
  products,
  combos,
}: {
  products: Product[];
  combos: Combo[];
}) {
  const [count, setCount] = useState<3 | 5>(3);
  const [picked, setPicked] = useState<string[]>([]);
  const [size, setSize] = useState("M");
  const price = count === 3 ? PRICE.trio : PRICE.five;
  const save = count * PRICE.single - price;

  const toggle = (slug: string) => {
    setPicked((current) => {
      if (current.includes(slug)) return current.filter((item) => item !== slug);
      if (current.length >= count) return [...current.slice(1), slug];
      return [...current, slug];
    });
  };

  const ready = picked.length === count;
  const selectedProducts = useMemo(
    () => productsBySlug(picked),
    [picked],
  );

  return (
    <section
      id="combos"
      className="combo-section section-pad"
      aria-labelledby="combo-title"
    >
      <div className="section-heading" data-reveal>
        <p className="eyebrow">The sale / mix your room</p>
        <h2 id="combo-title">Three for {formatInr(PRICE.trio)}. Five for {formatInr(PRICE.five)}.</h2>
        <p className="combo-lede">
          One polo is {formatInr(PRICE.single)}. The room is cheaper in colour.
          Pick a prepared mix or build your own.
        </p>
      </div>

      <div className="combo-grid">
        {combos.map((combo) => {
          const items = productsBySlug(combo.slugs);
          return (
            <article className="combo-card" key={combo.slug} data-reveal>
              <div className="combo-stack" aria-hidden="true">
                {items.slice(0, 3).map((product, index) => (
                  <span
                    className="combo-stack-shot"
                    key={product.slug}
                    style={{ zIndex: index + 1, left: `${index * 18}%` }}
                  >
                    <Image
                      src={product.image}
                      alt=""
                      fill
                      sizes="160px"
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                    />
                  </span>
                ))}
              </div>
              <p className="combo-kicker">
                {combo.count} polos · save {formatInr(comboSaving(combo))}
              </p>
              <h3>{combo.name}</h3>
              <p>{combo.blurb}</p>
              <div className="swatches" aria-label="Colours in this mix">
                {items.map((product) => (
                  <span
                    key={product.slug}
                    className="swatch"
                    style={{ backgroundColor: product.colors[0].hex }}
                    title={product.colors[0].name}
                  >
                    <span className="sr-only">{product.colors[0].name}</span>
                  </span>
                ))}
              </div>
              <div className="combo-card-foot">
                <p className="price">{formatInr(combo.price)}</p>
                <a
                  className="button button-primary"
                  href={whatsappUrl(
                    orderComboMessage(
                      combo.name,
                      items.map((item) => item.colors[0].name),
                      combo.price,
                      size,
                    ),
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  Order this mix
                  <ArrowIcon />
                </a>
              </div>
            </article>
          );
        })}
      </div>

      <div className="combo-builder" data-reveal>
        <div className="combo-builder-head">
          <div>
            <p className="eyebrow">Build your mix</p>
            <h3>Choose {count} colours</h3>
          </div>
          <div className="combo-count" role="group" aria-label="Combo size">
            <button
              type="button"
              className={count === 3 ? "is-active" : undefined}
              onClick={() => {
                setCount(3);
                setPicked((current) => current.slice(0, 3));
              }}
            >
              3 · {formatInr(PRICE.trio)}
            </button>
            <button
              type="button"
              className={count === 5 ? "is-active" : undefined}
              onClick={() => setCount(5)}
            >
              5 · {formatInr(PRICE.five)}
            </button>
          </div>
        </div>

        <div className="combo-picker">
          {products.map((product) => {
            const selected = picked.includes(product.slug);
            return (
              <button
                key={product.slug}
                type="button"
                className={selected ? "combo-pick is-on" : "combo-pick"}
                onClick={() => toggle(product.slug)}
                aria-pressed={selected}
              >
                <span className="combo-pick-image">
                  <Image
                    src={product.image}
                    alt=""
                    fill
                    sizes="120px"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                  />
                </span>
                <span>{product.colors[0].name}</span>
              </button>
            );
          })}
        </div>

        <div className="size-row" role="group" aria-label="Size for this mix">
          {SIZES.map((option) => (
            <button
              key={option}
              type="button"
              className={size === option ? "size-chip is-active" : "size-chip"}
              onClick={() => setSize(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="combo-builder-foot">
          <p>
            {ready
              ? `${selectedProducts.map((item) => item.colors[0].name).join(" · ")} · save ${formatInr(save)}`
              : `Select ${count - picked.length} more colour${count - picked.length === 1 ? "" : "s"}`}
          </p>
          {ready ? (
            <a
              className="button button-primary"
              href={whatsappUrl(
                orderComboMessage(
                  `Custom ${count}`,
                  selectedProducts.map((item) => item.colors[0].name),
                  price,
                  size,
                ),
              )}
              target="_blank"
              rel="noreferrer"
            >
              Order {formatInr(price)} mix
              <ArrowIcon />
            </a>
          ) : (
            <span className="button button-ghost" aria-disabled="true">
              Pick {count} colours
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
