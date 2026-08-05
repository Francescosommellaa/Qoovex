import type { ReactNode } from "react";
import { cn } from "@qoovex/ui/lib/utils";

type ProductFrameProps = {
  children: ReactNode;
  /** Etichetta mostrata nella barra del titolo (es. nome cantiere). */
  title: string;
  /** Sottotitolo opzionale (es. ruolo o vista). */
  subtitle?: string;
  className?: string;
};

/**
 * Cornice neutra tipo finestra applicativa per rappresentare interfacce credibili
 * di Qoovex. Puramente decorativa nella chrome: il contenuto reale è nei children.
 */
export function ProductFrame({ children, title, subtitle, className }: ProductFrameProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-card shadow-lg ring-1 ring-foreground/5",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b bg-muted/40 px-4 py-3">
        <div aria-hidden className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-foreground/15" />
          <span className="size-2.5 rounded-full bg-foreground/15" />
          <span className="size-2.5 rounded-full bg-foreground/15" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-foreground">{title}</p>
          {subtitle ? (
            <p className="truncate text-[0.7rem] text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

/** Piccola etichetta per distinguere contenuto interno da contenuto condiviso. */
export function VisibilityTag({ shared }: { shared: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[0.7rem] font-medium",
        shared
          ? "border-success/30 bg-success-surface text-success"
          : "border-border bg-muted text-muted-foreground",
      )}
    >
      <span
        aria-hidden
        className={cn("size-1.5 rounded-full", shared ? "bg-success" : "bg-muted-foreground")}
      />
      {shared ? "Condiviso" : "Interno"}
    </span>
  );
}
