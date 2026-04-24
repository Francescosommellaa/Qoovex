"use client";

import * as React from "react";
import { cn } from "../lib/utils";

export type CardVariant =
  | "surface"
  | "panel"
  | "bento"
  | "quiet";
export type CardTone = "neutral" | "primary" | "success" | "warning" | "error";
export type CardPadding = "none" | "sm" | "md" | "lg";
export type CardSpan = "auto" | "wide" | "tall" | "featured";
export type CardMediaRatio = "auto" | "wide" | "square" | "portrait";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  tone?: CardTone;
  padding?: CardPadding;
  span?: CardSpan;
  interactive?: boolean;
  onCardClick?: () => void;
}

export interface CardSlotProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
}

export interface CardBodyProps extends CardSlotProps {
  noPadding?: boolean;
}

export interface CardMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: CardMediaRatio;
}

type CardStyle = React.CSSProperties & {
  "--card-slot-padding"?: string;
};

const VARIANTS: Record<CardVariant, string> = {
  surface: "qv-card--surface",
  panel: "qv-card--panel",
  bento: "qv-card--bento",
  quiet: "qv-card--quiet",
};

const TONES: Record<CardTone, string> = {
  neutral: "qv-card--tone-neutral",
  primary: "qv-card--tone-primary",
  success: "qv-card--tone-success",
  warning: "qv-card--tone-warning",
  error: "qv-card--tone-error",
};

const CARD_PADDING_VALUES: Record<CardPadding, string> = {
  none: "0px",
  sm: "var(--card-padding-sm)",
  md: "var(--card-padding-md)",
  lg: "var(--card-padding-lg)",
};

const SLOT_PADDING: Record<CardPadding, string> = {
  none: "qv-card__slot--padding-none",
  sm: "qv-card__slot--padding-sm",
  md: "qv-card__slot--padding-md",
  lg: "qv-card__slot--padding-lg",
};

const SPANS: Record<CardSpan, string> = {
  auto: "",
  wide: "qv-card--span-wide",
  tall: "qv-card--span-tall",
  featured: "qv-card--span-featured",
};

const MEDIA_RATIOS: Record<CardMediaRatio, string> = {
  auto: "",
  wide: "qv-card__media--wide",
  square: "qv-card__media--square",
  portrait: "qv-card__media--portrait",
};

function getSlotPaddingClass(padding?: CardPadding) {
  return padding ? SLOT_PADDING[padding] : undefined;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardSlotProps>(
  function CardHeader({ children, className, padding, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          "qv-card__slot qv-card__header",
          getSlotPaddingClass(padding),
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

CardHeader.displayName = "CardHeader";

export const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  function CardBody(
    { children, className, padding, noPadding = false, ...props },
    ref,
  ) {
    const resolvedPadding = noPadding ? "none" : padding;

    return (
      <div
        ref={ref}
        className={cn(
          "qv-card__slot qv-card__body",
          getSlotPaddingClass(resolvedPadding),
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

CardBody.displayName = "CardBody";

export const CardFooter = React.forwardRef<HTMLDivElement, CardSlotProps>(
  function CardFooter({ children, className, padding, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          "qv-card__slot qv-card__footer",
          getSlotPaddingClass(padding),
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

CardFooter.displayName = "CardFooter";

export const CardMedia = React.forwardRef<HTMLDivElement, CardMediaProps>(
  function CardMedia({ children, className, ratio = "auto", ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn("qv-card__media", MEDIA_RATIOS[ratio], className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

CardMedia.displayName = "CardMedia";

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    variant = "surface",
    tone = "neutral",
    padding = "md",
    span = "auto",
    interactive = false,
    children,
    onCardClick,
    onClick,
    onKeyDown,
    role,
    tabIndex,
    style,
    className,
    ...props
  },
  ref,
) {
  const hasCardAction = typeof onCardClick === "function";
  const isInteractive = interactive || hasCardAction;
  const cardStyle: CardStyle = {
    "--card-slot-padding": CARD_PADDING_VALUES[padding],
    ...style,
  };

  function handleClick(event: React.MouseEvent<HTMLDivElement>) {
    onClick?.(event);
    if (!event.defaultPrevented) {
      onCardClick?.();
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);

    if (event.defaultPrevented || !hasCardAction) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onCardClick();
    }
  }

  return (
    <div
      ref={ref}
      role={hasCardAction ? (role ?? "button") : role}
      tabIndex={hasCardAction ? (tabIndex ?? 0) : tabIndex}
      onClick={onClick || hasCardAction ? handleClick : undefined}
      onKeyDown={onKeyDown || hasCardAction ? handleKeyDown : undefined}
      style={cardStyle}
      className={cn(
        "qv-card",
        VARIANTS[variant],
        TONES[tone],
        SPANS[span],
        isInteractive && "qv-card--interactive",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";
