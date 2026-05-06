import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Qoovex — Il workspace per chef professionisti",
    template: "%s | Qoovex",
  },
  description:
    "Gestisci ricette, menu digitali, allergeni, valori nutrizionali e piani di lavoro collaborativi. Il workspace operativo pensato per cuochi e chef professionisti.",
  metadataBase: new URL("https://qoovex.com"),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}