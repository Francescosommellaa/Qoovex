import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Qoovex",
  description: "Dashboard operativa per documenti, scadenze e prove di cantiere.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
