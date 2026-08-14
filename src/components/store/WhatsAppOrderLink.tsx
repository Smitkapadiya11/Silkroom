"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { isWhatsAppOrderingAvailable, whatsappUrl } from "@/lib/order";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  message: string;
  children: ReactNode;
};

export function WhatsAppOrderLink({
  message,
  children,
  className,
  ...props
}: Props) {
  const href = whatsappUrl(message);

  if (!href || !isWhatsAppOrderingAvailable()) {
    return (
      <span
        className={`${className ?? ""} is-ordering-unavailable`.trim()}
        aria-disabled="true"
      >
        Ordering unavailable
      </span>
    );
  }

  return (
    <a
      {...props}
      className={className}
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}
