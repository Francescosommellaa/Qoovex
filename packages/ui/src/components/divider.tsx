"use client";

import * as React from "react";
import { cn } from "../lib/utils";

export type DividerOrientation = "horizontal" | "vertical";
export type DividerVariant = "solid" | "strong";
export type DividerTone = "neutral" | "primary" | "success" | "warning" | "error";
export type DividerSpacing = "none" | "sm" | "md" | "lg";

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
  tone?: DividerTone;
  spacing?: DividerSpacing;
  decorative?: boolean;
  children?: React.ReactNode;
}

const ORIENTATIONS: Record<DividerOrientation, string> = {
  horizontal: "qv-divider--horizontal",
  vertical: "qv-divider--vertical",
};

const VARIANTS: Record<DividerVariant, string> = {
  solid: "qv-divider--solid",
  strong: "qv-divider--strong",
};

const TONES: Record<DividerTone, string> = {
  neutral: "qv-divider--tone-neutral",
  primary: "qv-divider--tone-primary",
  success: "qv-divider--tone-success",
  warning: "qv-divider--tone-warning",
  error: "qv-divider--tone-error",
};

const SPACING: Record<DividerSpacing, string> = {
  none: "qv-divider--spacing-none",
  sm: "qv-divider--spacing-sm",
  md: "qv-divider--spacing-md",
  lg: "qv-divider--spacing-lg",
};

export const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  function Divider(
    {
      orientation = "horizontal",
      variant = "solid",
      tone = "neutral",
      spacing = "md",
      decorative,
      children,
      className,
      role,
      ...props
    },
    ref,
  ) {
    const hasContent = Boolean(children);
    const isDecorative = decorative ?? !hasContent;

    return (
      <div
        ref={ref}
        role={isDecorative ? undefined : (role ?? "separator")}
        aria-hidden={isDecorative || undefined}
        aria-orientation={!isDecorative ? orientation : undefined}
        className={cn(
          "qv-divider",
          ORIENTATIONS[orientation],
          VARIANTS[variant],
          TONES[tone],
          SPACING[spacing],
          hasContent && "qv-divider--with-content",
          className,
        )}
        {...props}
      >
        {hasContent ? (
          <span className="qv-divider__content">{children}</span>
        ) : null}
      </div>
    );
  },
);

Divider.displayName = "Divider";
