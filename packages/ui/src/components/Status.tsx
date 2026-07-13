import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "./class-names";

export type StatusTone = "neutral" | "info" | "positive" | "warning" | "danger";
export type StatusProps = { children: ReactNode; tone?: StatusTone } & HTMLAttributes<HTMLSpanElement>;

const toneClassNames: Record<StatusTone, string> = {
  neutral: "text-qv-content-muted",
  info: "text-qv-info",
  positive: "text-qv-positive",
  warning: "text-qv-warning",
  danger: "text-qv-danger",
};

export function Status({ children, className, tone = "neutral", ...props }: StatusProps) {
  return (
    <span {...props} className={classNames("inline-flex items-center gap-qv-2 text-sm font-medium", toneClassNames[tone], className)}>
      <span aria-hidden="true" className="size-qv-2 rounded-qv-pill bg-current" />
      {children}
    </span>
  );
}
