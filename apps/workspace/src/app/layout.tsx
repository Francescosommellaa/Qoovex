import type { ReactNode } from "react";
import { WorkspaceShell } from "@/views/workspace/WorkspaceShell";
import "./globals.css";

export const metadata = {
  title: "Qoovex",
  description: "Dashboard operativa per documenti, scadenze e prove di cantiere.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="it" data-theme="light">
      <body><WorkspaceShell>{children}</WorkspaceShell></body>
    </html>
  );
}
