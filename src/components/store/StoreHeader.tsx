"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { animate, createScope, stagger } from "animejs";
import { useCart } from "@/context/CartProvider";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/combos", label: "Combos" },
  { href: "/about", label: "About" },
  { href: "/how-to-order", label: "How to order" },
  { href: "/size-guide", label: "Size guide" },
  { href: "/care", label: "Fabric care" },
  { href: "/shipping-returns", label: "Shipping" },
  { href: "/guarantee", label: "Guarantee" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function MobileNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !root.current) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    const scope = createScope({ root });
    scope.add(() => {
      animate(".mobile-nav-link", {
        translateY: [24, 0],
        opacity: [0, 1],
        duration: 520,
        ease: "outExpo",
        delay: stagger(60),
      });
    });
    return () => scope.revert();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div ref={root} className="mobile-nav" role="dialog" aria-modal="true" aria-label="Menu">
      <button type="button" className="mobile-nav-close" onClick={onClose} aria-label="Close menu">
        ×
      </button>
      <nav aria-label="Mobile">
        <ul>
          {links.map((link) => (
            <li key={link.href}>
              <Link className="mobile-nav-link" href={link.href} onClick={onClose}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export function StoreHeader({ variant = "store" }: { variant?: "store" | "landing" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { count, openCart } = useCart();

  return (
    <>
      <header className={`store-header store-header--${variant}`}>
        <Link href="/" className="store-logo" aria-label="Silk Room home">
          Silk Room
        </Link>
        <nav className="store-nav" aria-label="Primary">
          {links.slice(0, 3).map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="store-header-actions">
          <button type="button" className="store-cart-button" onClick={openCart}>
            Cart
            {count > 0 ? <span className="store-cart-count">{count}</span> : null}
          </button>
          <button
            type="button"
            className="store-menu-button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(true)}
          >
            Menu
          </button>
        </div>
      </header>
      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
