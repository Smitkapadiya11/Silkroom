"use client";

import Image from "next/image";
import Link from "next/link";
import { ComboBuilder } from "@/components/store/ComboBuilder";
import { ComboOfferBar } from "@/components/store/ComboOfferBar";
import { UgcVideo } from "@/components/store/UgcVideo";
import { StoreFooter } from "@/components/store/StoreFooter";
import { StoreHeader } from "@/components/store/StoreHeader";
import { TrustStrip } from "@/components/store/TrustStrip";
import { PoloHero } from "@/components/three/PoloHero";
import type { Product } from "@/lib/products";
import { site } from "@/lib/site";

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
  ["02", "Order", "Pay securely with Razorpay or choose COD (+₹49). WhatsApp stays available."],
  ["03", "Dispatch", "We pack from Surat in 24–48 hours after confirmation."],
  ["04", "Delivered", "Metro 3–6 days with tracking. Wrong size? 7-day easy exchange."],
] as const;

export function V2Landing({
  products,
  announcementEnabled = true,
  announcementText,
}: {
  products: Product[];
  announcementEnabled?: boolean;
  announcementText?: string;
}) {
  const heroProduct = products[0];
  const detailShots = [
    {
      src: "/products/new/fern-waffle-zip-polo-rib.jpg",
      caption: "Waffle rib texture",
      alt: "Close-up of fern waffle rib knit",
    },
    {
      src: "/products/new/harbour-waffle-zip-polo-collar.jpg",
      caption: "Collar and zip",
      alt: "Close-up of harbour waffle collar and zip",
    },
    {
      src: "/products/new/slate-waffle-zip-polo-rib.jpg",
      caption: "Knit finish",
      alt: "Close-up of slate waffle knit finish",
    },
  ];
  const fabric = heroProduct.fabric;

  return (
    <div className="v2-landing">
      <div className="store-sticky-stack">
        {announcementEnabled ? <ComboOfferBar text={announcementText} /> : null}
        <StoreHeader variant="landing" />
      </div>
      <main>
        <section className="v2-hero" aria-labelledby="hero-title">
          <div className="v2-hero-copy">
            <p className="v2-kicker">Cut in Surat. Worn across India.</p>
            <h1 id="hero-title">
              3 FOR <span>₹799</span>
            </h1>
            <p className="v2-hero-lede">
              Ribbed zip polos with a real price. ₹399 each, or three colours for ₹799.
              Pay by UPI or cash on delivery.
            </p>
            <div className="v2-hero-actions">
              <a className="v2-button v2-button--flame" href="#build">
                Build your combo
              </a>
              <Link className="v2-button v2-button--ghost" href="/shop#build-combo">
                Shop all colours
              </Link>
            </div>
          </div>
          <div className="v2-hero-stage" aria-hidden="true">
            <PoloHero images={products.slice(0, 3).map((item) => item.image)} />
          </div>
        </section>

        <TrustStrip className="trust-strip--landing" />

        <section className="v2-section v2-proof" aria-label="Why people order">
          <ul>
            <li><strong>₹799</strong><span>for any 3 polos</span></li>
            <li><strong>COD</strong><span>pay at your door</span></li>
            <li><strong>7 days</strong><span>easy size exchange</span></li>
            <li><strong>24–48 hrs</strong><span>pack from Surat</span></li>
          </ul>
        </section>

        <section id="build" className="v2-section v2-builder-section" aria-labelledby="build-title">
          <div className="v2-section-heading">
            <p className="v2-kicker">Build the edit</p>
            <h2 id="build-title">Your colours. Your three.</h2>
            <p>One fit, one price, a wardrobe that works harder.</p>
          </div>
          <ComboBuilder products={products} />
        </section>

        <section className="v2-section v2-ugc" aria-labelledby="ugc-title">
          <div className="v2-section-heading">
            <p className="v2-kicker">On camera</p>
            <h2 id="ugc-title">See the rib move.</h2>
          </div>
          <div className="v2-ugc-grid">
            <UgcVideo
              className="v2-ugc-frame"
              srcMp4="/media/silkroom-street-ad.mp4"
              poster="/media/silkroom-street-ad-poster.jpg"
              label="Silk Room polo on the street"
            />
            <UgcVideo
              className="v2-ugc-frame"
              srcMp4="/media/silkroom-cafe-ad.mp4"
              poster="/media/silkroom-cafe-ad-poster.jpg"
              label="Silk Room polo worn at a cafe"
            />
          </div>
          <p className="v2-ugc-caption">
            Plays muted when you scroll into view. Tap unmute for sound.
          </p>
          <a className="v2-button v2-button--ghost" href="#build">
            Build your combo
          </a>
        </section>

        <section className="v2-section v2-product-3d" aria-labelledby="object-title">
          <div className="v2-section-heading">
            <p className="v2-kicker">Turn it in your hand</p>
            <h2 id="object-title">The polo, as an object.</h2>
            <p>Drag slowly. Lighting stays studio-quiet so the rib and zip stay readable.</p>
          </div>
          <PoloHero
            className="v2-product-3d-stage"
            orbit
            images={[heroProduct.image, products[1]?.image ?? heroProduct.image]}
          />
          <ul className="v2-product-callouts">
            <li><strong>220 GSM rib</strong> Holds shape after wash.</li>
            <li><strong>Brass quarter-zip</strong> Closes clean at the collar.</li>
            <li><strong>Relaxed regular</strong> Easy through the chest, not oversized.</li>
          </ul>
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
            {detailShots.map((shot, index) => (
              <figure key={shot.src} className={`v2-detail-card v2-detail-card--crop-${index}`}>
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  fill
                  sizes="(min-width: 900px) 30vw, 78vw"
                />
                <figcaption>{shot.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="v2-section v2-founder-guarantee" aria-labelledby="guarantee-title">
          <p className="v2-kicker">A note from Silk Room</p>
          <h2 id="guarantee-title">A new label should earn your first order.</h2>
          <p>
            These polos are cut for an easy everyday fit, checked before dispatch, and backed
            by a {site.exchangeWindowDays}-day size exchange. If something is not right, message
            us and a person will reply during {site.responseHours}.
          </p>
          <p>— Silk Room · {site.whatsappDisplay}</p>
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
          <p className="v2-kicker">The full edit</p>
          <h2 id="colours-title">Solids and new waffle designs.</h2>
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
