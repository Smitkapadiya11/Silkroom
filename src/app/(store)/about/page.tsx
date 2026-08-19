import { createPageMetadata } from "@/lib/metadata";
import { resolveStoreContact } from "@/lib/store-contact";
import { getStoreSettings } from "@/lib/store-settings";

export const metadata = createPageMetadata({
  title: "About Silk Room | silkroom.shop",
  description:
    "Silk Room is a Surat men's clothing brand. We make polo t-shirts and ribbed zip polos, sell them at silkroom.shop, and ship across India.",
  path: "/about",
  keywords: ["Silk Room", "Silkroom", "silkroom.shop", "Surat polo", "mens clothing brand india"],
});

export default async function AboutPage() {
  const contact = resolveStoreContact(await getStoreSettings());

  return (
    <article className="policy-page about-page">
      <header className="store-page-header">
        <p className="eyebrow">Silk Room · silkroom.shop</p>
        <h1>About Silk Room</h1>
      </header>

      <div className="about-grid">
        <div className="about-copy">
          <p>
            Silk Room (also written Silkroom or silkroom.shop) started because I wanted a men&apos;s
            polo t-shirt that felt considered — not loud, not disposable. We cut ribbed quarter-zips
            in Surat, work with a small team that cares about collar shape and zip weight, and ship
            directly across India from this official store.
          </p>
          <p>
            Every polo is 220 GSM cotton-elastane, pre-shrunk, and priced honestly at
            ₹399. Combos exist because most people don&apos;t stop at one colour once they
            feel the rib.
          </p>
          <p>
            If you have a question before ordering, reach us on WhatsApp or{" "}
            <a href={`mailto:${contact.email}`}>{contact.email}</a>. A real person replies
            during {contact.responseHours}.
          </p>
        </div>
      </div>
    </article>
  );
}
