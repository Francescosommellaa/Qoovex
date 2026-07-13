import type { Metadata } from "next";
import { CookieBanner } from "./CookieBanner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://qoovex.com"),
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
    <html lang="it" data-theme="light">
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
