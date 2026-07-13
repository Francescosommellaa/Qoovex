import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "./class-names";

export type EmptyStateProps = {
  action?: ReactNode;
  description: string;
  title: string;
  headingLevel?: 2 | 3 | 4 | 5 | 6;
} & HTMLAttributes<HTMLElement>;

export function EmptyState({ action, className, description, headingLevel = 2, title, ...props }: EmptyStateProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <section {...props} className={classNames("grid min-h-qv-24 place-items-start gap-qv-3 rounded-qv-lg border border-dashed border-qv-border bg-qv-surface-muted p-qv-5", className)}>
      <div>
        <Heading className="m-0 font-display text-qv-title font-semibold text-qv-content">{title}</Heading>
        <p className="mb-0 mt-qv-2 text-qv-content-muted">{description}</p>
      </div>
      {action}
    </section>
  );
}
