"use client";

import type { ReactNode } from "react";
import { IconArrowRight, IconInfoCircle } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { buttonVariants } from "@qoovex/ui/components/button";
import { FloatingNavigation, type FloatingNavigationSection } from "@qoovex/ui/components/floating-navigation";
import { Separator } from "@qoovex/ui/components/separator";
import { BrandMark } from "@/components/brand-mark";
import { contactEmail, contactHref, legalLinks, workspaceUrl } from "./site-config";

type SiteShellProps = { children: ReactNode; sections?: FloatingNavigationSection[] };
type LegalPageProps = { children: ReactNode; eyebrow?: string; intro: string; title: string };

const mainLinks = [
  { href: "/#panoramica", label: "Panoramica" },
  { href: "/#prodotto", label: "Prodotto" },
  { href: "/#metodo", label: "Metodo" },
  { href: "/manuale-operativo", label: "Manuale" },
];

export function SiteHeader({ sections = [] }: { sections?: FloatingNavigationSection[] }) {
  const pathname = usePathname();

  return (
    <FloatingNavigation
      action={
        <a className={buttonVariants({ className: "hidden sm:inline-flex" })} href={workspaceUrl}>
          Accedi <IconArrowRight data-icon="inline-end" />
        </a>
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
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.5fr_0.5fr_0.5fr] lg:px-8">
        <div className="flex flex-col items-start gap-3">
          <a className="rounded-md" href="/"><BrandMark /></a>
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">Ordine operativo per documenti, scadenze e prove.</p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <strong>Contatto</strong>
          <a className="text-muted-foreground hover:text-foreground" href={contactHref}>{contactEmail}</a>
        </div>
        <nav aria-label="Link legali e operativi" className="flex flex-col gap-2 text-sm">
          {legalLinks.map((link) => <a className="text-muted-foreground hover:text-foreground" href={link.href} key={link.href}>{link.label}</a>)}
        </nav>
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
        <div className="legal-content">{children}</div>
      </div>
    </SiteShell>
  );
}

export function LegalSection({ children, title }: { children: ReactNode; title: string }) {
  return <section className="legal-section"><h2>{title}</h2>{children}</section>;
}
