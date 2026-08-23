import * as React from "react";
import { cn } from "@qoovex/ui/lib/utils";

export function ColorSwatch({
  name,
  variable,
  foregroundVariable,
  description,
  badge,
}: {
  name: string;
  variable: string;
  foregroundVariable?: string;
  description?: string;
  badge?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`var(${variable})`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div
      className="group relative flex flex-col gap-2.5 rounded-lg border border-border bg-card p-3 transition-all hover:border-foreground/20 hover:shadow-xs cursor-pointer select-none"
      onClick={handleCopy}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleCopy()}
      aria-label={`Copia token ${variable}`}
    >
      <div
        className="relative flex h-20 w-full items-center justify-center rounded-md border border-border/40 shadow-2xs transition-transform group-hover:scale-[1.01]"
        style={{
          backgroundColor: `var(${variable})`,
          color: foregroundVariable ? `var(${foregroundVariable})` : undefined,
        }}
      >
        {foregroundVariable ? (
          <span className="text-xs font-semibold tracking-tight">Aa Text</span>
        ) : null}
        <span className="absolute bottom-1.5 right-1.5 rounded bg-background/90 px-1 py-0.5 text-[10px] font-mono backdrop-blur-xs text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          {copied ? "Copiato!" : "Copia"}
        </span>
      </div>

      <div className="flex flex-col gap-0.5">
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs font-semibold text-foreground">{name}</span>
          {badge && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground">
              {badge}
            </span>
          )}
        </div>
        <code className="text-[11px] font-mono text-muted-foreground">{variable}</code>
        {description && (
          <p className="mt-1 text-[11px] text-muted-foreground leading-tight">{description}</p>
        )}
      </div>
    </div>
  );
}

export function ColorGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5", className)}>
      {children}
    </div>
  );
}

export function TypographySpecimen({
  label,
  fontFamily,
}: {
  label: string;
  fontFamily: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border p-6">
      <div className="flex flex-col">
        <span className="text-sm font-medium">{label}</span>
        <code className="text-xs text-muted-foreground">{fontFamily}</code>
      </div>
      <div
        className="text-4xl text-foreground"
        style={{ fontFamily: `var(${fontFamily})` }}
      >
        AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz 0123456789
      </div>
    </div>
  );
}

export function SpacingSpecimen({
  name,
  variable,
  size,
  useCase,
}: {
  name: string;
  variable: string;
  size: string;
  useCase?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`var(${variable})`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div
      className="group flex flex-col gap-2 rounded-lg border border-border/70 bg-card p-3.5 transition-all hover:border-foreground/20 hover:shadow-xs cursor-pointer select-none sm:flex-row sm:items-center sm:justify-between"
      onClick={handleCopy}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleCopy()}
      aria-label={`Copia token ${variable}`}
    >
      <div className="flex min-w-[14rem] flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{name}</span>
          <span className="font-accent text-xs tabular-nums text-muted-foreground">{size}</span>
        </div>
        <code className="text-[11px] font-mono text-muted-foreground">{variable}</code>
        {useCase && <span className="text-[11px] text-muted-foreground">{useCase}</span>}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-8 items-center rounded-md bg-muted/60 px-3">
          <div
            className="h-4 rounded-xs bg-foreground transition-all group-hover:bg-primary"
            style={{ width: `var(${variable})` }}
          />
        </div>
        <span className="text-[10px] font-mono text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
          {copied ? "Copiato!" : "Copia"}
        </span>
      </div>
    </div>
  );
}

export function RadiusSpecimen({
  name,
  variable,
  size,
  useCase,
}: {
  name: string;
  variable: string;
  size?: string;
  useCase?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`var(${variable})`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div
      className="group relative flex flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-all hover:border-foreground/20 hover:shadow-xs cursor-pointer select-none"
      onClick={handleCopy}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleCopy()}
      aria-label={`Copia token ${variable}`}
    >
      <div className="relative flex h-24 w-full items-center justify-center rounded-md border border-border/60 bg-muted/50 p-2">
        <div
          className="h-16 w-full border-2 border-foreground bg-background transition-transform group-hover:scale-[1.02]"
          style={{ borderRadius: `var(${variable})` }}
        />
        <span className="absolute bottom-1.5 right-1.5 rounded bg-background/90 px-1 py-0.5 text-[10px] font-mono backdrop-blur-xs text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          {copied ? "Copiato!" : "Copia"}
        </span>
      </div>

      <div className="flex flex-col gap-0.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">{name}</span>
          {size && <span className="font-accent text-[11px] tabular-nums text-muted-foreground">{size}</span>}
        </div>
        <code className="text-[11px] font-mono text-muted-foreground">{variable}</code>
        {useCase && (
          <p className="mt-1 text-[11px] text-muted-foreground leading-tight">{useCase}</p>
        )}
      </div>
    </div>
  );
}
