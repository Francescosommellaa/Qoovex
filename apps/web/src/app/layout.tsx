import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@qoovex/ui/components/theme-provider";
import { MarketingCursor } from "@qoovex/ui/components/marketing-cursor";
import { ScrollbarController } from "@qoovex/ui/components/scrollbar-controller";
import { TooltipProvider } from "@qoovex/ui/components/tooltip";
import { CookieBanner } from "./CookieBanner";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://qoovex.com"),
  title: "Qoovex - Direzione vNext",
  description:
    "Qoovex vNext è la direzione approvata per uno spazio condiviso Azienda-cliente; la capacità non è ancora implementata.",
  openGraph: {
    title: "Qoovex - Direzione vNext",
    description:
      "Direzione prodotto approvata per il lavoro condiviso Azienda-cliente, non ancora implementata.",
    type: "website",
  },
};

const marketingCursorPathnames = [
  "/",
  "/pricing",
  "/contattaci",
  "/community",
  "/manuale-operativo",
  "/storie",
  "/novita",
] as const;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-scroll-behavior="smooth" data-theme="vercel" lang="it" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange enableSystem>
          <TooltipProvider>
            <ScrollbarController />
            <MarketingCursor pathnames={marketingCursorPathnames} />
            {children}
            <CookieBanner />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
