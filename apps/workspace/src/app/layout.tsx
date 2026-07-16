import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@qoovex/ui/components/theme-provider";
import { TooltipProvider } from "@qoovex/ui/components/tooltip";
import { WorkspaceShell } from "@/views/workspace/WorkspaceShell";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata = {
  title: "Qoovex",
  description: "Dashboard operativa per documenti, scadenze e prove di cantiere.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html data-scroll-behavior="smooth" data-theme="vercel" lang="it" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange enableSystem>
          <TooltipProvider><WorkspaceShell>{children}</WorkspaceShell></TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
