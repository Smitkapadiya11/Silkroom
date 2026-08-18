import type { Metadata } from "next";
import type { StoreContact } from "@/lib/store-contact";
import { site } from "@/lib/site";

const baseUrl = site.url;

type PageMeta = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
};

export function createPageMetadata({
  title,
  description,
  path,
  noIndex,
}: PageMeta): Metadata {
  const url = `${baseUrl}${path}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: title.includes("Silk Room") ? title : `${title} — Silk Room`,
      description,
      url,
      siteName: site.name,
      type: "website",
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title: title.includes("Silk Room") ? title : `${title} — Silk Room`,
      description,
    },
  };
}

export function productJsonLd(product: {
  slug: string;
  name: string;
  blurb: string;
  price: number;
  image: string;
  reviews?: { author: string; rating: number; body: string }[];
}) {
  const reviews = product.reviews ?? [];
  const average =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : null;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.blurb,
    image: `${baseUrl}${product.image}`,
    brand: { "@type": "Brand", name: site.name },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability: "https://schema.org/InStock",
      url: `${baseUrl}/product/${product.slug}`,
    },
    ...(average
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(average.toFixed(1)),
            reviewCount: reviews.length,
          },
          review: reviews.map((review) => ({
            "@type": "Review",
            reviewRating: {
              "@type": "Rating",
              ratingValue: review.rating,
            },
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
  const address = contact?.address ?? site.address;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: baseUrl,
    email,
    ...(phone ? { telephone: phone } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: address,
      addressCountry: "IN",
    },
    sameAs: [site.instagramUrl],
  };
}

export function faqJsonLd(
  items: { question: string; answer: string }[],
) {
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
