"use client";

import type { ReactNode } from "react";
import { IconArrowRight, IconInfoCircle } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { linkVariants } from "@qoovex/ui/components/link";
import { FloatingNavigation, type FloatingNavigationSection } from "@qoovex/ui/components/floating-navigation";
import { cn } from "@qoovex/ui/lib/utils";
import { BrandMark } from "@/components/brand-mark";
import {
  contactEmail,
  contactHref,
  legalLinks,
  mainNavLinks,
  primaryCtaHref,
  primaryCtaLabel,
  secondaryNavLinks,
  signInLabel,
  signInUrl,
} from "./site-config";

type SiteShellProps = { children: ReactNode; sections?: FloatingNavigationSection[] };
type LegalPageProps = { children: ReactNode; eyebrow?: string; intro: string; title: string };

const surfaceLinks = mainNavLinks.map((link) => ({ href: link.href, label: link.label }));
const resourceLinks = secondaryNavLinks.map((link) => ({
  href: link.href,
  label: link.label,
  description: link.description,
}));

function HeaderAction() {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <a
        className={cn(linkVariants({ variant: "ghost", size: "sm" }))}
        href={signInUrl}
      >
        {signInLabel}
      </a>
    </div>
  );
}

export function SiteHeader({ sections = [] }: { sections?: FloatingNavigationSection[] }) {
  const pathname = usePathname();
  return (
    <FloatingNavigation
      action={<HeaderAction />}
      activeHref={pathname}
      brand={(compact) => <BrandMark compact={compact} />}
      desktopBreakpoint="lg"
      homeHref="/"
      resourceLabel="Esplora"
      resourceLinks={resourceLinks}
      sections={sections}
      surfaceLabel="Sezioni"
      surfaceLinks={surfaceLinks}
    />
  );
}

const footerColumns = [
  { title: "Prodotto", links: mainNavLinks },
  { title: "Esplora", links: secondaryNavLinks.map((link) => ({ href: link.href, label: link.label })) },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <BrandMark />
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
              Qoovex documenta il processo condiviso di un lavoro edile. Non movimenta denaro, non
              certifica conformità e non sostituisce il giudizio di professionisti e tecnici.
            </p>
            <a
              className="mt-4 w-fit text-sm text-muted-foreground"
              data-link="quiet"
              href={contactHref}
            >
              {contactEmail}
            </a>
          </div>
          {footerColumns.map((column) => (
            <nav
              key={column.title}
              aria-label={`${column.title} nel piè di pagina`}
              className="flex flex-col gap-3"
            >
              <p className="text-sm font-medium text-foreground">{column.title}</p>
              {column.links.map((link) => (
                <a
                  className="w-fit text-sm text-muted-foreground"
                  data-link="quiet"
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          ))}
        </div>
        <div className="flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex flex-wrap gap-4 text-sm" aria-label="Link legali nel piè di pagina">
            {legalLinks.map((link) => (
              <a
                className="w-fit text-muted-foreground"
                data-link="quiet"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <p className="text-xs text-muted-foreground">© 2026 Qoovex. Tutti i diritti riservati.</p>
        </div>
      </div>
    </footer>
  );
}

export function SiteShell({ children, sections = [] }: SiteShellProps) {
  return (
    <div className="min-h-dvh bg-background">
      <a
        className="fixed left-[max(1rem,var(--safe-area-left))] top-[max(1rem,var(--safe-area-top))] z-[60] -translate-y-24 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg outline-none transition-transform focus-visible:translate-y-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
        href="#contenuto-principale"
      >
        Vai al contenuto principale
      </a>
      <SiteHeader sections={sections} />
      <main className="scroll-mt-24 outline-none" id="contenuto-principale" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

export function LegalPage({ children, eyebrow = "Bozza da validare", intro, title }: LegalPageProps) {
  return (
    <SiteShell>
      <section className="border-b pt-20">
        <div className="mx-auto max-w-4xl px-4 pb-14 pt-4 sm:px-6">
          <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-5 text-lg text-muted-foreground">{intro}</p>
        </div>
      </section>
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Alert className="mt-8">
          <IconInfoCircle aria-hidden="true" />
          <AlertTitle>Contenuto da validare</AlertTitle>
          <AlertDescription>
            Questa traccia richiede verifica qualificata prima dell’uso commerciale.
          </AlertDescription>
        </Alert>
        <div className="legal-content">{children}</div>
      </div>
    </SiteShell>
  );
}

export function LegalSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="legal-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
