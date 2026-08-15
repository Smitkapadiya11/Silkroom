import Link from "next/link";
import { site } from "@/lib/site";

const footerColumns = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All polos" },
      { href: "/shop?filter=new", label: "New designs" },
      { href: "/combos", label: "Combos" },
      { href: "/track", label: "Track order" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/size-guide", label: "Size guide" },
      { href: "/shipping-returns", label: "Shipping & returns" },
      { href: "/guarantee", label: "Our guarantee" },
      { href: "/how-to-order", label: "How to order" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Silk Room",
    links: [
      { href: "/about", label: "About" },
      { href: "/care", label: "Fabric care" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
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
        {footerColumns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <p className="store-footer-heading">{column.title}</p>
            <ul className="store-footer-links">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <address className="store-footer-contact">
          <p className="store-footer-heading">Reach us</p>
          <a href={`tel:${site.phoneTel}`}>{site.phone}</a>
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <a href={site.instagramUrl} target="_blank" rel="noreferrer">{site.instagramHandle}</a>
          <span>{site.address}</span>
          <span>Response: {site.responseHours}</span>
        </address>
      </div>
      <p className="store-footer-legal">
        UPI · Cards · Netbanking · COD · Cut in Surat, shipped across India · © {new Date().getFullYear()} Silk Room
      </p>
    </footer>
  );
}
