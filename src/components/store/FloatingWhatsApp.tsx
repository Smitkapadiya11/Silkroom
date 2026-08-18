"use client";

import { usePathname } from "next/navigation";
import { orderBrowseMessage, whatsappUrl } from "@/lib/order";

export function FloatingWhatsApp() {
  const pathname = usePathname();
  const href = whatsappUrl(orderBrowseMessage());

  if (!href || pathname.startsWith("/checkout") || pathname.startsWith("/product/")) return null;

  return (
    <a
      className={`floating-whatsapp${pathname.startsWith("/product/") ? " floating-whatsapp--product" : ""}`}
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Order or ask a question on WhatsApp"
    >
      WhatsApp
    </a>
  );
}
