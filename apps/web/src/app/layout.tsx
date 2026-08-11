import type { Metadata } from "next";
import { ThemeProvider } from "@qoovex/ui/components/theme-provider";
import { MarketingCursor } from "@qoovex/ui/components/marketing-cursor";
import { ScrollbarController } from "@qoovex/ui/components/scrollbar-controller";
import { TooltipProvider } from "@qoovex/ui/components/tooltip";
import { CookieBanner } from "./CookieBanner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://qoovex.com"),
  title: {
    default: "Qoovex - Documenta un lavoro edile con chiarezza",
    template: "%s | Qoovex",
  },
  description:
    "Qoovex aiuta le piccole imprese edili e i clienti a documentare un lavoro: avanzamento, step, modifiche, prove e richieste restano collegati al cantiere.",
  applicationName: "Qoovex",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Qoovex - Documenta un lavoro edile con chiarezza",
    description:
      "Organizza il cantiere, raccogli gli aggiornamenti e condividi con il cliente solo ciò che serve.",
    type: "website",
    locale: "it_IT",
    siteName: "Qoovex",
  },
  twitter: {
    card: "summary_large_image",
    title: "Qoovex - Documenta un lavoro edile con chiarezza",
    description:
      "Organizza il cantiere, raccogli gli aggiornamenti e condividi con il cliente solo ciò che serve.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-scroll-behavior="smooth" data-theme="vercel" lang="it" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange enableSystem>
          <TooltipProvider>
            <ScrollbarController />
            <MarketingCursor />
            {children}
            <CookieBanner />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
