import type { Metadata } from "next";
import { Barlow_Condensed, IBM_Plex_Mono, Source_Sans_3 } from "next/font/google";
import type { ReactNode } from "react";

import "@qoovex/ui/styles.css";
import "./globals.css";
import { SirioShell } from "./sirio-shell";

const display = Barlow_Condensed({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600", "700"] });
const body = Source_Sans_3({ subsets: ["latin"], variable: "--font-body" });
const data = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-data", weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "Sirio — Qoovex Pre-Service Brain",
  description: "Scope e componenti candidati per il cervello operativo pre-servizio di Qoovex.",
  metadataBase: new URL("https://sirio.qoovex.com"),
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="it" className={`${display.variable} ${body.variable} ${data.variable}`}>
      <body><SirioShell>{children}</SirioShell></body>
    </html>
  );
}
