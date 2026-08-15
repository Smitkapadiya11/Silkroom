"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ProductGallery } from "@/components/store/ProductGallery";
import { ProductReviews } from "@/components/store/ProductReviews";
import { useCart } from "@/context/CartProvider";
import { formatInr, calculateCartPricing } from "@/lib/pricing";
import { SIZES, type Product } from "@/lib/products";
import { ProductCard } from "@/components/store/ProductCard";
import { site } from "@/lib/site";

export function ProductDetailClient({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const { addProduct, items } = useCart();
  const [size, setSize] = useState<string>("M");
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [pincode, setPincode] = useState("");
  const sizeChartRef = useRef<HTMLDivElement>(null);
  const sizeChartTriggerRef = useRef<HTMLButtonElement>(null);
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

  useEffect(() => {
    if (!sizeChartOpen) return;
    const dialog = sizeChartRef.current;
    const trigger = sizeChartTriggerRef.current;
    const closeButton = dialog?.querySelector<HTMLButtonElement>("button");
    closeButton?.focus();

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSizeChartOpen(false);
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", trapFocus);
    return () => {
      document.removeEventListener("keydown", trapFocus);
      trigger?.focus();
    };
  }, [sizeChartOpen]);

  return (
    <article className="product-detail">
      <ProductGallery product={product} />
      <div className="product-detail-copy">
        <p className="eyebrow">Colour · {product.colors[0]?.name}</p>
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
          <div>
            <dt>Zip</dt>
            <dd>{product.fabric.zipHardware}</dd>
          </div>
          <div>
            <dt>Collar</dt>
            <dd>{product.fabric.collar}</dd>
          </div>
          <div>
            <dt>Sleeve</dt>
            <dd>{product.fabric.sleeve}</dd>
          </div>
          <div>
            <dt>Origin</dt>
            <dd>{product.fabric.countryOfOrigin}</dd>
          </div>
        </dl>

        <p className="product-delivery">
          <strong>Delivery estimate:</strong> {product.deliveryEstimate}
        </p>

        <label className="product-pincode">
          <span>Check delivery to your pincode</span>
          <input
            value={pincode}
            onChange={(event) => setPincode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="6-digit pincode"
          />
          {pincode.length === 6 ? (
            <small>Estimated dispatch in 24–48 hours · delivery in 3–8 business days.</small>
          ) : null}
        </label>

        <p className="eyebrow">Size</p>
        <div className="size-row" role="group" aria-label="Select size">
          {SIZES.map((item) => (
            <button
              key={item}
              type="button"
              className={size === item ? "size-chip is-active" : "size-chip"}
              onClick={() => setSize(item)}
              aria-pressed={size === item}
            >
              {item}
            </button>
          ))}
        </div>
        <button
          ref={sizeChartTriggerRef}
          type="button"
          className="product-size-link"
          onClick={() => setSizeChartOpen(true)}
        >
          Not sure? Check the size chart
        </button>

        <button
          type="button"
          className="button button-primary product-buy-button"
          onClick={() => addProduct(product, size, color, 1)}
        >
          Add to cart · {formatInr(product.price)} · {size}
        </button>

        <section className="product-accordions" aria-label="Product information">
          <details>
            <summary>Care</summary>
            <ul>
              {product.care.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </details>
          <details>
            <summary>Shipping & returns</summary>
            <p>
              Free delivery above ₹799. {site.exchangeWindowDays}-day exchange on unworn polos
              with tags intact.
            </p>
          </details>
          <details>
            <summary>Our guarantee</summary>
            <p>
              We check the collar, zip and finish before dispatch. If the size is not right,
              message us and we will help arrange an exchange.
            </p>
          </details>
        </section>

        <section className="product-guarantee">
          <p className="eyebrow">Founder&apos;s guarantee</p>
          <p>
            Every polo is made for an easy everyday fit. If it is not right for you, we will
            help make it right within {site.exchangeWindowDays} days.
          </p>
          <p>— Silk Room, {site.whatsappDisplay}</p>
        </section>
        <ProductReviews reviews={product.reviews} />
      </div>

      {sizeChartOpen ? (
        <div ref={sizeChartRef} className="size-chart-modal" role="dialog" aria-modal="true" aria-label="Size chart">
          <div>
            <button type="button" onClick={() => setSizeChartOpen(false)} aria-label="Close size chart">
              ×
            </button>
            <p className="eyebrow">Size chart</p>
            <h2>Measure a polo you already own</h2>
            <table>
              <thead>
                <tr><th>Size</th><th>Chest</th><th>Length</th><th>Shoulder</th></tr>
              </thead>
              <tbody>
                <tr><td>S</td><td>38 in / 96 cm</td><td>27 in / 68 cm</td><td>16.5 in / 42 cm</td></tr>
                <tr><td>M</td><td>40 in / 102 cm</td><td>28 in / 71 cm</td><td>17 in / 43 cm</td></tr>
                <tr><td>L</td><td>42 in / 107 cm</td><td>29 in / 74 cm</td><td>17.5 in / 44 cm</td></tr>
                <tr><td>XL</td><td>44 in / 112 cm</td><td>30 in / 76 cm</td><td>18 in / 46 cm</td></tr>
              </tbody>
            </table>
            <p>Lay it flat. Measure chest armpit to armpit, then double; measure length from shoulder seam to hem.</p>
          </div>
        </div>
      ) : null}

      {related.length ? (
        <section className="product-related" aria-labelledby="related-title">
          <h2 id="related-title">More from the room</h2>
          <div className="product-related-rail">
            {related.map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
