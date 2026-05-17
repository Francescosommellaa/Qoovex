import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@qoovex/config",
    "@qoovex/ui",
    "@qoovex/db",
    "@qoovex/utils",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.gstatic.com",
        pathname: "/firebasejs/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
