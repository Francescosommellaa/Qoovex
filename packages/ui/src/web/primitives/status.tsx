import type { HTMLAttributes, ReactNode, Ref } from "react";

import { cx } from "./utils";

export type StatusTone = "neutral" | "accent" | "success" | "warning" | "danger" | "info";
export type StatusSize = "sm" | "md";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>;
  tone?: StatusTone;
  size?: StatusSize;
}

export function Badge({ ref, tone = "neutral", size = "md", className, ...props }: BadgeProps) {
  return <span ref={ref} className={cx("qv-badge", className)} data-tone={tone} data-size={size} {...props} />;
}

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>;
  tone?: StatusTone;
  size?: StatusSize;
  icon?: ReactNode;
}

export function Tag({ ref, tone = "neutral", size = "md", icon, children, className, ...props }: TagProps) {
  return <span ref={ref} className={cx("qv-tag", className)} data-tone={tone} data-size={size} {...props}>{icon ? <span className="qv-tag__icon" aria-hidden="true">{icon}</span> : null}{children}</span>;
}
