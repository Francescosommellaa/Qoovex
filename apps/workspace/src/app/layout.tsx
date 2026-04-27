import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "@/app/globals.css";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Qoovex Workspace",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="it">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}