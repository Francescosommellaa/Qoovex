"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

// ─── Base ────────────────────────────────────────────────────────

const BASE =
  "relative inline-flex items-center justify-center select-none cursor-pointer " +
  "rounded-md border border-transparent " +
  "transition-[color,background-color,border-color,box-shadow,transform,opacity] " +
  "duration-[120ms] ease-[cubic-bezier(0.16,1,0.3,1)] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary " +
  "disabled:opacity-40 disabled:pointer-events-none" +
  "active:scale-[0.97]";

// ─── Variants ────────────────────────────────────────────────────

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-text-inverse font-medium " +
    "shadow-[inset_0_1px_0_oklch(1_0_0/0.18),0_1px_3px_oklch(0_0_0/0.45)] " +
    "hover:bg-primary-hover " +
    "hover:shadow-[inset_0_1px_0_oklch(1_0_0/0.12),0_2px_10px_oklch(0_0_0/0.55)] " +
    "active:bg-primary-active " +
    "active:shadow-[inset_0_2px_4px_oklch(0_0_0/0.3)]",

  secondary:
    "bg-surface-offset text-text font-medium border border-border " +
    "shadow-[0_1px_2px_oklch(0_0_0/0.3)] " +
    "hover:bg-surface-dynamic hover:border-border " +
    "active:bg-surface-dynamic active:shadow-none",

  ghost:
    "bg-transparent text-text-muted font-medium " +
    "hover:bg-surface-offset hover:text-text " +
    "active:bg-surface-dynamic active:text-text",

  destructive:
    "bg-error text-text-inverse font-medium " +
    "shadow-[inset_0_1px_0_oklch(1_0_0/0.12),0_1px_3px_oklch(0_0_0/0.45)] " +
    "hover:bg-error-hover " +
    "hover:shadow-[inset_0_1px_0_oklch(1_0_0/0.08),0_2px_10px_oklch(0_0_0/0.55)] " +
    "active:bg-error-active " +
    "active:shadow-[inset_0_2px_4px_oklch(0_0_0/0.3)]",
};

// ─── Sizes ───────────────────────────────────────────────────────

const SIZES: Record<ButtonSize, string> = {
  sm: "h-7 px-3 gap-1.5 text-xs tracking-[0.025em]",
  md: "h-9 px-4 gap-2 text-sm",
  lg: "h-11 px-5 gap-2.5 text-base",
};

const ICON_SIZE: Record<ButtonSize, number> = {
  sm: 11,
  md: 13,
  lg: 15,
};

// ─── Component ───────────────────────────────────────────────────

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref,
  ) {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={[BASE, VARIANTS[variant], SIZES[size], className]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Loader2
              size={ICON_SIZE[size]}
              strokeWidth={2}
              className="animate-spin"
              aria-hidden="true"
            />
          </span>
        )}
        <span className={loading ? "invisible" : undefined}>{children}</span>
      </button>
    );
  },
);
