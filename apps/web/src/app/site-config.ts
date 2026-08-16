export const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "supporto@qoovex.com";
export const contactHref = `mailto:${contactEmail}`;
export const publicSiteUrl = "https://qoovex.com";
export const workspaceProductionUrl = "https://app.qoovex.com";
export const workspaceUrl = process.env.NEXT_PUBLIC_WORKSPACE_URL?.trim() || "http://localhost:3001";

// Route pubblica reale del Workspace verificata nel repository (apps/workspace/src/app/sign-in).
// Il proxy di apps/workspace reindirizza gli utenti non autenticati verso "/sign-in": è quindi pubblica.
export const signInUrl = `${workspaceUrl.replace(/\/$/, "")}/sign-in`;
export const signUpUrl = `${workspaceUrl.replace(/\/$/, "")}/sign-up`;

// CTA principale del sito: azione di navigazione interna verso la spiegazione del prodotto.
export const primaryCtaLabel = "Scopri come funziona";
export const primaryCtaHref = "/come-funziona";

// Azione secondaria discreta: accesso al Workspace reale.
export const signInLabel = "Accedi";
export const signUpLabel = "Crea il tuo account";

// Navigazione desktop essenziale.
export const mainNavLinks = [
  { href: "/come-funziona", label: "Come funziona" },
  { href: "/imprese", label: "Per le imprese" },
  { href: "/clienti", label: "Per i clienti" },
  { href: "/funzionalita", label: "Funzionalità" },
] as const;

// Pagine secondarie raggruppate nel menu "Esplora".
export const secondaryNavLinks = [
  { href: "/fiducia", label: "Fiducia e privacy", description: "Contenuti interni e condivisi, isolamento e limiti." },
  { href: "/chi-siamo", label: "Chi siamo", description: "Perché nasce Qoovex e i principi che segue." },
  { href: "/faq", label: "Domande frequenti", description: "Risposte su accesso, file, modifiche e pagamenti." },
  { href: "/contattaci", label: "Contattaci", description: "Parla con noi del vostro modo di lavorare." },
] as const;

export const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Termini" },
  { href: "/cookies", label: "Cookie" },
  { href: "/dpa", label: "DPA" },
] as const;
