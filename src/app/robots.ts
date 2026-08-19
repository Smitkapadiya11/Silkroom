import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/cart", "/checkout", "/order/", "/order-confirmed"],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/shop", "/mens-polo-tshirts", "/about", "/faq", "/product/"],
        disallow: ["/admin", "/api/", "/cart", "/checkout"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
