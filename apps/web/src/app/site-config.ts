export const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "supporto@qoovex.com";
export const contactHref = `mailto:${contactEmail}`;
export const publicSiteUrl = "https://qoovex.com";
export const workspaceProductionUrl = "https://app.qoovex.com";
export const workspaceUrl = process.env.NEXT_PUBLIC_WORKSPACE_URL?.trim() || "http://localhost:3001";
export const primaryCtaLabel = "Prova Qoovex";

export const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Termini" },
  { href: "/cookies", label: "Cookie" },
  { href: "/dpa", label: "DPA" },
  { href: "/manuale-operativo", label: "Manuale operativo" },
] as const;
