import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@qoovex/db",
    "@qoovex/types",
    "@qoovex/ui",
  ],
};

export default nextConfig;
