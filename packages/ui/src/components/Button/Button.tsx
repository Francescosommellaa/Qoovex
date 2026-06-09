"use client";

import * as React from "react";
import { CircleNotch } from "@phosphor-icons/react";
import { cn } from "../../lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "destructive"
  | "inverse";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

interface ButtonOwnProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Shown beside the spinner while loading. */
  loadingLabel?: React.ReactNode;
  /** Destructive actions require a second click by default. */
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

const BASE =
  "group relative inline-flex cursor-pointer select-none items-center justify-center " +
  "overflow-hidden whitespace-nowrap rounded-(--radius-md) border font-medium tracking-(--tracking-body) " +
  "transition-[width,transform,color,background-color,border-color,box-shadow,opacity] " +
  "duration-[var(--button-duration)] ease-[var(--button-ease)] " +
  "hover:no-underline active:translate-y-px " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--button-focus) " +
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-[var(--button-disabled-opacity)]";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "border-(--button-primary-border) bg-(--button-primary-bg) text-(--button-primary-text) " +
    "shadow-[var(--button-primary-shadow)] hover:border-(--button-primary-border-hover) " +
    "hover:bg-(--button-primary-bg-hover) hover:shadow-[var(--button-primary-shadow-hover)] " +
    "active:bg-(--button-primary-bg-active) active:shadow-[var(--button-primary-shadow-active)]",
  secondary:
    "border-(--button-secondary-border) bg-(--button-secondary-bg) text-(--button-secondary-text) " +
    "shadow-[var(--button-secondary-shadow)] hover:border-(--button-secondary-border-hover) " +
    "hover:bg-(--button-secondary-bg-hover) hover:shadow-[var(--button-secondary-shadow-hover)] " +
    "active:bg-(--button-secondary-bg-active) active:shadow-[var(--button-secondary-shadow-active)]",
  ghost:
    "border-transparent bg-transparent text-(--button-ghost-text) shadow-none " +
    "hover:bg-(--button-ghost-bg-hover) active:bg-(--button-ghost-bg-active)",
  destructive:
    "border-(--button-destructive-border) bg-(--button-destructive-bg) text-(--button-destructive-text) " +
    "shadow-[var(--button-destructive-shadow)] hover:border-(--button-destructive-border-hover) " +
    "hover:bg-(--button-destructive-bg-hover) hover:shadow-[var(--button-destructive-shadow-hover)] " +
    "active:bg-(--button-destructive-bg-active) active:shadow-[var(--button-destructive-shadow-active)]",
  inverse:
    "border-(--button-inverse-border) bg-(--button-inverse-bg) text-(--button-inverse-text) " +
    "shadow-[var(--button-inverse-shadow)] hover:border-(--button-inverse-border-hover) " +
    "hover:bg-(--button-inverse-bg-hover) hover:shadow-[var(--button-inverse-shadow-hover)] " +
    "active:bg-(--button-inverse-bg-active) active:shadow-[var(--button-inverse-shadow-active)]",
};

const SIZES: Record<ButtonSize, string> = {
  xs: "h-8 gap-1.5 px-3 text-(length:--text-caption)",
  sm: "h-[2.625rem] gap-2 px-4 text-(length:--text-body-sm)",
  md: "h-11 gap-2 px-5 text-(length:--text-body-sm)",
  lg: "h-12 gap-2.5 px-5 text-(length:--text-body)",
};

const ICON_ONLY_SIZES: Record<ButtonSize, string> = {
  xs: "w-8 gap-0 px-0",
  sm: "w-[2.625rem] gap-0 px-0",
  md: "w-11 gap-0 px-0",
  lg: "w-12 gap-0 px-0",
};

const DESTRUCTIVE_CONFIRM_SIZES: Record<ButtonSize, string> = {
  xs: "w-[6rem] px-3",
  sm: "w-[6.75rem] px-4",
  md: "w-[7.25rem] px-4",
  lg: "w-[8rem] px-5",
};

const SPINNER_SIZES: Record<ButtonSize, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
};

const ICON_SWAP_SHIFT: Record<ButtonSize, string> = {
  xs: "group-hover:-translate-x-[calc(12px+var(--spacing-1))]",
  sm: "group-hover:-translate-x-[calc(14px+var(--spacing-2))]",
  md: "group-hover:-translate-x-[calc(16px+var(--spacing-2))]",
  lg: "group-hover:-translate-x-[calc(18px+var(--spacing-2))]",
};

const ICON_SWAP_GAP: Record<ButtonSize, string> = {
  xs: "var(--spacing-1-5, 0.375rem)",
  sm: "var(--spacing-2)",
  md: "var(--spacing-2)",
  lg: "var(--spacing-2)",
};

const SWAP_TRANSITION =
  "transform var(--button-duration) var(--button-ease), opacity var(--button-duration) var(--button-ease)";

function SwapLabelContent({
  swapLabel,
  swapActive,
}: {
  swapLabel: { idle: React.ReactNode; active: React.ReactNode };
  swapActive: boolean;
}) {
  return (
    <span className="relative inline-flex items-center overflow-hidden">
      <span
        aria-hidden="true"
        className="pointer-events-none invisible flex max-h-[1.5em] flex-col items-start overflow-hidden"
      >
        <span className="whitespace-nowrap">{swapLabel.idle}</span>
        <span className="whitespace-nowrap">{swapLabel.active}</span>
      </span>

      <span
        aria-hidden={swapActive || undefined}
        className="absolute inset-0 flex items-center justify-center whitespace-nowrap"
        style={{
          transform: swapActive ? "translateX(-110%)" : "translateX(0)",
          opacity: swapActive ? 0 : 1,
          transition: SWAP_TRANSITION,
        }}
      >
        {swapLabel.idle}
      </span>

      <span
        aria-hidden={!swapActive || undefined}
        className="absolute inset-0 flex items-center justify-center whitespace-nowrap"
        style={{
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

export const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(function Button(
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
  const [destructiveConfirming, setDestructiveConfirming] =
    React.useState(false);
  const isDisabled = disabled || loading;
  const isAnchor = as === "a";
  const shouldConfirmDestructive =
    variant === "destructive" && destructiveConfirm;
  const destructiveConfirmActive =
    shouldConfirmDestructive && destructiveConfirming && !isDisabled;
  const destructiveStartsAsIconOnly =
    shouldConfirmDestructive &&
    !destructiveConfirmActive &&
    !loading &&
    Boolean(iconLeft || iconRight);
  const isIconOnly =
    destructiveStartsAsIconOnly ||
    (!children && !swapLabel && !iconSwap && Boolean(iconLeft || iconRight));

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
    (onClick as React.MouseEventHandler<HTMLAnchorElement> | undefined)?.(
      event,
    );
  }

  function handleButtonClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    if (confirmDestructiveAction(event)) return;
    (onClick as React.MouseEventHandler<HTMLButtonElement> | undefined)?.(
      event,
    );
  }

  const content = (
    <>
      {loading ? (
        <span
          className={cn(
            "absolute inset-0 z-20 flex items-center justify-center rounded-[inherit]",
            loadingLabel && "gap-2 px-3",
          )}
          aria-live="polite"
        >
          <CircleNotch
            size={SPINNER_SIZES[size]}
            className="shrink-0 animate-spin"
            aria-hidden="true"
          />
          {loadingLabel ? (
            <span className="truncate font-medium">{loadingLabel}</span>
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
          <SwapLabelContent swapLabel={swapLabel} swapActive={swapActive} />
        </span>
      ) : iconSwap ? (
        <span
          className={cn(
            "relative z-10 inline-flex items-center gap-[inherit] transition-transform",
            "duration-[var(--button-duration)] ease-[var(--button-ease)]",
            ICON_SWAP_SHIFT[size],
            loading && "invisible",
          )}
        >
          <span
            className="inline-flex shrink-0 items-center opacity-100 transition-opacity group-hover:opacity-0"
            aria-hidden="true"
          >
            {iconSwap.from}
          </span>

          {children}

          <span
            className="absolute top-1/2 inline-flex -translate-y-1/2 shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100"
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
            <span className="inline-flex shrink-0 items-center" aria-hidden="true">
              {iconLeft}
            </span>
          ) : null}

          {destructiveStartsAsIconOnly && children ? (
            <span className="sr-only">{children}</span>
          ) : (
            children
          )}

          {iconRight ? (
            <span className="inline-flex shrink-0 items-center" aria-hidden="true">
              {iconRight}
            </span>
          ) : null}
        </span>
      )}
    </>
  );

  const sharedClassName = cn(
    BASE,
    VARIANTS[variant],
    SIZES[size],
    isIconOnly && ICON_ONLY_SIZES[size],
    destructiveConfirmActive && DESTRUCTIVE_CONFIRM_SIZES[size],
    isDisabled && isAnchor && "pointer-events-none cursor-not-allowed opacity-[var(--button-disabled-opacity)]",
    className,
  );

  const buttonElement = isAnchor ? (
    <a
      ref={ref as React.Ref<HTMLAnchorElement>}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      tabIndex={isDisabled ? -1 : (props as AnchorButtonProps).tabIndex}
      data-confirming={destructiveConfirmActive || undefined}
      data-icon-only={isIconOnly || undefined}
      className={sharedClassName}
      onClick={handleAnchorClick}
      {...(props as Omit<
        AnchorButtonProps,
        keyof ButtonOwnProps | "as" | "disabled" | "onClick"
      >)}
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
      data-icon-only={isIconOnly || undefined}
      className={sharedClassName}
      onClick={handleButtonClick}
      {...(props as Omit<
        NativeButtonProps,
        keyof ButtonOwnProps | "as" | "onClick"
      >)}
    >
      {content}
    </button>
  );

  if (!caption) return buttonElement;

  const captionElement = (
    <span className="select-none text-center text-(length:--text-xs) leading-snug text-(--color-text-faint)">
      {caption}
    </span>
  );

  return (
    <span className="inline-flex flex-col items-center gap-1">
      {captionPosition === "top" && captionElement}
      {buttonElement}
      {captionPosition === "bottom" && captionElement}
    </span>
  );
});

Button.displayName = "Button";
