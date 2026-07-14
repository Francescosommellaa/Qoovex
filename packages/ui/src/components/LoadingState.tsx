import type { HTMLAttributes } from "react";
import { classNames } from "./class-names";

export type LoadingStateProps = { label?: string } & HTMLAttributes<HTMLDivElement>;

export function LoadingState({ className, label = "Caricamento in corso", ...props }: LoadingStateProps) {
  return (
    <div {...props} aria-live="polite" className={classNames("flex min-h-qv-state items-center gap-qv-3 text-qv-content-muted", className)} role="status">
      <span aria-hidden="true" className="h-qv-1 w-qv-5 animate-pulse bg-qv-accent" />
      <span>{label}</span>
    </div>
  );
}
