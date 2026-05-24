import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import type { ReactNode } from "react";
import { ThemeProvider } from "@qoovex/ui";
import { AuthSessionProvider } from "@shared/providers/session-provider";

export const metadata: Metadata = {
  title: "Qoovex Workspace",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="it" data-theme="dark" data-scroll-behavior="smooth">
      <body>
        <ThemeProvider defaultTheme="dark">
          <AuthSessionProvider>{children}</AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
