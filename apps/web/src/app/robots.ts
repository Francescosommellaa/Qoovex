import type { MetadataRoute } from "next";
import { publicSiteUrl } from "./site-config";

export default function robots(): MetadataRoute.Robots {
  const base = publicSiteUrl.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
