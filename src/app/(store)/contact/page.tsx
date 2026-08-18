import { createPageMetadata } from "@/lib/metadata";
import { WhatsAppOrderLink } from "@/components/store/WhatsAppOrderLink";
import { orderBrowseMessage } from "@/lib/order";
import { resolveStoreContact } from "@/lib/store-contact";
import { getStoreSettings } from "@/lib/store-settings";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Contact",
  description:
    "WhatsApp, phone, email, and address for Silk Room — ribbed zip polos from Surat.",
  path: "/contact",
});

export default async function ContactPage() {
  const settings = await getStoreSettings();
  const contact = resolveStoreContact(settings);

  return (
    <article className="policy-page contact-page">
      <header className="store-page-header">
        <p className="eyebrow">Contact</p>
        <h1>Talk to a person</h1>
        <p>Response hours: {contact.responseHours}</p>
      </header>

      <ul className="contact-list">
        <li>
          <strong>WhatsApp</strong>
          <WhatsAppOrderLink message={orderBrowseMessage()}>
            {contact.phone}
          </WhatsAppOrderLink>
        </li>
        {contact.phone ? (
          <li>
            <strong>Phone</strong>
            <a href={`tel:${contact.phoneTel}`}>{contact.phone}</a>
          </li>
        ) : null}
        <li>
          <strong>Email</strong>
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
        </li>
        <li>
          <strong>Address</strong>
          <address>{contact.address}</address>
        </li>
        <li>
          <strong>Instagram</strong>
          <a href={site.instagramUrl} target="_blank" rel="noreferrer">
            {site.instagramHandle}
          </a>
        </li>
      </ul>

      <section aria-labelledby="expect-title">
        <h2 id="expect-title">What to expect</h2>
        <ul className="policy-list">
          <li>We confirm stock, size, and total before you pay.</li>
          <li>COD and prepaid both available on most pincodes.</li>
          <li>Tracking is shared on the same WhatsApp thread when we ship.</li>
        </ul>
      </section>
    </article>
  );
}
