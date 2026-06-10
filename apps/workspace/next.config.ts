import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@qoovex/config",
    "@qoovex/db",
    "@qoovex/utils",
  ],
};

export default nextConfig;
