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
  "relative inline-flex items-center justify-center font-medium select-none cursor-pointer " +
  "rounded-md border border-transparent " +
  "transition-[color,background-color,border-color,box-shadow,transform,opacity] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary " +
  "disabled:opacity-40 disabled:pointer-events-none " +
  "active:scale-[0.98]";

// ─── Variants ────────────────────────────────────────────────────

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-text-inverse " +
    "hover:bg-primary-hover active:bg-primary-active " +
    "shadow-sm hover:shadow-md",

  secondary:
    "bg-surface-offset text-text border border-border " +
    "hover:bg-surface-dynamic active:bg-surface-dynamic",

  ghost:
    "bg-transparent text-text-muted " +
    "hover:bg-surface-offset hover:text-text " +
    "active:bg-surface-dynamic",

  destructive:
    "bg-error text-text-inverse " +
    "hover:bg-error-hover active:bg-error-active " +
    "shadow-sm hover:shadow-md",
};

// ─── Sizes ───────────────────────────────────────────────────────

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 gap-1.5 text-xs",
  md: "h-10 px-4 gap-2 text-sm",
  lg: "h-12 px-5 gap-2 text-base",
};

const ICON_SIZE: Record<ButtonSize, number> = {
  sm: 12,
  md: 14,
  lg: 16,
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
