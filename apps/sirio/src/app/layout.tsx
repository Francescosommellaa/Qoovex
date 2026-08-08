import type { Metadata } from "next";
import { ThemeProvider } from "@qoovex/ui/components/theme-provider";
import { MarketingCursor } from "@qoovex/ui/components/marketing-cursor";
import { ScrollbarController } from "@qoovex/ui/components/scrollbar-controller";
import { TooltipProvider } from "@qoovex/ui/components/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Sirio - Qoovex", template: "%s - Sirio" },
  description: "Catalogo integrato del design system canonico Qoovex.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-scroll-behavior="smooth" data-theme="vercel" lang="it" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider><ScrollbarController /><MarketingCursor />{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
