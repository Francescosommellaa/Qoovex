import type { HTMLAttributes, ReactNode } from "react";

export type SectionProps = {
  children: ReactNode;
  description?: string;
  title?: string;
  tone?: "default" | "muted";
} & HTMLAttributes<HTMLElement>;

function classNames(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(" ");
}

export function Section({ children, className, description, title, tone = "default", ...props }: SectionProps) {
  return (
    <section {...props} className={classNames("qv-section", `qv-section--${tone}`, className)}>
      {(title || description) && (
        <div className="qv-section__header">
          {title && <h2>{title}</h2>}
          {description && <p>{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
