import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Silk Room — Men's Polo T-Shirts",
    short_name: "Silk Room",
    description: "Men's polo t-shirts and ribbed zip polos from Surat. Shop silkroom.shop across India.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f2ea",
    theme_color: "#0b5450",
    lang: "en-IN",
    categories: ["shopping", "lifestyle"],
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
