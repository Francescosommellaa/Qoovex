import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Sirio - Qoovex Design System",
  description:
    "Specifica eseguibile del Qoovex Design System Stable v0.5.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
