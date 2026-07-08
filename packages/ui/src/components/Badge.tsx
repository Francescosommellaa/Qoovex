import type { HTMLAttributes, ReactNode } from "react";

export type BadgeVariant = "neutral" | "present" | "missing" | "expired" | "review" | "ready" | "attention";

export type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
} & HTMLAttributes<HTMLSpanElement>;

function classNames(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(" ");
}

export function Badge({ children, className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span {...props} className={classNames("qv-badge", `qv-badge--${variant}`, className)}>
      {children}
    </span>
  );
}
