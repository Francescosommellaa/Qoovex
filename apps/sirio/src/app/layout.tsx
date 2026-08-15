import type { Metadata, Viewport } from "next";
import { FontshareFonts } from "@qoovex/ui/components/fontshare-fonts";
import { ThemeProvider } from "@qoovex/ui/components/theme-provider";
import { MarketingCursor } from "@qoovex/ui/components/marketing-cursor";
import { ScrollbarController } from "@qoovex/ui/components/scrollbar-controller";
import { TooltipProvider } from "@qoovex/ui/components/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Sirio - Qoovex", template: "%s - Sirio" },
  description: "Catalogo integrato del design system canonico Qoovex.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-scroll-behavior="smooth" data-theme="vercel" lang="it" suppressHydrationWarning>
      <head><FontshareFonts /></head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider><ScrollbarController /><MarketingCursor />{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
