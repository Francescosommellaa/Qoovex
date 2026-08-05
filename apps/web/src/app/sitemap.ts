import type { MetadataRoute } from "next";
import { publicSiteUrl } from "./site-config";

/** Rotte pubbliche del sito marketing. Le pagine autenticate vivono nel Workspace. */
const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/come-funziona", priority: 0.9, changeFrequency: "monthly" },
  { path: "/funzionalita", priority: 0.9, changeFrequency: "monthly" },
  { path: "/imprese", priority: 0.8, changeFrequency: "monthly" },
  { path: "/clienti", priority: 0.8, changeFrequency: "monthly" },
  { path: "/fiducia", priority: 0.7, changeFrequency: "monthly" },
  { path: "/chi-siamo", priority: 0.6, changeFrequency: "yearly" },
  { path: "/faq", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contattaci", priority: 0.6, changeFrequency: "yearly" },
  { path: "/community", priority: 0.4, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/cookies", priority: 0.3, changeFrequency: "yearly" },
  { path: "/dpa", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const base = publicSiteUrl.replace(/\/$/, "");
  return routes.map((route) => ({
    url: `${base}${route.path === "/" ? "" : route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
