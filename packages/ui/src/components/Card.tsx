import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "./class-names";

export type CardTone = "default" | "muted" | "info" | "warning";

export type CardProps = {
  as?: "article" | "div" | "section";
  children: ReactNode;
  tone?: CardTone;
} & HTMLAttributes<HTMLElement>;

const toneClassNames: Record<CardTone, string> = {
  default: "border-qv-border bg-qv-surface",
  muted: "border-qv-border bg-qv-surface-muted",
  info: "border-qv-info/20 bg-qv-info-soft",
  warning: "border-qv-warning/20 bg-qv-warning-soft",
};

export function Card({ as: Component = "div", children, className, tone = "default", ...props }: CardProps) {
  return (
    <Component {...props} className={classNames("qv-card rounded-qv-lg border p-qv-5 shadow-qv-sm", toneClassNames[tone], className)}>
      {children}
    </Component>
  );
}
