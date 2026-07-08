import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Qoovex - Documenti, scadenze e prove di cantiere",
  description:
    "Qoovex aiuta piccole imprese e subappaltatori a organizzare documenti, scadenze, checklist, prove e pacchetti documentali pronti per revisione.",
  openGraph: {
    title: "Qoovex - Documenti, scadenze e prove di cantiere",
    description:
      "Organizza documenti, scadenze, checklist, prove e pacchetti documentali pronti per revisione.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
