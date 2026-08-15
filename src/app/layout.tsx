import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, JetBrains_Mono } from "next/font/google";
import { CartProvider } from "@/context/CartProvider";
import { organizationJsonLd } from "@/lib/metadata";
import { site } from "@/lib/site";
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

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Silk Room — Ribbed Zip Polos",
    template: "%s — Silk Room",
  },
  description:
    "Ribbed zip polos from Surat. ₹399 each — 3 for ₹799, 5 for ₹1,299. Prepaid or COD.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Silk Room — 3 FOR ₹799",
    description:
      "Eleven zip polos from Surat. ₹399 each — 3 for ₹799, 5 for ₹1,299. Solids and waffle designs.",
    url: site.url,
    siteName: "Silk Room",
    type: "website",
    locale: "en_IN",
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f2ea",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={`${display.variable} ${body.variable} ${mono.variable}`}>
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
