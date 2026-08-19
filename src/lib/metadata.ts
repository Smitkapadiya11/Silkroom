import type { Metadata } from "next";
import type { StoreContact } from "@/lib/store-contact";
import { site } from "@/lib/site";
import type { Product } from "@/lib/products";

const baseUrl = site.url;
const OG_IMAGE = `${baseUrl}/opengraph-image`;

export const brandNames = [
  "Silk Room",
  "Silkroom",
  "Silkroom.shop",
  "silkroom.shop",
  "Silk Room Shop",
] as const;

type PageMeta = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  absolute?: boolean;
  keywords?: string[];
  image?: string;
  type?: "website" | "article";
};

export function createPageMetadata({
  title,
  description,
  path,
  noIndex,
  absolute,
  keywords,
  image,
  type = "website",
}: PageMeta): Metadata {
  const url = path === "/" ? baseUrl : `${baseUrl}${path}`;
  const ogTitle = title.includes("Silk Room") || title.includes("Silkroom") ? title : `${title} | Silk Room`;
  const ogImage = image ? (image.startsWith("http") ? image : `${baseUrl}${image}`) : OG_IMAGE;

  return {
    title: absolute ? { absolute: title } : title,
    description,
    keywords,
    alternates: {
      canonical: path,
      languages: {
        "en-IN": path,
        "x-default": path,
      },
    },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : {
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
      title: ogTitle,
      description,
      url,
      siteName: "Silk Room",
      type,
      locale: "en_IN",
      images: [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [ogImage],
    },
  };
}

export function productJsonLd(product: {
  slug: string;
  name: string;
  blurb: string;
  price: number;
  image: string;
  detailImages?: string[];
  colors?: { name: string }[];
  fabric?: { composition: string; gsm: number; countryOfOrigin: string };
  reviews?: { author: string; rating: number; body: string }[];
}) {
  const reviews = product.reviews ?? [];
  const average =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : null;
  const images = [product.image, ...(product.detailImages ?? [])]
    .filter(Boolean)
    .slice(0, 8)
    .map((src) => `${baseUrl}${src}`);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${baseUrl}/product/${product.slug}#product`,
    name: `${product.name} — Men's Polo T-Shirt`,
    alternateName: [`${product.name} Silk Room`, `${product.colors?.[0]?.name ?? ""} polo t-shirt`],
    description: `${product.blurb} Men's polo t-shirt from Silk Room (silkroom.shop). ${product.fabric?.gsm ?? 220} GSM, made in India, shipped nationwide.`,
    image: images,
    sku: product.slug,
    mpn: product.slug,
    brand: { "@type": "Brand", name: "Silk Room", url: baseUrl, alternateName: [...brandNames] },
    manufacturer: {
      "@type": "Organization",
      name: "Silk Room",
      address: { "@type": "PostalAddress", addressLocality: "Surat", addressRegion: "Gujarat", addressCountry: "IN" },
    },
    category: "Men's Clothing > Polo Shirts",
    material: product.fabric?.composition,
    color: product.colors?.[0]?.name,
    audience: { "@type": "PeopleAudience", suggestedGender: "male", geographicArea: { "@type": "Country", name: "India" } },
    countryOfOrigin: { "@type": "Country", name: product.fabric?.countryOfOrigin ?? "India" },
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/product/${product.slug}`,
      priceCurrency: "INR",
      price: product.price,
      priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: "Silk Room", url: baseUrl },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "IN" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 2, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 3, maxValue: 8, unitCode: "DAY" },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
      },
    },
    ...(average
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(average.toFixed(1)),
            reviewCount: reviews.length,
            bestRating: 5,
            worstRating: 1,
          },
          review: reviews.map((review) => ({
            "@type": "Review",
            reviewRating: { "@type": "Rating", ratingValue: review.rating, bestRating: 5 },
            author: { "@type": "Person", name: review.author },
            reviewBody: review.body,
          })),
        }
      : {}),
  };
}

export function organizationJsonLd(contact?: StoreContact) {
  const email = contact?.email ?? site.email;
  const phone = contact?.phone ?? site.phone;

  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "ClothingStore", "OnlineStore"],
    "@id": `${baseUrl}/#organization`,
    name: "Silk Room",
    legalName: "Silk Room",
    alternateName: [...brandNames],
    url: baseUrl,
    logo: `${baseUrl}/icon`,
    image: OG_IMAGE,
    email,
    ...(phone ? { telephone: phone } : {}),
    description:
      "Silk Room (silkroom.shop) sells men's polo t-shirts and ribbed zip polos made in Surat, Gujarat, and shipped across India.",
    slogan: "Men's polo t-shirts. Honest price. Made in India.",
    foundingLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Surat",
        addressRegion: "Gujarat",
        addressCountry: "IN",
      },
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Surat",
      addressLocality: "Surat",
      addressRegion: "Gujarat",
      postalCode: "395001",
      addressCountry: "IN",
    },
    areaServed: { "@type": "Country", name: "India" },
    geo: { "@type": "GeoCoordinates", latitude: 21.1702, longitude: 72.8311 },
    priceRange: "₹₹",
    currenciesAccepted: "INR",
    paymentAccepted: "UPI, Credit Card, Debit Card, Net Banking, Razorpay",
    sameAs: [site.instagramUrl, baseUrl],
    brand: { "@type": "Brand", name: "Silk Room", alternateName: [...brandNames] },
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "IN",
      merchantReturnDays: 7,
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name: "Silk Room",
    alternateName: [...brandNames],
    inLanguage: "en-IN",
    publisher: { "@id": `${baseUrl}/#organization` },
    potentialAction: {
      "@type": "ReadAction",
      target: [`${baseUrl}/shop`, `${baseUrl}/mens-polo-tshirts`],
    },
  };
}

export function itemListJsonLd(list: Product[], path = "/shop") {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Silk Room men's polo t-shirts",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: list.length,
    url: `${baseUrl}${path}`,
    itemListElement: list.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${baseUrl}/product/${product.slug}`,
      name: `${product.name} men's polo t-shirt`,
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.path === "/" ? baseUrl : `${baseUrl}${item.path}`,
    })),
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
