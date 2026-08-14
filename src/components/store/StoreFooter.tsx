import Link from "next/link";
import { site } from "@/lib/site";

const footerLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/combos", label: "Combos" },
  { href: "/cart", label: "Cart" },
  { href: "/track", label: "Track order" },
  { href: "/about", label: "About" },
  { href: "/how-to-order", label: "How to order" },
  { href: "/size-guide", label: "Size guide" },
  { href: "/care", label: "Fabric care" },
  { href: "/shipping-returns", label: "Shipping & returns" },
  { href: "/guarantee", label: "Our guarantee" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function StoreFooter() {
  return (
    <footer className="store-footer">
      <div className="store-footer-grid">
        <div>
          <p className="store-footer-brand">Silk Room</p>
          <p className="store-footer-copy">
            Ribbed zip polos — cut in Surat, shipped across India.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="store-footer-links">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <address className="store-footer-contact">
          <a href={`mailto:${site.email}`}>{site.email}</a>
          {site.phone ? (
            <a href={`tel:${site.phoneTel}`}>{site.phone}</a>
          ) : null}
          <a href={site.instagramUrl} target="_blank" rel="noreferrer">
            {site.instagramHandle}
          </a>
          <span>{site.address}</span>
          <span>Response: {site.responseHours}</span>
        </address>
      </div>
      <p className="store-footer-legal">© {new Date().getFullYear()} Silk Room</p>
    </footer>
  );
}
