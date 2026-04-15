import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@qoovex/ui", "@qoovex/db", "@qoovex/utils"],
};

export default nextConfig;
