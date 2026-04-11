import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sirio — Qoovex Design System",
  description:
    "Il design system ufficiale di Qoovex. Colori, tipografia, componenti, token e pattern per costruire prodotti coerenti e belli.",
  openGraph: {
    title: "Sirio — Qoovex Design System",
    description: "Design system ufficiale di Qoovex.",
    siteName: "Sirio",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="dark">
      <body>{children}</body>
      <Analytics />
    </html>
  );
}
