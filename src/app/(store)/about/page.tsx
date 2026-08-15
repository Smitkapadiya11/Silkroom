import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "About Silk Room",
  description:
    "Silk Room makes ribbed zip polos in Surat — quiet structure, honest fabric, shipped across India.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <article className="policy-page about-page">
      <header className="store-page-header">
        <p className="eyebrow">About</p>
        <h1>The room after daylight</h1>
      </header>

      <div className="about-grid">
        <div className="about-copy">
          <p>
            I started Silk Room because I wanted a polo that felt considered — not loud,
            not disposable. We cut ribbed quarter-zips in Surat, work with a small team
            that cares about collar shape and zip weight, and ship directly to you across
            India.
          </p>
          <p>
            Every polo is 220 GSM cotton-elastane, pre-shrunk, and priced honestly at
            ₹399. Combos exist because most people don&apos;t stop at one colour once they
            feel the rib.
          </p>
          <p>
            If you have a question before ordering, reach us on WhatsApp or{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a>. A real person replies
            during {site.responseHours}.
          </p>
        </div>
      </div>
    </article>
  );
}
