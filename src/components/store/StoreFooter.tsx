import Link from "next/link";
import { site } from "@/lib/site";

const footerLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/combos", label: "Combos" },
  { href: "/about", label: "About" },
  { href: "/size-guide", label: "Size guide" },
  { href: "/shipping-returns", label: "Shipping & returns" },
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
          {site.phone ? (
            <a href={`tel:${site.phone.replace(/\D/g, "")}`}>{site.phone}</a>
          ) : null}
          <a href={`mailto:${site.email}`}>{site.email}</a>
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
