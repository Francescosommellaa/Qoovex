import * as React from "react";
import { cn } from "@qoovex/ui/lib/utils";

export type SpecimenRegion =
  | "overview"
  | "variants"
  | "sizes"
  | "persistent-states"
  | "interaction-states"
  | "high-risk-combinations"
  | "content-stress"
  | "responsive"
  | "themes"
  | "motion-final"
  | "motion-lifecycle";

export function SpecimenSection({
  children,
  className,
  description,
  region,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  description?: React.ReactNode;
  region: SpecimenRegion;
  title: string;
}) {
  const titleId = React.useId();

  return (
    <section
      aria-labelledby={titleId}
      className={className}
      data-specimen-region={region}
    >
      <div className="mb-4">
        <h2 id={titleId} className="text-2xl font-semibold tracking-tight">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function Specimen({
  children,
  className,
  stateId,
  title,
  visualId,
}: {
  children: React.ReactNode;
  className?: string;
  stateId?: string;
  title?: string;
  visualId?: string;
}) {
  return (
    <div
      className={cn("group flex min-w-0 flex-col gap-2", className)}
      data-specimen-state={stateId}
    >
      {title && <h3 className="text-sm font-medium text-foreground">{title}</h3>}
      <div
        className="relative flex min-h-36 min-w-0 w-full items-center justify-center rounded-lg border border-border bg-background p-4 shadow-xs sm:p-6 lg:p-10"
        data-visual-specimen={visualId}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden="true">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border)_40%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border)_40%,transparent)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]" />
        </div>
        <div className="relative z-10 flex min-w-0 w-full flex-col items-center justify-center gap-4">
          {children}
        </div>
      </div>
    </div>
  );
}

export function SpecimenGrid({
  children,
  className,
  cols = 2,
}: {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3;
}) {
  return (
    <div
      className={cn(
        "grid gap-4",
        {
          "grid-cols-1": cols === 1,
          "grid-cols-1 lg:grid-cols-2": cols === 2,
          "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3": cols === 3,
        },
        className
      )}
    >
      {children}
    </div>
  );
}
