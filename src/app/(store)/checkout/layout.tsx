import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Checkout",
  description: "Secure Silk Room checkout.",
  path: "/checkout",
  noIndex: true,
});

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
