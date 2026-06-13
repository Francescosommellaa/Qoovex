import type { ComponentPropsWithRef } from "react";

import { mergeClassNames } from "./merge-class-names";

export type BadgeVariant =
  | "neutral"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type BadgeProps = ComponentPropsWithRef<"span"> & {
  variant?: BadgeVariant;
};

export function Badge({
  className,
  variant = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={mergeClassNames("qv-badge", className)}
      data-variant={variant}
      {...props}
    />
  );
}
