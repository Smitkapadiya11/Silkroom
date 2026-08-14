function resolvedSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl.replace(/^https?:\/\//, "")}`;

  return "http://localhost:3000";
}

export const site = {
  name: "Silk Room",
  url: resolvedSiteUrl(),
  email: "hello@silkroom.shop", // TODO: Replace with your support inbox if different.
  phone: "+91 75758 07403",
  phoneTel: "+917575807403",
  whatsappDisplay: "+91 75758 07403",
  instagramUrl: "https://instagram.com/silkroom.shop", // TODO: Replace with live Instagram URL.
  instagramHandle: "@silkroom.shop",
  instagramFollowers: null, // TODO: Replace with live follower count, e.g. "2.4K".
  address: "Surat, Gujarat, India", // TODO: Replace with full business address for footer/contact.
  responseHours: "Mon–Sat, 10am–7pm IST",
  codAvailable: true,
  exchangeWindowDays: 7,
  freeShippingThreshold: 799, // Free delivery from the 3-polo combo tier.
};
