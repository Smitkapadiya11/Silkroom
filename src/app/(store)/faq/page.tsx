import { createPageMetadata, faqJsonLd } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "FAQ",
  description:
    "Fabric, fit, wash care, COD, exchanges, delivery, and order tracking for Silk Room polos.",
  path: "/faq",
});

const faqs = [
  {
    question: "What fabric are the polos?",
    answer:
      "220 GSM ribbed knit — 95% cotton, 5% elastane. Pre-shrunk. Specs are on every product page.",
  },
  {
    question: "Will the polo shrink after washing?",
    answer:
      "Fabric is pre-shrunk. Wash cold, inside out, low tumble or line dry — expect minimal change.",
  },
  {
    question: "How does the fit run?",
    answer:
      "Relaxed regular — true to size for most. Between sizes? Size up. See the size guide.",
  },
  {
    question: "How do combo discounts work?",
    answer:
      "Add 3 or 5 polos to cart — the best applicable bundle price applies automatically.",
  },
  {
    question: "Can I mix colours in a combo?",
    answer: "Yes. Any polos in the catalog count toward combo pricing.",
  },
  {
    question: "Do you offer COD?",
    answer:
      "Yes on most serviceable pincodes. We confirm COD when you place the order on WhatsApp.",
  },
  {
    question: "How long is delivery?",
    answer: "Metro: 3–6 business days. Rest of India: 5–8 days after dispatch.",
  },
  {
    question: "How do I track my order?",
    answer:
      "We share tracking on WhatsApp when your order ships. Reply to the same thread for updates.",
  },
  {
    question: "What is the exchange policy?",
    answer:
      "7-day exchange on unworn items with tags. Contact us with your order phone number.",
  },
  {
    question: "How do I wash the polo?",
    answer: "Cold machine wash inside out. No bleach. Low tumble or line dry.",
  },
  {
    question: "Where are the polos made?",
    answer: "Cut and finished in Surat, Gujarat — Made in India.",
  },
  {
    question: "How do I place an order?",
    answer:
      "Add to cart, then checkout on WhatsApp with your address — we confirm stock and payment. The How to order page walks through each step.",
  },
  {
    question: "What if the fabric feels different than expected?",
    answer:
      "Every polo is 220 GSM cotton-elastane rib. Follow Fabric care for wash instructions, or message us within the exchange window.",
  },
  {
    question: "Is there a quality guarantee?",
    answer:
      "Yes — Made in India construction, COD on most pincodes, and a 7-day exchange. See Our guarantee for the full promise.",
  },
];

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }}
      />
      <article className="policy-page">
        <header className="store-page-header">
          <p className="eyebrow">Help</p>
          <h1>FAQ</h1>
        </header>
        <dl className="faq-list">
          {faqs.map((item) => (
            <div key={item.question}>
              <dt>{item.question}</dt>
              <dd>{item.answer}</dd>
            </div>
          ))}
        </dl>
      </article>
    </>
  );
}
