import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "./class-names";

export type SectionProps = {
  children: ReactNode;
  description?: string;
  title?: string;
  tone?: "default" | "muted";
} & HTMLAttributes<HTMLElement>;

export function Section({ children, className, description, title, tone = "default", ...props }: SectionProps) {
  return (
    <section {...props} className={classNames("qv-section py-qv-section", tone === "muted" && "bg-qv-surface-muted", className)}>
      {(title || description) && (
        <div className="qv-section__header mx-auto mb-qv-6 w-full max-w-qv-content px-qv-page">
          <div className="max-w-qv-reading">
            {title && <h2 className="m-0 font-display text-qv-title font-semibold tracking-qv-tight text-qv-content">{title}</h2>}
            {description && <p className="mb-0 mt-qv-3 text-qv-body-lg text-qv-content-muted">{description}</p>}
          </div>
        </div>
      )}
      {children}
    </section>
  );
}
