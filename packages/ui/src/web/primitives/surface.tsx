import type { ComponentPropsWithRef, ElementType } from "react";

import { cx } from "./utils";

export type SurfaceVariant = "default" | "subtle" | "elevated" | "glass";
export type SurfacePadding = "none" | "sm" | "md" | "lg";
export type SurfaceRadius = "none" | "sm" | "md" | "lg";
export type SurfaceElement = "div" | "section" | "article" | "aside";

interface SurfaceOwnProps<T extends SurfaceElement> {
  as?: T;
  variant?: SurfaceVariant;
  padding?: SurfacePadding;
  radius?: SurfaceRadius;
  interactive?: boolean;
  selected?: boolean;
}

export type SurfaceProps<T extends SurfaceElement = "div"> = SurfaceOwnProps<T> & Omit<ComponentPropsWithRef<T>, keyof SurfaceOwnProps<T>>;

export function Surface<T extends SurfaceElement = "div">({ as, variant = "default", padding = "none", radius = "md", interactive = false, selected = false, className, ...props }: SurfaceProps<T>) {
  const Component = (as ?? "div") as ElementType;
  return <Component className={cx("qv-surface", className)} data-variant={variant} data-padding={padding} data-radius={radius} data-interactive={interactive || undefined} data-selected={selected || undefined} {...props} />;
}

export type CardProps<T extends SurfaceElement = "article"> = SurfaceProps<T>;

export function Card<T extends SurfaceElement = "article">({ as, className, ...props }: CardProps<T>) {
  const surfaceProps = { ...props, as: (as ?? "article") as T, className: cx("qv-card", className) } as SurfaceProps<T>;
  return <Surface {...surfaceProps} />;
}
