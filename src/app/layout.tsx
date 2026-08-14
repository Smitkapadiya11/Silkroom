import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist } from "next/font/google";
import { CartProvider } from "@/context/CartProvider";
import { organizationJsonLd } from "@/lib/metadata";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  preload: true,
});

const body = Geist({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://silkroom.shop"),
  title: {
    default: "Silk Room — Ribbed Zip Polos",
    template: "%s — Silk Room",
  },
  description:
    "Quietly structured ribbed polos. ₹399 each with combo savings. Order on WhatsApp at silkroom.shop.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Silk Room — The Polo Edit",
    description:
      "Seven tones. One cut. ₹399, or mix a combo from silkroom.shop.",
    url: "https://silkroom.shop",
    siteName: "Silk Room",
    type: "website",
    locale: "en_IN",
  },
};

export const viewport: Viewport = {
  themeColor: "#12121A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={`${display.variable} ${body.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd()),
          }}
        />
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
