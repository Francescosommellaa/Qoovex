import type { HTMLAttributes } from "react";
import { classNames } from "./class-names";

export type LoadingStateProps = { label?: string } & HTMLAttributes<HTMLDivElement>;

export function LoadingState({ className, label = "Caricamento in corso", ...props }: LoadingStateProps) {
  return (
    <div {...props} aria-live="polite" className={classNames("flex min-h-qv-24 items-center gap-qv-3 text-qv-content-muted", className)} role="status">
      <span aria-hidden="true" className="size-qv-4 animate-pulse rounded-qv-pill bg-qv-accent" />
      <span>{label}</span>
    </div>
  );
}
