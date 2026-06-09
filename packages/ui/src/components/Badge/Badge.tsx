"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

export type BadgeVariant = "soft" | "outline" | "filled" | "announcement";
export type BadgeTone = "neutral" | "primary" | "success" | "warning" | "error";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  tone?: BadgeTone;
  size?: BadgeSize;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
}

const VARIANTS: Record<BadgeVariant, string> = {
  soft: "qv-badge--soft",
  outline: "qv-badge--outline",
  filled: "qv-badge--filled",
  announcement: "qv-badge--announcement",
};

const TONES: Record<BadgeTone, string> = {
  neutral: "qv-badge--tone-neutral",
  primary: "qv-badge--tone-primary",
  success: "qv-badge--tone-success",
  warning: "qv-badge--tone-warning",
  error: "qv-badge--tone-error",
};

const SIZES: Record<BadgeSize, string> = {
  sm: "qv-badge--sm",
  md: "qv-badge--md",
  lg: "qv-badge--lg",
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  function Badge(
    {
      variant = "soft",
      tone = "neutral",
      size = "md",
      iconLeft,
      iconRight,
      className,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <span
        ref={ref}
        className={cn(
          "qv-badge",
          VARIANTS[variant],
          TONES[tone],
          SIZES[size],
          className,
        )}
        {...props}
      >
        {iconLeft ? (
          <span className="qv-badge__icon" aria-hidden="true">
            {iconLeft}
          </span>
        ) : null}

        <span className="qv-badge__label">{children}</span>

        {iconRight ? (
          <span className="qv-badge__icon" aria-hidden="true">
            {iconRight}
          </span>
        ) : null}
      </span>
    );
  },
);

Badge.displayName = "Badge";
