import type { ReactNode } from "react";
import { FontshareFonts } from "@qoovex/ui/components/fontshare-fonts";
import { ThemeProvider } from "@qoovex/ui/components/theme-provider";
import { ScrollbarController } from "@qoovex/ui/components/scrollbar-controller";
import { TooltipProvider } from "@qoovex/ui/components/tooltip";
import { WorkspaceShell } from "@/views/workspace/WorkspaceShell";
import "./globals.css";

export const metadata = {
  title: "Qoovex",
  description: "Spazio condiviso tra impresa e cliente per documentare lavori, modifiche, prove e pagamenti.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html data-scroll-behavior="smooth" data-theme="vercel" lang="it" suppressHydrationWarning>
      <head><FontshareFonts /></head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange enableSystem>
          <TooltipProvider><ScrollbarController /><WorkspaceShell>{children}</WorkspaceShell></TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
