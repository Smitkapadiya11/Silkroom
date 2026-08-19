import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      { source: "/silkroom", destination: "/", permanent: true },
      { source: "/silk-room", destination: "/", permanent: true },
      { source: "/silkroom.shop", destination: "/", permanent: true },
      { source: "/polo", destination: "/mens-polo-tshirts", permanent: true },
      { source: "/polo-tshirts", destination: "/mens-polo-tshirts", permanent: true },
      { source: "/polo-t-shirts", destination: "/mens-polo-tshirts", permanent: true },
      { source: "/mens-clothes", destination: "/shop", permanent: true },
      { source: "/mens-clothing", destination: "/shop", permanent: true },
      { source: "/tshirts", destination: "/shop", permanent: true },
      { source: "/t-shirts", destination: "/shop", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
