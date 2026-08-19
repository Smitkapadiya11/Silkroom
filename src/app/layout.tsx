import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, JetBrains_Mono } from "next/font/google";
import { CartProvider } from "@/context/CartProvider";
import { StoreSettingsProvider } from "@/context/StoreSettingsProvider";
import { organizationJsonLd, websiteJsonLd } from "@/lib/metadata";
import { resolveStoreContact } from "@/lib/store-contact";
import { getStoreSettings } from "@/lib/store-settings";
import { site } from "@/lib/site";
import { MetaPixel } from "@/components/store/MetaPixel";
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
  applicationName: "Silk Room",
  title: {
    default: "Silk Room | Men's Polo T-Shirts Online in India | silkroom.shop",
    template: "%s | Silk Room",
  },
  description:
    "Silk Room (silkroom.shop) — men's polo t-shirts and ribbed zip polos from Surat. ₹399 each, 3 for ₹799, 5 for ₹1,299. Shop men's clothes online in India with prepaid delivery.",
  keywords: [
    "Silk Room",
    "Silkroom",
    "silkroom.shop",
    "Silkroom.shop",
    "mens polo t shirts",
    "polo t shirts india",
    "mens clothes",
    "men polo tshirt online",
    "zip polo",
    "Surat polo t shirt",
  ],
  authors: [{ name: "Silk Room", url: site.url }],
  creator: "Silk Room",
  publisher: "Silk Room",
  category: "shopping",
  formatDetection: { telephone: true, email: true, address: true },
  alternates: {
    canonical: "/",
    languages: { "en-IN": "/", "x-default": "/" },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Silk Room | Men's Polo T-Shirts | silkroom.shop",
    description:
      "Official Silk Room store. Men's polo t-shirts from Surat — ₹399, 3 for ₹799. Shop silkroom.shop across India.",
    url: site.url,
    siteName: "Silk Room",
    type: "website",
    locale: "en_IN",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Silk Room men's polo t-shirts — 3 for ₹799" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Silk Room | Men's Polo T-Shirts | silkroom.shop",
    description: "Men's polo t-shirts from Surat. Shop the official silkroom.shop store.",
  },
  appleWebApp: {
    capable: true,
    title: "Silk Room",
    statusBarStyle: "default",
  },
  other: {
    "geo.region": "IN-GJ",
    "geo.placename": "Surat",
    "geo.position": "21.1702;72.8311",
    ICBM: "21.1702, 72.8311",
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export const viewport: Viewport = {
  themeColor: "#f6f2ea",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getStoreSettings();
  const contact = resolveStoreContact(settings);

  return (
    <html lang="en-IN" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <MetaPixel />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationJsonLd(contact), websiteJsonLd()]),
          }}
        />
        <StoreSettingsProvider
          value={{
            contact,
            announcementEnabled: Boolean(settings.announcementEnabled),
            announcementText: String(settings.announcementText ?? ""),
            combo3PriceInr: Number(settings.combo3PriceInr),
            combo5PriceInr: Number(settings.combo5PriceInr),
            unitPriceInr: Number(settings.unitPriceInr),
            freeDeliveryThresholdInr: Number(settings.freeDeliveryThresholdInr),
          }}
        >
          <CartProvider>{children}</CartProvider>
        </StoreSettingsProvider>
      </body>
    </html>
  );
}
