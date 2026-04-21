"use client";

import * as React from "react";
import { cn } from "../lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CardVariant =
  | "flat"
  | "elevated"
  | "outlined"
  | "ghost"
  | "tinted"
  | "interactive";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  /** Rimuove il padding dal body — usare con CardMedia o layout custom */
  noPadding?: boolean;
  /** Callback solo per variante interactive */
  onCardClick?: () => void;
}

// ─── Slot: Header ─────────────────────────────────────────────────────────────

export function CardHeader({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("card__header", className)} {...props}>
      {children}
    </div>
  );
}

CardHeader.displayName = "CardHeader";

// ─── Slot: Body ───────────────────────────────────────────────────────────────

export function CardBody({
  children,
  className,
  noPadding = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { noPadding?: boolean }) {
  return (
    <div
      className={cn(
        "card__body",
        noPadding && "card__body--no-padding",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

CardBody.displayName = "CardBody";

// ─── Slot: Footer ─────────────────────────────────────────────────────────────

export function CardFooter({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("card__footer", className)} {...props}>
      {children}
    </div>
  );
}

CardFooter.displayName = "CardFooter";

// ─── Slot: Media ──────────────────────────────────────────────────────────────

export function CardMedia({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("card__media", className)} {...props}>
      {children}
    </div>
  );
}

CardMedia.displayName = "CardMedia";

// ─── Static maps ──────────────────────────────────────────────────────────────

const VARIANTS: Record<CardVariant, string> = {
  flat: "card--flat",
  elevated: "card--elevated",
  outlined: "card--outlined",
  ghost: "card--ghost",
  tinted: "card--tinted",
  interactive: "card--interactive",
};

// ─── Card ─────────────────────────────────────────────────────────────────────

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    variant = "flat",
    noPadding = false,
    children,
    onCardClick,
    className,
    ...props
  },
  ref,
) {
  const isInteractive = variant === "interactive";

  const resolvedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === CardBody) {
      return React.cloneElement(
        child as React.ReactElement<{ noPadding?: boolean }>,
        {
          noPadding:
            (child.props as { noPadding?: boolean }).noPadding ?? noPadding,
        },
      );
    }
    return child;
  });

  if (isInteractive) {
    return (
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        onClick={onCardClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onCardClick?.();
          }
        }}
        className={cn("card", VARIANTS[variant], className)}
        {...props}
      >
        {resolvedChildren}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn("card", VARIANTS[variant], className)}
      {...props}
    >
      {resolvedChildren}
    </div>
  );
});

Card.displayName = "Card";
