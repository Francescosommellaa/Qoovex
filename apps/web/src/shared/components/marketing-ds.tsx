import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// MarketingLinkButton
// Bottone/link testuale con freccia, usato nelle sezioni marketing.
// ---------------------------------------------------------------------------

interface MarketingLinkButtonProps {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
}

export function MarketingLinkButton({
  href,
  children,
  className = "",
  variant = "primary",
  size = "md",
}: MarketingLinkButtonProps) {
  const variantClasses: Record<NonNullable<MarketingLinkButtonProps["variant"]>, string> = {
    primary: "text-primary hover:text-primary/90",
    secondary: "text-text hover:text-text-muted",
    ghost: "text-text-muted hover:text-text",
  };
  const sizeClasses: Record<NonNullable<MarketingLinkButtonProps["size"]>, string> = {
    sm: "text-(length:--text-xs)",
    md: "text-(length:--text-sm)",
  };

  return (
    <a
      href={href}
      className={[
        "inline-flex items-center gap-1.5",
        "font-medium",
        "underline-offset-4 hover:underline",
        "transition-colors duration-(--transition-interactive)",
        variantClasses[variant],
        sizeClasses[size],
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
  bodyClassName?: string;
}

export function MarketingPanelSurface({
  children,
  className = "",
  bodyClassName = "",
}: MarketingPanelSurfaceProps) {
  return (
    <div
      className={[
        "rounded-lg border border-border bg-surface",
        "p-6",
        "shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={["flex flex-col gap-3", bodyClassName]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
    </div>
  );
}