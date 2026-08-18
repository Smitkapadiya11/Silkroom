import { createPageMetadata } from "@/lib/metadata";
import { resolveStoreContact } from "@/lib/store-contact";
import { getStoreSettings } from "@/lib/store-settings";

export const metadata = createPageMetadata({
  title: "Privacy policy",
  description: "How Silk Room handles your contact and order information.",
  path: "/privacy",
});

export default async function PrivacyPage() {
  const contact = resolveStoreContact(await getStoreSettings());

  return (
    <article className="policy-page prose-page">
      <header className="store-page-header">
        <h1>Privacy policy</h1>
      </header>
      <p>Last updated: August 2026</p>
      <p>
        When you order online or email {contact.email}, we collect your name, phone,
        and delivery address to fulfil the order. We do not sell your data.
      </p>
      <p>
        Order details are stored in our chat and internal records for shipping and
        support. You may request deletion after your order is complete.
      </p>
      <p>
        The site uses local storage for your cart on your device — nothing is sent until
        you checkout on WhatsApp.
      </p>
    </article>
  );
}
