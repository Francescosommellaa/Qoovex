import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@qoovex/ui/components/theme-provider";
import { TooltipProvider } from "@qoovex/ui/components/tooltip";
import { CookieBanner } from "./CookieBanner";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://qoovex.com"),
  title: "Qoovex - Documenti, scadenze e prove di cantiere",
  description:
    "Qoovex aiuta piccole imprese e subappaltatori a organizzare documenti, scadenze, checklist, prove e pacchetti documentali pronti per revisione.",
  openGraph: {
    title: "Qoovex - Documenti, scadenze e prove di cantiere",
    description:
      "Organizza documenti, scadenze, checklist, prove e pacchetti documentali pronti per revisione.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-scroll-behavior="smooth" data-theme="vercel" lang="it" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange enableSystem>
          <TooltipProvider>
            {children}
            <CookieBanner />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
