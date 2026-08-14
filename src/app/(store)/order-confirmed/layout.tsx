import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Order confirmed",
    description: "Your Silk Room order was sent on WhatsApp.",
    path: "/order-confirmed",
    noIndex: true,
  }),
};

export default function OrderConfirmedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
