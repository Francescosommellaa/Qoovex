"use client";

import type { ReactNode } from "react";
import { IconArrowRight, IconInfoCircle } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { buttonVariants } from "@qoovex/ui/components/button";
import { FloatingNavigation, type FloatingNavigationSection } from "@qoovex/ui/components/floating-navigation";
import { Separator } from "@qoovex/ui/components/separator";
import { BrandMark } from "@/components/brand-mark";
import {
  contactEmail,
  contactHref,
  legalLinks,
  primaryCtaLabel,
  workspaceUrl,
} from "./site-config";

type SiteShellProps = { children: ReactNode; sections?: FloatingNavigationSection[] };
type LegalPageProps = { children: ReactNode; eyebrow?: string; intro: string; title: string };

const mainLinks = [
  { href: "/#problema", label: "Problema" },
  { href: "/#cosa", label: "Cosa fa" },
  { href: "/#faq", label: "FAQ" },
  { href: "/manuale-operativo", label: "Manuale" },
];

const audienceLinks = [
  "Piccole imprese",
  "Subappaltatori",
  "Artigiani",
  "Consulenti sicurezza",
] as const;

export function SiteHeader({ sections = [] }: { sections?: FloatingNavigationSection[] }) {
  const pathname = usePathname();

  return (
    <FloatingNavigation
      action={
        <span className="hidden sm:contents">
          <a
            className={buttonVariants()}
            data-cursor-label="Prova"
            data-cursor-magnetic="true"
            href={workspaceUrl}
          >
            {primaryCtaLabel} <IconArrowRight data-icon="inline-end" />
          </a>
        </span>
      }
      activeHref={pathname}
      brand={(compact) => <BrandMark compact={compact} />}
      homeHref="/"
      sections={sections}
      surfaceLabel="Navigazione"
      surfaceLinks={mainLinks}
    />
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 border-b pb-10 md:grid-cols-2 lg:grid-cols-[1.35fr_0.7fr_0.7fr_0.7fr]">
          <div className="flex flex-col items-start gap-4">
            <a className="rounded-md" data-link="plain" href="/"><BrandMark /></a>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              Qoovex è un sistema documentale operativo per organizzare
              documenti, versioni, scadenze, checklist, prove e pacchetti di
              cantieri e lavoratori. Mostra contenuti presenti, mancanti, in
              scadenza o da verificare.
            </p>
            <a className="text-sm text-muted-foreground hover:text-foreground" data-link="quiet" href={contactHref}>
              {contactEmail}
            </a>
          </div>

          <nav aria-label="Esplora Qoovex" className="flex flex-col gap-2 text-sm">
            <strong className="mb-1">Esplora</strong>
            <a className="text-muted-foreground hover:text-foreground" data-link="quiet" href="/#cosa">Cosa fa</a>
            <a className="text-muted-foreground hover:text-foreground" data-link="quiet" href="/#storia">Perché Qoovex</a>
            <a className="text-muted-foreground hover:text-foreground" data-link="quiet" href="/#faq">FAQ</a>
            <a className="text-muted-foreground hover:text-foreground" data-link="quiet" href="/#faq-piani">Piani e accesso</a>
            <a className="text-muted-foreground hover:text-foreground" data-link="quiet" href="/manuale-operativo">Manuale operativo</a>
          </nav>

          <div aria-labelledby="audience-title" className="flex flex-col gap-2 text-sm">
            <strong className="mb-1" id="audience-title">Pensato per</strong>
            {audienceLinks.map((label) => (
              <span className="text-muted-foreground" key={label}>{label}</span>
            ))}
          </div>

          <nav aria-label="Link legali" className="flex flex-col gap-2 text-sm">
            <strong className="mb-1">Legale</strong>
            {legalLinks.map((link) => <a className="text-muted-foreground hover:text-foreground" data-link="quiet" href={link.href} key={link.href}>{link.label}</a>)}
          </nav>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Qoovex. Sito pubblico informativo.</p>
          <p>Qoovex non certifica persone o documenti e non sostituisce consulenti o responsabili.</p>
        </div>
      </div>
    </footer>
  );
}

export function SiteShell({ children, sections = [] }: SiteShellProps) {
  return <div className="min-h-dvh bg-background"><SiteHeader sections={sections} /><main>{children}</main><SiteFooter /></div>;
}

export function LegalPage({ children, eyebrow = "Bozza da validare", intro, title }: LegalPageProps) {
  return (
    <SiteShell>
      <section className="border-b">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 md:py-20">
          <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">{title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-7 text-muted-foreground">{intro}</p>
        </div>
      </section>
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Alert className="mt-8">
          <IconInfoCircle />
          <AlertTitle>Contenuto operativo da validare</AlertTitle>
          <AlertDescription>Questa traccia deve essere verificata da un consulente qualificato prima dell&apos;uso commerciale.</AlertDescription>
        </Alert>
        <div className="legal-content" data-link-scope="inline">{children}</div>
      </div>
    </SiteShell>
  );
}

export function LegalSection({ children, title }: { children: ReactNode; title: string }) {
  return <section className="legal-section"><h2>{title}</h2>{children}</section>;
}
