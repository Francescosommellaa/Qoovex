import type { NextConfig } from "next";
import path from "node:path";

const isProduction = process.env.NODE_ENV === "production";

function contentSecurityPolicy() {
  return [
    "default-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "style-src 'self' 'unsafe-inline' https://api.fontshare.com",
    "font-src 'self' data: https://cdn.fontshare.com",
    "img-src 'self' data: blob:",
    `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"}`,
    "connect-src 'self'",
  ].join("; ");
}

const nextConfig: NextConfig = {
  turbopack: { root: path.resolve(import.meta.dirname, "../..") },
  transpilePackages: ["@qoovex/brand-resources", "@qoovex/ui"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
