import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, JetBrains_Mono } from "next/font/google";
import { CartProvider } from "@/context/CartProvider";
import { StoreSettingsProvider } from "@/context/StoreSettingsProvider";
import { organizationJsonLd } from "@/lib/metadata";
import { resolveStoreContact } from "@/lib/store-contact";
import { getStoreSettings } from "@/lib/store-settings";
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

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getStoreSettings();
  const contact = resolveStoreContact(settings);

  return (
    <html lang="en-IN" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd(contact)),
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
