"use client";

import * as React from "react";
import { Warning } from "@phosphor-icons/react";
import { cn } from "../../lib/utils";

export type FieldControlStatus = "default" | "error" | "success";

export const FIELD_LABEL_CLASS =
  "text-(length:--text-xs) font-medium text-(--color-label) tracking-[0.03em] uppercase select-none";

export const FIELD_ROOT_CLASS = "flex w-full flex-col gap-(--input-gap)";

export const FIELD_STATUS_RING: Record<FieldControlStatus, string> = {
  default:
    "border-(--color-input-border) " +
    "focus-within:border-(--color-input-border-focus) " +
    "focus-within:ring-2 focus-within:ring-(--color-primary-highlight)",
  error:
    "border-(--color-input-border-error) " +
    "ring-2 ring-(--color-error-highlight)",
  success:
    "border-(--color-input-border-success) " +
    "ring-2 ring-(--color-success-highlight)",
};

export const FIELD_TRIGGER_STATUS_RING: Record<FieldControlStatus, string> = {
  default:
    "border-(--color-input-border) " +
    "data-[open=true]:border-(--color-input-border-focus) " +
    "data-[open=true]:ring-2 data-[open=true]:ring-(--color-primary-highlight)",
  error:
    "border-(--color-input-border-error) " +
    "ring-2 ring-(--color-error-highlight)",
  success:
    "border-(--color-input-border-success) " +
    "ring-2 ring-(--color-success-highlight)",
};

export const FIELD_HELPER_STATUS: Record<FieldControlStatus, string> = {
  default: "text-(--color-input-helper)",
  error: "text-(--color-input-helper-error)",
  success: "text-(--color-input-helper-success)",
};

export interface FieldLabelProps {
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
  id?: string;
  srOnly?: boolean;
}

export function FieldLabel({
  children,
  className,
  htmlFor,
  id,
  srOnly = false,
}: FieldLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      id={id}
      className={cn(FIELD_LABEL_CLASS, srOnly && "sr-only", className)}
    >
      {children}
    </label>
  );
}

export interface FieldHelperTextProps {
  children: React.ReactNode;
  className?: string;
  hideWhenHoverTooltip?: boolean;
  id?: string;
  live?: "off" | "polite" | "assertive";
  role?: React.AriaRole;
  status?: FieldControlStatus;
}

export function FieldHelperText({
  children,
  className,
  hideWhenHoverTooltip = false,
  id,
  live,
  role,
  status = "default",
}: FieldHelperTextProps) {
  return (
    <p
      id={id}
      role={role}
      aria-live={live}
      className={cn(
        "text-(length:--text-xs)",
        FIELD_HELPER_STATUS[status],
        hideWhenHoverTooltip && "[@media(hover:hover)]:hidden",
        className,
      )}
    >
      {children}
    </p>
  );
}

export interface FieldErrorTooltipProps {
  message: string;
  tooltipId?: string;
}

export function FieldErrorTooltip({
  message,
  tooltipId,
}: FieldErrorTooltipProps) {
  return (
    <>
      <span
        className={[
          "relative group/tooltip",
          "inline-flex items-center shrink-0 cursor-default",
          "[@media(hover:none)]:hidden",
        ].join(" ")}
        role="img"
        aria-hidden="true"
      >
        <Warning
          size={14}
          className="text-(--color-error)"
          aria-hidden="true"
        />

        <span
          role="tooltip"
          id={tooltipId}
          className={[
            "absolute bottom-[calc(100%+var(--spacing-2))] right-0",
            "z-[var(--z-dropdown)]",
            "w-max max-w-[220px]",
            "px-(--spacing-3) py-(--spacing-2)",
            "rounded-(--radius-md)",
            "bg-(--color-tooltip-bg) border border-(--color-tooltip-border)",
            "text-(length:--text-xs) text-(--color-tooltip-text)",
            "shadow-[var(--shadow-md)]",
            "pointer-events-none select-none",
            "opacity-0 translate-y-1",
            "group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0",
            "transition-[opacity,transform] duration-[var(--duration-base)] ease-[var(--ease-qoovex)]",
            "after:content-[''] after:absolute after:top-full after:right-3",
            "after:border-4 after:border-transparent",
            "after:border-t-(--color-tooltip-bg)",
          ].join(" ")}
        >
          {message}
        </span>
      </span>

      <span
        className={[
          "inline-flex items-center shrink-0",
          "[@media(hover:hover)]:hidden",
        ].join(" ")}
        aria-hidden="true"
      >
        <Warning size={14} className="text-(--color-error)" />
      </span>
    </>
  );
}
