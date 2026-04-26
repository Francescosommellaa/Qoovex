"use client";

import * as React from "react";
import { CircleNotch } from "@phosphor-icons/react";
import { cn } from "../lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  iconSwap?: { from: React.ReactNode; to: React.ReactNode };
  swapLabel?: { idle: React.ReactNode; active: React.ReactNode };
  swapActive?: boolean;
  caption?: React.ReactNode;
  captionPosition?: "top" | "bottom";
  children?: React.ReactNode;
}

// ─── Static style maps ────────────────────────────────────────────────────────

const BASE =
  "group relative inline-flex items-center justify-center select-none cursor-pointer " +
  "rounded-full font-medium whitespace-nowrap tracking-[0.012em] overflow-hidden " +
  "transition-[color,border-color,box-shadow,opacity] " +
  "duration-[var(--duration-base)] ease-[var(--ease-qoovex)] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary " +
  "disabled:opacity-[var(--button-disabled-opacity)] disabled:pointer-events-none disabled:saturate-50";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-surface-offset text-text border border-primary/40 " +
    "shadow-[var(--shadow-btn-resting)] " +
    "hover:text-(--color-btn-filled-text) hover:border-transparent " +
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
    "hover:text-(--color-btn-filled-text) hover:border-transparent " +
    "hover:shadow-[var(--shadow-btn-hover)] " +
    "active:shadow-[var(--shadow-btn-active)]",
};

const FILL_BASE =
  "absolute inset-0 rounded-[inherit] scale-x-0 origin-left pointer-events-none " +
  "transition-transform duration-[var(--duration-slow)] ease-[var(--ease-qoovex)] " +
  "group-hover:scale-x-100";

const FILLS: Record<ButtonVariant, string> = {
  primary: FILL_BASE + " bg-primary",
  secondary: FILL_BASE + " bg-(--color-btn-fill-secondary)",
  ghost: FILL_BASE + " bg-(--color-btn-fill-ghost)",
  destructive: FILL_BASE + " bg-error",
};

const SIZES: Record<ButtonSize, string> = {
  xs: "h-8  px-4   gap-1.5 text-(length:--text-xs)",
  sm: "h-9  px-6   gap-2   text-(length:--text-xs)",
  md: "h-10 px-6   gap-2   text-(length:--text-sm)",
  lg: "h-12 px-8   gap-2.5 text-(length:--text-base)",
};

const SPINNER_SIZES: Record<ButtonSize, number> = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
};

const ICON_SWAP_SHIFT: Record<ButtonSize, string> = {
  xs: "group-hover:-translate-x-[calc(10px+var(--spacing-1))]",
  sm: "group-hover:-translate-x-[calc(12px+var(--spacing-2))]",
  md: "group-hover:-translate-x-[calc(14px+var(--spacing-2))]",
  lg: "group-hover:-translate-x-[calc(16px+var(--spacing-2))]",
};

const ICON_SWAP_GAP: Record<ButtonSize, string> = {
  xs: "var(--spacing-1.5)",
  sm: "var(--spacing-2)",
  md: "var(--spacing-2)",
  lg: "var(--spacing-2)",
};

const SWAP_TRANSITION =
  "transform var(--duration-base) var(--ease-qoovex), opacity var(--duration-base) var(--ease-qoovex)";

// ─── SwapLabel ────────────────────────────────────────────────────────────────
function SwapLabelContent({
  swapLabel,
  swapActive,
  invisible,
}: {
  swapLabel: { idle: React.ReactNode; active: React.ReactNode };
  swapActive: boolean;
  invisible: boolean;
}) {
  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        overflow: "hidden",
        alignItems: "center",
        visibility: invisible ? "hidden" : undefined,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          visibility: "hidden",
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          overflow: "hidden",
          maxHeight: "1.5em",
        }}
      >
        <span style={{ whiteSpace: "nowrap" }}>{swapLabel.idle}</span>
        <span style={{ whiteSpace: "nowrap" }}>{swapLabel.active}</span>
      </span>

      <span
        aria-hidden={swapActive || undefined}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          whiteSpace: "nowrap",
          transform: swapActive ? "translateX(-110%)" : "translateX(0)",
          opacity: swapActive ? 0 : 1,
          transition: SWAP_TRANSITION,
        }}
      >
        {swapLabel.idle}
      </span>

      {/* Active label — slides in from the right when swapActive. */}
      <span
        aria-hidden={!swapActive || undefined}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          whiteSpace: "nowrap",
          transform: swapActive ? "translateX(0)" : "translateX(110%)",
          opacity: swapActive ? 1 : 0,
          transition: SWAP_TRANSITION,
        }}
      >
        {swapLabel.active}
      </span>
    </span>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
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
      swapLabel,
      swapActive = false,
      caption,
      captionPosition = "bottom",
      className = "",
      children,
      ...props
    },
    ref,
  ) {
    const isDisabled = disabled || loading;

    const buttonEl = (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
        {...props}
      >
        <span className={FILLS[variant]} aria-hidden="true" />

        {loading ? (
          <span className="absolute inset-0 z-20 flex items-center justify-center rounded-[inherit]">
            <CircleNotch
              size={SPINNER_SIZES[size]}
              className="animate-spin opacity-60"
              aria-hidden="true"
            />
          </span>
        ) : null}

        {swapLabel ? (
          <span
            className={cn(
              "relative z-10 inline-flex items-center",
              loading && "invisible",
            )}
          >
            <SwapLabelContent
              swapLabel={swapLabel}
              swapActive={swapActive}
              invisible={false}
            />
          </span>
        ) : iconSwap ? (
          <span
            className={cn(
              "relative z-10 inline-flex items-center gap-[inherit]",
              "transition-transform duration-[var(--duration-base)] ease-[var(--ease-qoovex)]",
              ICON_SWAP_SHIFT[size],
              loading && "invisible",
            )}
          >
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

            <span
              className={
                "absolute top-1/2 -translate-y-1/2 inline-flex items-center shrink-0 " +
                "transition-opacity duration-[var(--duration-base)] ease-[var(--ease-qoovex)] " +
                "opacity-0 group-hover:opacity-100"
              }
              style={{ left: `calc(100% + ${ICON_SWAP_GAP[size]})` }}
              aria-hidden="true"
            >
              {iconSwap.to}
            </span>
          </span>
        ) : (
          <span
            className={cn(
              "relative z-10 inline-flex items-center justify-center gap-[inherit]",
              loading && "invisible",
            )}
          >
            {iconLeft ? (
              <span
                className="inline-flex items-center shrink-0"
                aria-hidden="true"
              >
                {iconLeft}
              </span>
            ) : null}

            {children}

            {iconRight ? (
              <span
                className="inline-flex items-center shrink-0"
                aria-hidden="true"
              >
                {iconRight}
              </span>
            ) : null}
          </span>
        )}
      </button>
    );

    if (caption) {
      const captionEl = (
        <span className="select-none text-center text-(length:--text-xs) leading-snug text-(--color-text-faint)">
          {caption}
        </span>
      );
      return (
        <span className="inline-flex flex-col items-center gap-1">
          {captionPosition === "top" && captionEl}
          {buttonEl}
          {captionPosition === "bottom" && captionEl}
        </span>
      );
    }

    return buttonEl;
  },
);

Button.displayName = "Button";
