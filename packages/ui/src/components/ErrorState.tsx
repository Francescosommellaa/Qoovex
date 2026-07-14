import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "./class-names";

export type ErrorStateProps = {
  action?: ReactNode;
  description: string;
  title?: string;
} & HTMLAttributes<HTMLElement>;

export function ErrorState({ action, className, description, title = "Non e stato possibile completare l'operazione", ...props }: ErrorStateProps) {
  return (
    <section {...props} className={classNames("grid min-h-qv-state place-items-start gap-qv-3 border border-l-4 border-qv-danger/35 bg-qv-danger-soft p-qv-5", className)}>
      <div>
        <h2 className="m-0 font-display text-qv-title font-semibold text-qv-danger">{title}</h2>
        <p className="mb-0 mt-qv-2 text-qv-content">{description}</p>
      </div>
      {action}
    </section>
  );
}
