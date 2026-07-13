import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "./class-names";

export type PanelProps = {
  as?: "article" | "div" | "section";
  children: ReactNode;
  tone?: "default" | "muted";
} & HTMLAttributes<HTMLElement>;

export function Panel({ as: Component = "div", children, className, tone = "default", ...props }: PanelProps) {
  return (
    <Component
      {...props}
      className={classNames(
        "rounded-qv-lg border p-qv-5",
        tone === "muted" ? "border-qv-border bg-qv-surface-muted" : "border-qv-border bg-qv-surface",
        className,
      )}
    >
      {children}
    </Component>
  );
}
