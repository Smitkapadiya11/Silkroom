import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Cart",
  description: "Your Silk Room cart.",
  path: "/cart",
  noIndex: true,
});

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
