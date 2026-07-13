import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sirio - Qoovex Design System",
  description: "Showcase tecnico dei token e delle primitive UI condivise Qoovex.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
