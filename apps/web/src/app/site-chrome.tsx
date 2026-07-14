import type { ReactNode } from "react";
import { Button, Container } from "@qoovex/ui";
import { contactEmail, contactHref, legalLinks, workspaceUrl } from "./site-config";

type SiteShellProps = { children: ReactNode };
type LegalPageProps = { children: ReactNode; eyebrow?: string; intro: string; title: string };

const mainLinks = [
  { href: "/#cosa-fa", label: "Cosa fa" },
  { href: "/#per-chi", label: "Per chi è" },
  { href: "/manuale-operativo", label: "Manuale" },
  { href: contactHref, label: "Contatto" },
];

function NavigationLinks() {
  return <>{mainLinks.map((link) => <a href={link.href} key={link.href}>{link.label}</a>)}<Button href={workspaceUrl} variant="secondary">Accedi</Button></>;
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <Container size="wide">
        <nav aria-label="Navigazione principale" className="site-nav">
          <a className="site-brand" href="/">Qoovex</a>
          <div className="site-nav__desktop"><NavigationLinks /></div>
          <details className="site-menu">
            <summary>Menu</summary>
            <div className="site-menu__panel"><NavigationLinks /></div>
          </details>
        </nav>
      </Container>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Container size="wide">
        <div className="site-footer__grid">
          <div><a className="site-brand" href="/">Qoovex</a><p>Ordine operativo per documenti, scadenze e prove.</p></div>
          <div><strong>Contatto</strong><a href={contactHref}>{contactEmail}</a></div>
          <nav aria-label="Link legali e operativi">{legalLinks.map((link) => <a href={link.href} key={link.href}>{link.label}</a>)}</nav>
        </div>
      </Container>
    </footer>
  );
}

export function SiteShell({ children }: SiteShellProps) {
  return <div className="site-shell"><SiteHeader /><main>{children}</main><SiteFooter /></div>;
}

export function LegalPage({ children, eyebrow = "Bozza da validare", intro, title }: LegalPageProps) {
  return (
    <SiteShell>
      <section className="legal-hero"><Container><p className="legal-eyebrow">{eyebrow}</p><h1>{title}</h1><p>{intro}</p></Container></section>
      <Container>
        <aside className="legal-notice"><strong>Contenuto operativo da validare</strong><p>Questa traccia deve essere verificata da un consulente qualificato prima dell'uso commerciale.</p></aside>
        <div className="legal-content">{children}</div>
      </Container>
    </SiteShell>
  );
}

export function LegalSection({ children, title }: { children: ReactNode; title: string }) {
  return <section className="legal-section"><h2>{title}</h2>{children}</section>;
}
