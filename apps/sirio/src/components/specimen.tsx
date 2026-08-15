import * as React from "react";
import { cn } from "@qoovex/ui/lib/utils";

export function Specimen({
  children,
  className,
  title,
  visualId,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  visualId?: string;
}) {
  return (
    <div className={cn("group flex flex-col gap-2", className)}>
      {title && <h3 className="text-sm font-medium text-foreground">{title}</h3>}
      <div
        className="relative flex min-h-[150px] w-full items-center justify-center rounded-lg border bg-background p-6 shadow-xs overflow-hidden sm:p-10"
        data-visual-specimen={visualId}
      >
        {/* Neutral background pattern or styling could go here, for now it's plain background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />
        <div className="relative z-10 flex w-full flex-col items-center justify-center gap-4">
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
          "grid-cols-1 sm:grid-cols-2": cols === 2,
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3": cols === 3,
        },
        className
      )}
    >
      {children}
    </div>
  );
}
