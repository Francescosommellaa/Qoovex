import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// MarketingLinkButton
// Bottone/link testuale con freccia, usato nelle sezioni marketing.
// ---------------------------------------------------------------------------

interface MarketingLinkButtonProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export function MarketingLinkButton({
  href,
  children,
  className = "",
}: MarketingLinkButtonProps) {
  return (
    <a
      href={href}
      className={[
        "inline-flex items-center gap-1.5",
        "text-(length:--text-sm) font-medium text-primary",
        "underline-offset-4 hover:underline",
        "transition-colors duration-(--transition-interactive)",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
      <span aria-hidden="true">→</span>
    </a>
  );
}

// ---------------------------------------------------------------------------
// MarketingQuietSurface
// Superficie neutra a basso contrasto, usata per sezioni hero e intro pagina.
// ---------------------------------------------------------------------------

interface MarketingQuietSurfaceProps {
  children: ReactNode;
  className?: string;
}

export function MarketingQuietSurface({
  children,
  className = "",
}: MarketingQuietSurfaceProps) {
  return (
    <section
      className={[
        "w-full bg-surface-offset py-16",
        "flex flex-col gap-4",
        "px-4 sm:px-8 lg:px-16",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </section>
  );
}

// ---------------------------------------------------------------------------
// MarketingPanelSurface
// Card/panel con bordo e sfondo leggermente rialzato.
// Usata per feature card, callout, blocchi di contenuto distinto.
// ---------------------------------------------------------------------------

interface MarketingPanelSurfaceProps {
  children: ReactNode;
  className?: string;
}

export function MarketingPanelSurface({
  children,
  className = "",
}: MarketingPanelSurfaceProps) {
  return (
    <div
      className={[
        "rounded-lg border border-border bg-surface",
        "p-6 flex flex-col gap-3",
        "shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}