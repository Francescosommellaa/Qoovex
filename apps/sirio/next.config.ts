import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.trycloudflare.com"],
  transpilePackages: ["@qoovex/brand", "@qoovex/ui"],
};

export default nextConfig;
