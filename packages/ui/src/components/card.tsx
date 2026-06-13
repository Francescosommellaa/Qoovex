import type { ComponentPropsWithRef } from "react";

import { mergeClassNames } from "./merge-class-names";

export type CardVariant =
  | "default"
  | "elevated"
  | "glass"
  | "glass-strong"
  | "inverse";

export type CardProps = ComponentPropsWithRef<"article"> & {
  variant?: CardVariant;
};

export function Card({
  className,
  variant = "default",
  ...props
}: CardProps) {
  const glassClassName =
    variant === "glass"
      ? "qv-glass-medium"
      : variant === "glass-strong"
        ? "qv-glass-strong"
        : undefined;

  return (
    <article
      className={mergeClassNames("qv-card", glassClassName, className)}
      data-variant={variant}
      {...props}
    />
  );
}
