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
    <section {...props} className={classNames("qv-section py-qv-8", tone === "muted" && "bg-qv-surface-muted", className)}>
      {(title || description) && (
        <div className="qv-section__header mb-qv-5 max-w-3xl">
          {title && <h2 className="font-display text-qv-title font-semibold text-qv-content">{title}</h2>}
          {description && <p className="mt-qv-3 text-qv-body text-qv-content-muted">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
