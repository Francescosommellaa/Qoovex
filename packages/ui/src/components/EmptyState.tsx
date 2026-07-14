import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "./class-names";

export type EmptyStateProps = {
  action?: ReactNode;
  description: string;
  title: string;
} & HTMLAttributes<HTMLElement>;

export function EmptyState({ action, className, description, title, ...props }: EmptyStateProps) {
  return (
    <section {...props} className={classNames("grid min-h-qv-state place-items-start gap-qv-3 border-l-4 border-dashed border-qv-border-strong bg-qv-surface-muted p-qv-5", className)}>
      <div>
        <h2 className="m-0 font-display text-qv-title font-semibold text-qv-content">{title}</h2>
        <p className="mb-0 mt-qv-2 text-qv-content-muted">{description}</p>
      </div>
      {action}
    </section>
  );
}
