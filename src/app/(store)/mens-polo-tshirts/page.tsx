import Link from "next/link";
import { Breadcrumbs } from "@/components/store/Breadcrumbs";
import { ProductCard } from "@/components/store/ProductCard";
import { TrustStrip } from "@/components/store/TrustStrip";
import {
  breadcrumbJsonLd,
  createPageMetadata,
  faqJsonLd,
  itemListJsonLd,
} from "@/lib/metadata";
import { products } from "@/lib/products";

export const metadata = createPageMetadata({
  title: "Men's Polo T-Shirts in India",
  description:
    "Shop Silk Room men's polo t-shirts online in India at silkroom.shop. Ribbed zip polos from Surat — ₹399 each, 3 for ₹799. Sizes S–XL, prepaid delivery nationwide.",
  path: "/mens-polo-tshirts",
  keywords: [
    "mens polo t shirts",
    "polo t shirts india",
    "mens clothes silkroom",
    "silkroom.shop polo",
    "buy polo t shirt online india",
    "ribbed polo t shirt men",
  ],
});

const faqs = [
  {
    question: "Where can I buy Silk Room men's polo t-shirts?",
    answer:
      "Only at silkroom.shop — the official Silk Room store. We ship polo t-shirts across India from Surat.",
  },
  {
    question: "Are Silk Room polos men's clothes?",
    answer:
      "Yes. Silk Room is a men's clothing brand focused on polo t-shirts: ribbed zip polos and waffle zip polos in sizes S, M, L and XL.",
  },
  {
    question: "How much do Silk Room polo t-shirts cost in India?",
    answer:
      "₹399 each. Any 3 polos are ₹799. Any 5 are ₹1,299. Free delivery on 3 or more.",
  },
];

export default function MensPoloPage() {
  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Men's polo t-shirts", path: "/mens-polo-tshirts" },
    ]),
    itemListJsonLd(products, "/mens-polo-tshirts"),
    faqJsonLd(faqs),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="policy-page seo-hub">
        <Breadcrumbs
          items={[
            { href: "/", label: "Home" },
            { href: "/mens-polo-tshirts", label: "Men's polo t-shirts" },
          ]}
        />
        <header className="store-page-header">
          <p className="eyebrow">Silk Room · silkroom.shop</p>
          <h1>Men&apos;s polo t-shirts in India</h1>
          <p>
            Silk Room makes men&apos;s polo t-shirts in Surat and sells them only on silkroom.shop.
            Ribbed zip polos, honest pricing, prepaid checkout, delivery across India.
          </p>
        </header>

        <TrustStrip />

        <section>
          <h2>Why shop polo t-shirts at Silk Room</h2>
          <p>
            Most men&apos;s clothes online are either cheap knits that lose shape or markups with a
            fake MRP. Silk Room is a single cut: a 220 GSM cotton-elastane polo t-shirt with a
            quarter-zip, packed in Surat, priced at ₹399. Three pieces for ₹799. That is the whole
            offer — no extra catalogue noise.
          </p>
          <p>
            Search for Silkroom, Silkroom.shop, or Silk Room and you should land here. This is the
            official store for Silk Room men&apos;s polo t-shirts, not a marketplace listing.
          </p>
        </section>

        <section aria-labelledby="catalog-title">
          <h2 id="catalog-title">The full polo edit</h2>
          <p>
            Solids in ink, umber, reed, sage, dust rose, silver and chalk. New waffle designs in
            fern, harbour, slate and porcelain. Every polo is a men&apos;s short-sleeve t-shirt with
            sizes S–XL.
          </p>
          <div className="store-grid meesho-grid seo-hub-grid">
            {products.map((product, index) => (
              <ProductCard key={product.slug} product={product} priority={index < 4} />
            ))}
          </div>
        </section>

        <section>
          <h2>Made in Surat, delivered across India</h2>
          <p>
            Orders pack in 24–48 hours after prepaid payment. Metro cities usually see the parcel in
            3–6 business days; other pincodes 5–8 days. Size exchanges are open for 7 days on unworn
            pieces with tags.
          </p>
          <p>
            <Link href="/shop">Shop all colours</Link> · <Link href="/size-guide">Size guide</Link> ·{" "}
            <Link href="/about">About Silk Room</Link>
          </p>
        </section>

        <section>
          <h2>Questions</h2>
          <dl className="faq-list">
            {faqs.map((item) => (
              <div key={item.question}>
                <dt>{item.question}</dt>
                <dd>{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      </article>
    </>
  );
}
