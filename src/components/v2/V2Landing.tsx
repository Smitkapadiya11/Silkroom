"use client";

import Image from "next/image";
import Link from "next/link";
import { ComboBuilder } from "@/components/store/ComboBuilder";
import { ComboOfferBar } from "@/components/store/ComboOfferBar";
import { PlaceholderFrame } from "@/components/store/PlaceholderFrame";
import { StoreFooter } from "@/components/store/StoreFooter";
import { StoreHeader } from "@/components/store/StoreHeader";
import { TrustStrip } from "@/components/store/TrustStrip";
import type { Product } from "@/lib/products";

const faqs = [
  ["What comes in the 3 for ₹799 offer?", "Choose any three polos from the colour edit, select a size, then add the bundle to your cart."],
  ["Can I choose different colours?", "Yes. The combo builder is made for mixing colours across the edit."],
  ["What size should I order?", "Use the size guide for measurements. The fit is relaxed regular, and exchanges are available within seven days."],
  ["Is cash on delivery available?", "Yes. Cash on delivery is available across India."],
  ["How long does delivery take?", "Metro deliveries usually take 3–6 business days. Other locations can take 5–8 business days."],
  ["How do I start an exchange?", "Send us your order details on WhatsApp within seven days of delivery and we will help with the next step."],
] as const;

const deliverySteps = [
  ["01", "Pick", "Build any 3 or 5 colours in the combo builder, or shop singles."],
  ["02", "Order", "Checkout prepaid (save ₹50) or COD (+₹49). WhatsApp stays available."],
  ["03", "Dispatch", "We pack from Surat in 24–48 hours after confirmation."],
  ["04", "Delivered", "Metro 3–6 days with tracking. Wrong size? 7-day easy exchange."],
] as const;

export function V2Landing({ products }: { products: Product[] }) {
  const heroProduct = products[0];
  const detailProducts = products.slice(0, 3);
  const fabric = heroProduct.fabric;

  return (
    <div className="v2-landing">
      <ComboOfferBar />
      <StoreHeader variant="landing" />
      <main>
        <section className="v2-hero" aria-labelledby="hero-title">
          <div className="v2-hero-copy">
            <p className="v2-kicker">The everyday polo edit</p>
            <h1 id="hero-title">
              3 FOR <span>₹799</span>
            </h1>
            <p className="v2-hero-lede">
              <span className="is-flame">₹399 each · save ₹398</span>
              <br />
              Five for ₹1,299. Free delivery over ₹799. COD available.
            </p>
            <div className="v2-hero-actions">
              <a className="v2-button v2-button--flame" href="#build">
                Build your combo
              </a>
              <Link className="v2-button v2-button--ghost" href="/shop">
                Shop all polos
              </Link>
            </div>
          </div>
          <div className="v2-hero-image">
            <Image src={heroProduct.image} alt={heroProduct.name} fill priority sizes="(min-width: 900px) 50vw, 100vw" />
          </div>
        </section>

        <TrustStrip className="trust-strip--landing" />

        <section id="build" className="v2-section v2-builder-section" aria-labelledby="build-title">
          <div className="v2-section-heading">
            <p className="v2-kicker">Build the edit</p>
            <h2 id="build-title">Your colours. Your three.</h2>
            <p>One fit, one price, a wardrobe that works harder.</p>
          </div>
          <ComboBuilder products={products} />
        </section>

        <section className="v2-section v2-low-price" aria-labelledby="low-price-title">
          <p className="v2-kicker">Why the price stays low</p>
          <h2 id="low-price-title">Less noise between the cut and your wardrobe.</h2>
          <div className="v2-three-up">
            <p><strong>Direct orders</strong><span>We keep ordering simple, with WhatsApp support from cart to delivery.</span></p>
            <p><strong>One focused style</strong><span>Seven colours share one carefully developed ribbed zip-polo cut.</span></p>
            <p><strong>Small, useful edit</strong><span>We spend on the fabric and fit, not on a crowded catalogue.</span></p>
          </div>
        </section>

        <section className="v2-section v2-specs" aria-labelledby="specs-title">
          <div className="v2-section-heading">
            <p className="v2-kicker">The receipt</p>
            <h2 id="specs-title">Fabric, without the flourish.</h2>
          </div>
          <dl className="v2-receipt">
            <div><dt>Fabric</dt><dd>{fabric.composition}</dd></div>
            <div><dt>Weight</dt><dd>{fabric.gsm} GSM rib knit</dd></div>
            <div><dt>Fit</dt><dd>{fabric.fit}</dd></div>
            <div><dt>Finish</dt><dd>{fabric.preShrunk ? "Pre-shrunk" : "Standard finish"}</dd></div>
            <div><dt>Care</dt><dd>Machine wash cold, inside out</dd></div>
          </dl>
        </section>

        <section className="v2-section" aria-labelledby="detail-title">
          <div className="v2-section-heading">
            <p className="v2-kicker">Look closer</p>
            <h2 id="detail-title">The details earn their place.</h2>
          </div>
          <div className="v2-detail-gallery">
            {detailProducts.map((product) =>
              product.detailImages?.length ? (
                <figure key={product.slug} className="v2-detail-card">
                  <Image src={product.detailImages[0]} alt={`${product.name} detail`} fill sizes="(min-width: 900px) 30vw, 78vw" />
                  <figcaption>{product.name}</figcaption>
                </figure>
              ) : (
                <PlaceholderFrame key={product.slug} className="v2-detail-card" label={`Detail photo coming soon: ${product.name}`} />
              ),
            )}
          </div>
        </section>

        <section className="v2-section v2-reviews" aria-labelledby="reviews-title">
          <p className="v2-kicker">Worn, not written yet</p>
          <h2 id="reviews-title">Customer reviews are coming soon.</h2>
          <div className="v2-review-placeholders" aria-label="Customer review placeholders">
            <PlaceholderFrame label="Review placeholder — verified customer feedback coming soon" ratio="3 / 2" />
            <PlaceholderFrame label="Review placeholder — verified customer feedback coming soon" ratio="3 / 2" />
          </div>
        </section>

        <section className="v2-section" aria-labelledby="delivery-title">
          <div className="v2-section-heading">
            <p className="v2-kicker">From edit to door</p>
            <h2 id="delivery-title">Three straightforward steps.</h2>
          </div>
          <ol className="v2-delivery-steps">
            {deliverySteps.map(([number, title, body]) => (
              <li key={number}><span>{number}</span><h3>{title}</h3><p>{body}</p></li>
            ))}
          </ol>
        </section>

        <section className="v2-section v2-colours" aria-labelledby="colours-title">
          <p className="v2-kicker">Seven quiet tones</p>
          <h2 id="colours-title">Find your rotation.</h2>
          <div className="v2-colour-row">
            {products.map((product) => (
              <Link key={product.slug} href={`/product/${product.slug}`} className="v2-colour">
                <span style={{ backgroundColor: product.colors[0]?.hex }} aria-hidden="true" />
                {product.colors[0]?.name}
              </Link>
            ))}
          </div>
        </section>

        <section className="v2-section v2-faq" aria-labelledby="faq-title">
          <p className="v2-kicker">Useful answers</p>
          <h2 id="faq-title">Before you build.</h2>
          <div>
            {faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}<span aria-hidden="true">+</span></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="v2-final-cta" aria-labelledby="final-title">
          <p className="v2-kicker">The three-piece edit</p>
          <h2 id="final-title">Three colours. ₹799. Start with the one you reach for first.</h2>
          <a className="v2-button v2-button--paper" href="#build">Build your combo <span aria-hidden="true">↑</span></a>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
