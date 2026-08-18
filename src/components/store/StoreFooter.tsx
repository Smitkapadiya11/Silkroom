import Link from "next/link";
import { site } from "@/lib/site";

const footerColumns = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All polos" },
      { href: "/shop?filter=new", label: "New designs" },
      { href: "/combos", label: "3 for ₹799 combos" },
      { href: "/track", label: "Track order" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/how-to-order", label: "How to order" },
      { href: "/size-guide", label: "Size guide" },
      { href: "/shipping-returns", label: "Shipping & returns" },
      { href: "/guarantee", label: "7-day exchange" },
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
      <div className="store-footer-trust">
        <p>Cash on delivery</p>
        <p>UPI · Cards · Netbanking</p>
        <p>Packed in Surat</p>
        <p>{site.exchangeWindowDays}-day size exchange</p>
        <p>Razorpay secure checkout</p>
      </div>
      <div className="store-footer-grid">
        <div>
          <p className="store-footer-brand">Silk Room</p>
          <p className="store-footer-copy">
            Ribbed zip polos, cut in Surat and shipped across India. One fit, eleven colours,
            a price that stays honest.
          </p>
        </div>
        {footerColumns.map((column) => (
          <details key={column.title} className="store-footer-accordion" open>
            <summary className="store-footer-heading">{column.title}</summary>
            <nav aria-label={column.title}>
              <ul className="store-footer-links">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          </details>
        ))}
        <details className="store-footer-accordion" open>
          <summary className="store-footer-heading">Talk to us</summary>
          <address className="store-footer-contact">
            <a href={`tel:${site.phoneTel}`}>{site.phone}</a>
            <a href={`mailto:${site.email}`}>{site.email}</a>
            <a href={`https://wa.me/${site.phoneTel.replace("+", "")}`} target="_blank" rel="noreferrer">
              WhatsApp a person
            </a>
            <a href={site.instagramUrl} target="_blank" rel="noreferrer">
              {site.instagramHandle}
            </a>
            <span>{site.address}</span>
            <span>{site.responseHours}</span>
          </address>
        </details>
      </div>
      <p className="store-footer-legal">
        Prepaid or COD · GST invoice on request · © {new Date().getFullYear()} Silk Room, Surat
      </p>
    </footer>
  );
}
