import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "./class-names";

export type ErrorStateProps = {
  action?: ReactNode;
  description: string;
  title?: string;
  headingLevel?: 2 | 3 | 4 | 5 | 6;
} & HTMLAttributes<HTMLElement>;

export function ErrorState({ action, className, description, headingLevel = 2, title = "Non e stato possibile completare l'operazione", ...props }: ErrorStateProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <section {...props} className={classNames("grid min-h-qv-24 place-items-start gap-qv-3 rounded-qv-lg border border-qv-danger/25 bg-qv-danger-soft p-qv-5", className)}>
      <div>
        <Heading className="m-0 font-display text-qv-title font-semibold text-qv-danger">{title}</Heading>
        <p className="mb-0 mt-qv-2 text-qv-content">{description}</p>
      </div>
      {action}
    </section>
  );
}
