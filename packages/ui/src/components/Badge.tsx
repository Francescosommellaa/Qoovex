import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "./class-names";

export type BadgeVariant = "neutral" | "info" | "positive" | "warning" | "danger";

export type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
} & HTMLAttributes<HTMLSpanElement>;

const variantClassNames: Record<BadgeVariant, string> = {
  neutral: "border-qv-border bg-qv-surface-muted text-qv-content-muted",
  info: "border-qv-info/25 bg-qv-info-soft text-qv-info",
  positive: "border-qv-positive/25 bg-qv-positive-soft text-qv-positive",
  warning: "border-qv-warning/25 bg-qv-warning-soft text-qv-warning",
  danger: "border-qv-danger/25 bg-qv-danger-soft text-qv-danger",
};

export function Badge({ children, className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      {...props}
      className={classNames(
        "qv-badge inline-flex min-h-7 items-center rounded-qv-pill border px-qv-3 text-sm font-semibold whitespace-nowrap",
        variantClassNames[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
