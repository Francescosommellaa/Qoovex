import type { ReactNode } from "react";
import { Button, Card, Container } from "@qoovex/ui";
import { contactEmail, contactHref, legalLinks, workspaceUrl } from "./site-config";

type SiteShellProps = {
  children: ReactNode;
};

type LegalPageProps = {
  children: ReactNode;
  eyebrow?: string;
  intro: string;
  title: string;
};

export function SiteHeader() {
  return (
    <header className="site-header">
      <Container>
        <nav aria-label="Navigazione principale" className="site-nav">
          <a className="site-brand" href="/">
            Qoovex
          </a>
          <div className="site-nav__links">
            <a href="/#cosa-fa">Cosa fa</a>
            <a href="/#per-chi">Per chi e</a>
            <a href="/manuale-operativo">Manuale</a>
            <a href={contactHref}>Contatto</a>
            <Button href={workspaceUrl} variant="secondary">
              Accedi al workspace
            </Button>
          </div>
        </nav>
      </Container>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Container>
        <div className="site-footer__grid">
          <div>
            <a className="site-brand" href="/">
              Qoovex
            </a>
            <p className="muted">Qoovex organizza, non certifica.</p>
            <p className="muted">
              Contatto operativo: <a href={contactHref}>{contactEmail}</a>
            </p>
          </div>
          <nav aria-label="Link legali e operativi" className="site-footer__links">
            {legalLinks.map((link) => (
              <a href={link.href} key={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  );
}

export function SiteShell({ children }: SiteShellProps) {
  return (
    <main className="site-shell">
      <SiteHeader />
      {children}
      <SiteFooter />
    </main>
  );
}

export function LegalPage({ children, eyebrow = "Bozza da validare", intro, title }: LegalPageProps) {
  return (
    <SiteShell>
      <section className="legal-hero">
        <Container>
          <p className="legal-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{intro}</p>
        </Container>
      </section>
      <Container>
        <Card className="legal-notice" tone="attention">
          <p>
            Questo contenuto e una traccia operativa per la fase pilota. Deve essere verificato e
            approvato da un consulente qualificato prima dell'uso commerciale.
          </p>
        </Card>
        <div className="legal-content">{children}</div>
      </Container>
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
