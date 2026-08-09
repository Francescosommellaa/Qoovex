import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

function contentSecurityPolicy() {
  return [
    "default-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "img-src 'self' data: blob:",
    `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"}`,
    "connect-src 'self'",
  ].join("; ");
}

const nextConfig: NextConfig = {
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
