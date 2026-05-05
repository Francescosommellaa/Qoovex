import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@qoovex/ui"],
  pageExtensions: ["page.tsx", "page.ts", "page.jsx", "page.js"],
};

export default nextConfig;
