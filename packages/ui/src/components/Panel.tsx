import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "./class-names";

export type PanelProps = {
  children: ReactNode;
  tone?: "default" | "muted";
} & HTMLAttributes<HTMLElement>;

export function Panel({ children, className, tone = "default", ...props }: PanelProps) {
  return (
    <section
      {...props}
      className={classNames(
        "rounded-qv-lg border p-qv-5",
        tone === "muted" ? "border-qv-border bg-qv-surface-muted" : "border-qv-border bg-qv-surface",
        className,
      )}
    >
      {children}
    </section>
  );
}
