import type * as React from "react";
import { cn } from "#lib/utils";

export function BrandMark({
  className,
  compact = false,
  label,
  mark,
}: {
  className?: string;
  compact?: boolean;
  label: string;
  mark: React.ReactNode;
}) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="relative grid size-7 shrink-0 place-items-center overflow-hidden rounded-md">
        {mark}
      </span>
      {compact ? <span className="sr-only">{label}</span> : <span className="truncate">{label}</span>}
    </span>
  );
}
