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
  /** Icona statica a sinistra del testo */
  iconLeft?: React.ReactNode;
  /** Icona statica a destra del testo */
  iconRight?: React.ReactNode;
  /** Apple swap: from esce a sinistra, to entra da destra. Non usare con iconLeft/iconRight. */
  iconSwap?: { from: React.ReactNode; to: React.ReactNode };
  children: React.ReactNode;
}

// ─── Base ────────────────────────────────────────────────────────

const BASE =
  "group relative inline-flex items-center justify-center select-none cursor-pointer " +
  "rounded-full font-medium whitespace-nowrap tracking-[0.012em] overflow-hidden " +
  "transition-[color,border-color,box-shadow,opacity] " +
  "duration-[var(--duration-base)] ease-[var(--ease-qoovex)] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary " +
  "disabled:opacity-35 disabled:pointer-events-none disabled:saturate-50";

// ─── Variants ────────────────────────────────────────────────────

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-surface-offset text-text border border-primary/40 " +
    "shadow-[var(--shadow-btn-resting)] " +
    "hover:text-[oklch(0.97_0_0)] hover:border-transparent " +
    "hover:shadow-[var(--shadow-btn-hover)] " +
    "active:shadow-[var(--shadow-btn-active)]",

  secondary:
    "bg-surface-offset text-text border border-border " +
    "shadow-[var(--shadow-btn-resting)] " +
    "hover:shadow-[var(--shadow-btn-hover)] " +
    "active:shadow-[var(--shadow-btn-active)]",

  ghost:
    "bg-transparent text-text-muted border border-transparent " +
    "hover:text-text active:opacity-70",

  destructive:
    "bg-surface-offset text-text border border-error/40 " +
    "shadow-[var(--shadow-btn-resting)] " +
    "hover:text-[oklch(0.97_0_0)] hover:border-transparent " +
    "hover:shadow-[var(--shadow-btn-hover)] " +
    "active:shadow-[var(--shadow-btn-active)]",
};

// ─── Fill ─────────────────────────────────────────────────────────

const FILL_BASE =
  "absolute inset-0 rounded-[inherit] scale-x-0 origin-left pointer-events-none " +
  "transition-transform duration-[var(--duration-slow)] ease-[var(--ease-qoovex)] " +
  "group-hover:scale-x-100";

const FILLS: Record<ButtonVariant, string> = {
  primary: FILL_BASE + " bg-primary",
  secondary: FILL_BASE + " bg-[var(--color-btn-fill-secondary)]",
  ghost: FILL_BASE + " bg-[var(--color-btn-fill-ghost)]",
  destructive: FILL_BASE + " bg-error",
};

// ─── Sizes ────────────────────────────────────────────────────────

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9  px-6   gap-2   text-[length:var(--text-xs)]",
  md: "h-10 px-6   gap-2   text-[length:var(--text-sm)]",
  lg: "h-12 px-8   gap-2.5 text-[length:var(--text-base)]",
};

const SPINNER_SIZES: Record<ButtonSize, number> = {
  sm: 12,
  md: 14,
  lg: 16,
};

// ─── Swap ─────────────────────────────────────────────────────────

const SWAP_SHIFT: Record<ButtonSize, string> = {
  sm: "group-hover:-translate-x-[calc(12px+var(--spacing-2))]",
  md: "group-hover:-translate-x-[calc(14px+var(--spacing-2))]",
  lg: "group-hover:-translate-x-[calc(16px+var(--spacing-2))]",
};

const SWAP_GAP: Record<ButtonSize, string> = {
  sm: "var(--spacing-2)",
  md: "var(--spacing-2)",
  lg: "var(--spacing-2)",
};

// ─── Component ───────────────────────────────────────────────────

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      iconLeft,
      iconRight,
      iconSwap,
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
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        className={[BASE, VARIANTS[variant], SIZES[size], className]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {/* Fill layer */}
        <span className={FILLS[variant]} aria-hidden="true" />

        {/* Spinner */}
        {loading && (
          <span className="absolute inset-0 z-20 flex items-center justify-center rounded-[inherit]">
            <Loader2
              size={SPINNER_SIZES[size]}
              strokeWidth={2}
              className="animate-spin opacity-60"
              aria-hidden="true"
            />
          </span>
        )}

        {iconSwap ? (
          // ── Swap mode ─────────────────────────────────────────────
          <span
            className={[
              "relative z-10 inline-flex items-center gap-[inherit]",
              "transition-transform duration-[var(--duration-base)] ease-[var(--ease-qoovex)]",
              SWAP_SHIFT[size],
              loading ? "invisible" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {/* from — nel flusso, opacity out all'hover */}
            <span
              className={
                "inline-flex items-center shrink-0 " +
                "transition-opacity duration-[var(--duration-base)] ease-[var(--ease-qoovex)] " +
                "opacity-100 group-hover:opacity-0"
              }
              aria-hidden="true"
            >
              {iconSwap.from}
            </span>

            {children}

            {/* to — absolute fuori frame, opacity in all'hover */}
            <span
              className={
                "absolute top-1/2 -translate-y-1/2 inline-flex items-center shrink-0 " +
                "transition-opacity duration-[var(--duration-base)] ease-[var(--ease-qoovex)] " +
                "opacity-0 group-hover:opacity-100"
              }
              style={{ left: `calc(100% + ${SWAP_GAP[size]})` }}
              aria-hidden="true"
            >
              {iconSwap.to}
            </span>
          </span>
        ) : (
          // ── Modalità normale con iconLeft / iconRight opzionali ───
          <span
            className={[
              "relative z-10 inline-flex items-center justify-center gap-[inherit]",
              loading ? "invisible" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {iconLeft && (
              <span
                className="inline-flex items-center shrink-0"
                aria-hidden="true"
              >
                {iconLeft}
              </span>
            )}

            {children}

            {iconRight && (
              <span
                className="inline-flex items-center shrink-0"
                aria-hidden="true"
              >
                {iconRight}
              </span>
            )}
          </span>
        )}
      </button>
    );
  },
);
