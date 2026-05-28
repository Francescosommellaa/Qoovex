"use client";

import * as React from "react";
import { CircleNotch } from "@phosphor-icons/react";
import { cn } from "../../lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

interface ButtonOwnProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** When `loading` is true, shown beside the spinner instead of hiding all label text. */
  loadingLabel?: React.ReactNode;
  /** Destructive buttons require a second click by default. Set to false only for non-mutating previews. */
  destructiveConfirm?: boolean;
  destructiveConfirmLabel?: React.ReactNode;
  destructiveConfirmTimeoutMs?: number;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  iconSwap?: { from: React.ReactNode; to: React.ReactNode };
  swapLabel?: { idle: React.ReactNode; active: React.ReactNode };
  swapActive?: boolean;
  caption?: React.ReactNode;
  captionPosition?: "top" | "bottom";
  children?: React.ReactNode;
}

type NativeButtonProps = ButtonOwnProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    as?: "button";
    href?: never;
  };

type AnchorButtonProps = ButtonOwnProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as: "a";
    href: string;
    disabled?: boolean;
    type?: never;
  };

export type ButtonProps = NativeButtonProps | AnchorButtonProps;

// ─── Static style maps ────────────────────────────────────────────────────────

const BASE =
  "group relative inline-flex items-center justify-center select-none cursor-pointer " +
  "rounded-full font-medium whitespace-nowrap tracking-[0.012em] overflow-hidden " +
  "transition-[width,color,background-color,border-color,box-shadow,opacity] " +
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

const DESTRUCTIVE_ICON_ONLY_SIZES: Record<ButtonSize, string> = {
  xs: "w-8 px-0 gap-0",
  sm: "w-9 px-0 gap-0",
  md: "w-10 px-0 gap-0",
  lg: "w-12 px-0 gap-0",
};

const DESTRUCTIVE_CONFIRM_SIZES: Record<ButtonSize, string> = {
  xs: "w-[6rem] px-3",
  sm: "w-[6.75rem] px-4",
  md: "w-[7.25rem] px-4",
  lg: "w-[8rem] px-5",
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
export const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(
    {
      as = "button",
      variant = "primary",
      size = "md",
      loading = false,
      loadingLabel,
      destructiveConfirm = true,
      destructiveConfirmLabel = "Conferma",
      destructiveConfirmTimeoutMs = 3000,
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
      onClick,
      ...props
    },
    ref,
  ) {
    const [destructiveConfirming, setDestructiveConfirming] = React.useState(false);
    const isDisabled = disabled || loading;
    const isAnchor = as === "a";
    const shouldConfirmDestructive = variant === "destructive" && destructiveConfirm;
    const destructiveConfirmActive = shouldConfirmDestructive && destructiveConfirming && !isDisabled;
    const destructiveStartsAsIconOnly =
      shouldConfirmDestructive && !destructiveConfirmActive && !loading && Boolean(iconLeft || iconRight);

    React.useEffect(() => {
      if (!destructiveConfirming) return;

      const timeout = window.setTimeout(
        () => setDestructiveConfirming(false),
        destructiveConfirmTimeoutMs,
      );
      return () => window.clearTimeout(timeout);
    }, [destructiveConfirmTimeoutMs, destructiveConfirming]);

    function confirmDestructiveAction(event: React.SyntheticEvent) {
      if (!shouldConfirmDestructive) return false;
      if (destructiveConfirmActive) {
        setDestructiveConfirming(false);
        return false;
      }

      event.preventDefault();
      setDestructiveConfirming(true);
      return true;
    }

    function handleAnchorClick(event: React.MouseEvent<HTMLAnchorElement>) {
      if (isDisabled) {
        event.preventDefault();
        return;
      }
      if (confirmDestructiveAction(event)) return;
      (onClick as React.MouseEventHandler<HTMLAnchorElement> | undefined)?.(event);
    }

    function handleButtonClick(event: React.MouseEvent<HTMLButtonElement>) {
      if (isDisabled) {
        event.preventDefault();
        return;
      }
      if (confirmDestructiveAction(event)) return;
      (onClick as React.MouseEventHandler<HTMLButtonElement> | undefined)?.(event);
    }

    const content = (
      <>
        <span className={FILLS[variant]} aria-hidden="true" />

        {loading ? (
          <span
            className={cn(
              "absolute inset-0 z-20 flex items-center justify-center rounded-[inherit]",
              loadingLabel ? "gap-2 px-3" : "",
            )}
            aria-live="polite"
          >
            <CircleNotch
              size={SPINNER_SIZES[size]}
              className="shrink-0 animate-spin opacity-60"
              aria-hidden="true"
            />
            {loadingLabel ? (
              <span className="truncate text-(length:--text-sm) font-medium">{loadingLabel}</span>
            ) : null}
          </span>
        ) : null}

        {destructiveConfirmActive ? (
          <span
            className={cn(
              "relative z-10 inline-flex items-center justify-center",
              loading && "invisible",
            )}
          >
            {destructiveConfirmLabel}
          </span>
        ) : swapLabel ? (
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

            {destructiveStartsAsIconOnly && children ? (
              <span className="sr-only">{children}</span>
            ) : (
              children
            )}

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
      </>
    );

    const buttonEl = isAnchor ? (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        tabIndex={isDisabled ? -1 : (props as AnchorButtonProps).tabIndex}
        data-confirming={destructiveConfirmActive || undefined}
        className={cn(
          BASE,
          VARIANTS[variant],
          SIZES[size],
          destructiveStartsAsIconOnly && DESTRUCTIVE_ICON_ONLY_SIZES[size],
          destructiveConfirmActive &&
            "border-transparent bg-(--color-error) text-(--color-btn-filled-text)",
          destructiveConfirmActive && DESTRUCTIVE_CONFIRM_SIZES[size],
          isDisabled && "pointer-events-none",
          className,
        )}
        onClick={handleAnchorClick}
        {...(props as Omit<AnchorButtonProps, keyof ButtonOwnProps | "as" | "disabled" | "onClick">)}
      >
        {content}
      </a>
    ) : (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        data-confirming={destructiveConfirmActive || undefined}
        className={cn(
          BASE,
          VARIANTS[variant],
          SIZES[size],
          destructiveStartsAsIconOnly && DESTRUCTIVE_ICON_ONLY_SIZES[size],
          destructiveConfirmActive &&
            "border-transparent bg-(--color-error) text-(--color-btn-filled-text)",
          destructiveConfirmActive && DESTRUCTIVE_CONFIRM_SIZES[size],
          className,
        )}
        onClick={handleButtonClick}
        {...(props as Omit<NativeButtonProps, keyof ButtonOwnProps | "as" | "onClick">)}
      >
        {content}
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
