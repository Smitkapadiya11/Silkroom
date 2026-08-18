"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ProductGallery } from "@/components/store/ProductGallery";
import { ProductReviews } from "@/components/store/ProductReviews";
import { ProductCard } from "@/components/store/ProductCard";
import { useCart } from "@/context/CartProvider";
import { useStoreSettings } from "@/context/StoreSettingsProvider";
import { formatInr } from "@/lib/pricing";
import { products, SIZES, type Product } from "@/lib/products";
import { site } from "@/lib/site";

export function ProductDetailClient({
  product,
  related,
  inventoryMap = {},
}: {
  product: Product;
  related: Product[];
  inventoryMap?: Record<string, number>;
}) {
  const router = useRouter();
  const { addProduct } = useCart();
  const { contact, combo3PriceInr, unitPriceInr } = useStoreSettings();
  const [size, setSize] = useState<string>("M");
  const [quantity, setQuantity] = useState(1);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [pincode, setPincode] = useState("");
  const sizeChartRef = useRef<HTMLDivElement>(null);
  const sizeChartTriggerRef = useRef<HTMLButtonElement>(null);
  const color = product.colors[0]?.name ?? "Default";
  const soldOut = inventoryMap[size] === 0;
  const rating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0;

  const lineTotal = product.price * quantity;

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
        dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
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

  const addToCart = (openCart = true) => {
    if (soldOut) return;
    addProduct(product, size, color, quantity, { open: openCart });
  };

  return (
    <article className="product-detail meesho-product">
      <ProductGallery product={product} />
      <div className="product-detail-copy">
        <p className="eyebrow">Silk Room · {product.category === "design" ? "New design" : "Solid"}</p>
        <h1>{product.name}</h1>
        {product.reviews.length ? (
          <p className="product-rating">
            {rating.toFixed(1)} ★ · {product.reviews.length} reviews · Verified buyers
          </p>
        ) : null}
        <p className="product-detail-price meesho-product-price">
          {formatInr(product.price)}
          {quantity > 1 ? <span>{formatInr(lineTotal)} for {quantity}</span> : null}
        </p>
        <p className="meesho-offer-badge">
          {formatInr(unitPriceInr)} each · 3 for {formatInr(combo3PriceInr)} auto-applied in cart
        </p>
        <p>{product.blurb}</p>

        <ul className="product-highlights">
          <li>220 GSM {product.category === "design" ? "waffle knit" : "cotton-elastane rib"}</li>
          <li>{product.fabric.zipHardware}</li>
          <li>{product.fabric.fit.split("—")[0].trim()}</li>
          <li>Packed in Surat · dispatch in 24–48 hrs</li>
        </ul>

        <div className="product-trust-row" aria-label="Why buy here">
          <span>Secure prepaid</span>
          <span>{site.exchangeWindowDays}-day exchange</span>
          <span>Free delivery on 3+</span>
          <span>Razorpay secure</span>
        </div>

        <div className="product-color-row" aria-label="Available colours">
          <p className="eyebrow">Colour · {color}</p>
          <div>
            {products.map((item) => (
              <Link
                key={item.slug}
                href={`/product/${item.slug}`}
                className={item.slug === product.slug ? "is-active" : undefined}
                aria-label={item.colors[0]?.name}
                title={item.colors[0]?.name}
                style={{ backgroundColor: item.colors[0]?.hex }}
              />
            ))}
          </div>
          <p className="product-color-names">
            {products.map((item) => item.colors[0]?.name).filter(Boolean).join(" · ")}
          </p>
        </div>

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
            <small>
              Yes — we deliver to {pincode}. Dispatch in 24–48 hours after confirmation. Metro 3–6
              days, other cities 5–8 days.
            </small>
          ) : (
            <small>{product.deliveryEstimate}</small>
          )}
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
              disabled={inventoryMap[item] === 0}
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
          Not sure? Open the size chart
        </button>

        <div className="product-qty" aria-label="Quantity">
          <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
            −
          </button>
          <span>{quantity}</span>
          <button type="button" onClick={() => setQuantity((value) => Math.min(5, value + 1))}>
            +
          </button>
        </div>

        <div className="product-buy-row product-buy-row--desktop">
          <button
            type="button"
            className="button button-primary product-buy-button"
            onClick={() => addToCart(true)}
            disabled={soldOut}
          >
            {soldOut ? "Sold out" : "Add to cart"}
          </button>
          <button
            type="button"
            className="button button-ghost product-buy-now"
            onClick={() => {
              addToCart(false);
              router.push("/checkout");
            }}
            disabled={soldOut}
          >
            Buy now
          </button>
        </div>

        <dl className="product-specs">
          <div>
            <dt>GSM</dt>
            <dd>{product.fabric.gsm}</dd>
          </div>
          <div>
            <dt>Fabric</dt>
            <dd>{product.fabric.composition}</dd>
          </div>
          <div>
            <dt>Fit</dt>
            <dd>{product.fabric.fit}</dd>
          </div>
          <div>
            <dt>Zip</dt>
            <dd>{product.fabric.zipHardware}</dd>
          </div>
          <div>
            <dt>Origin</dt>
            <dd>{product.fabric.countryOfOrigin}</dd>
          </div>
        </dl>

        <section className="product-accordions" aria-label="Product information">
          <details open>
            <summary>How to buy</summary>
            <ol>
              <li>Pick your colour and size.</li>
              <li>Add to cart, or tap Buy now.</li>
              <li>Enter your address. Pay securely with UPI, card, or netbanking.</li>
              <li>We pack from Surat in 24–48 hours after confirmation.</li>
            </ol>
          </details>
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
              Free delivery above ₹799. {site.exchangeWindowDays}-day exchange on unworn polos with
              tags intact. Message {contact.phone} if the size is wrong.
            </p>
          </details>
          <details>
            <summary>Our guarantee</summary>
            <p>
              We check the collar, zip and finish before dispatch. If it is not right, a person
              replies during {site.responseHours}.
            </p>
          </details>
        </section>

        <section className="product-guarantee">
          <p className="eyebrow">Founder&apos;s guarantee</p>
          <p>
            Every polo is made for an easy everyday fit. If it is not right for you, we will help
            make it right within {site.exchangeWindowDays} days.
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
                <tr>
                  <th>Size</th>
                  <th>Chest</th>
                  <th>Length</th>
                  <th>Shoulder</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>S</td>
                  <td>38 in / 96 cm</td>
                  <td>27 in / 68 cm</td>
                  <td>16.5 in / 42 cm</td>
                </tr>
                <tr>
                  <td>M</td>
                  <td>40 in / 102 cm</td>
                  <td>28 in / 71 cm</td>
                  <td>17 in / 43 cm</td>
                </tr>
                <tr>
                  <td>L</td>
                  <td>42 in / 107 cm</td>
                  <td>29 in / 74 cm</td>
                  <td>17.5 in / 44 cm</td>
                </tr>
                <tr>
                  <td>XL</td>
                  <td>44 in / 112 cm</td>
                  <td>30 in / 76 cm</td>
                  <td>18 in / 46 cm</td>
                </tr>
              </tbody>
            </table>
            <p>
              Lay it flat. Measure chest armpit to armpit, then double; measure length from
              shoulder seam to hem.
            </p>
          </div>
        </div>
      ) : null}

      {related.length ? (
        <section className="product-related" aria-labelledby="related-title">
          <h2 id="related-title">More colours from the room</h2>
          <div className="product-related-rail">
            {related.map((item) => (
              <ProductCard key={item.slug} product={item} compact />
            ))}
          </div>
        </section>
      ) : null}

      <div className="meesho-sticky-buy" aria-label="Buy options">
        <div className="meesho-sticky-buy-price">
          <strong>{formatInr(lineTotal)}</strong>
          <span>Size {size} · Qty {quantity}</span>
        </div>
        <button
          type="button"
          className="meesho-sticky-add"
          onClick={() => addToCart(true)}
          disabled={soldOut}
        >
          Add to cart
        </button>
        <button
          type="button"
          className="meesho-sticky-buy-now"
          onClick={() => {
            addToCart(false);
            router.push("/checkout");
          }}
          disabled={soldOut}
        >
          Buy now
        </button>
      </div>
    </article>
  );
}
