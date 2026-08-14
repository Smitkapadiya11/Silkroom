import { createPageMetadata } from "@/lib/metadata";
import { WhatsAppOrderLink } from "@/components/store/WhatsAppOrderLink";
import { orderBrowseMessage } from "@/lib/order";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Contact",
  description:
    "WhatsApp, phone, email, and address for Silk Room — ribbed zip polos from Surat.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <article className="policy-page contact-page">
      <header className="store-page-header">
        <p className="eyebrow">Contact</p>
        <h1>Talk to a person</h1>
        <p>Response hours: {site.responseHours}</p>
      </header>

      <ul className="contact-list">
        <li>
          <strong>WhatsApp</strong>
          <WhatsAppOrderLink message={orderBrowseMessage()}>
            {site.whatsappDisplay}
          </WhatsAppOrderLink>
        </li>
        {site.phone ? (
          <li>
            <strong>Phone</strong>
            <a href={`tel:${site.phone.replace(/\D/g, "")}`}>{site.phone}</a>
          </li>
        ) : null}
        <li>
          <strong>Email</strong>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </li>
        <li>
          <strong>Address</strong>
          <address>{site.address}</address>
        </li>
        <li>
          <strong>Instagram</strong>
          <a href={site.instagramUrl} target="_blank" rel="noreferrer">
            {site.instagramHandle}
          </a>
        </li>
      </ul>
    </article>
  );
}
