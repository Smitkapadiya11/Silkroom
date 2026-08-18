"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { animate, createScope, stagger } from "animejs";
import { useCart } from "@/context/CartProvider";
import { useStoreSettings } from "@/context/StoreSettingsProvider";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/shop#build-combo", label: "3 for ₹799" },
  { href: "/track", label: "Track" },
  { href: "/size-guide", label: "Size guide" },
  { href: "/shipping-returns", label: "Shipping" },
  { href: "/contact", label: "Help" },
];

export function MobileNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const { contact } = useStoreSettings();

  useEffect(() => {
    if (!open || !root.current) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    const scope = createScope({ root });
    scope.add(() => {
      animate(".mobile-nav-link", {
        translateY: [24, 0],
        opacity: [0, 1],
        duration: 520,
        ease: "outExpo",
        delay: stagger(50),
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
      <div className="mobile-nav-contact">
        <Link className="mobile-nav-link" href="/shop#build-combo" onClick={onClose}>
          Build 3 for ₹799
        </Link>
        <a href={`tel:${contact.phoneTel}`}>{contact.phone}</a>
        <a
          href={`https://wa.me/${contact.phoneTel.replace("+", "")}`}
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp us
        </a>
      </div>
    </div>
  );
}

export function StoreHeader({ variant = "store" }: { variant?: "store" | "landing" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count, openCart } = useCart();
  const { contact } = useStoreSettings();

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <>
      <header className={`store-header store-header--${variant}${scrolled ? " is-scrolled" : ""}`}>
        <Link href="/" className="store-logo" aria-label="Silk Room home">
          Silk Room
        </Link>
        <nav className="store-nav" aria-label="Primary">
          {links.slice(0, 4).map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="store-header-actions">
          <a className="store-header-phone" href={`tel:${contact.phoneTel}`}>
            {contact.phone}
          </a>
          <Link className="store-header-cta" href="/shop#build-combo">
            3 for ₹799
          </Link>
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
