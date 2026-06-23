import type { ComponentPropsWithRef, ElementType } from "react";

import { cx } from "./utils";

export type TextSize = "body-lg" | "body-md" | "body-sm" | "label" | "caption" | "data";
export type TextWeight = "regular" | "medium" | "semibold" | "bold";
export type TextTone = "default" | "muted" | "accent" | "danger" | "warning" | "success" | "info" | "inverse";
export type TextElement = "p" | "span" | "div" | "label" | "strong" | "em";

interface TextOwnProps<T extends TextElement> {
  as?: T;
  size?: TextSize;
  weight?: TextWeight;
  tone?: TextTone;
}

export type TextProps<T extends TextElement = "p"> = TextOwnProps<T> & Omit<ComponentPropsWithRef<T>, keyof TextOwnProps<T>>;

export function Text<T extends TextElement = "p">({ as, size = "body-md", weight = "regular", tone = "default", className, ...props }: TextProps<T>) {
  const Component = (as ?? "p") as ElementType;
  return <Component className={cx("qv-text", className)} data-size={size} data-weight={weight} data-tone={tone} {...props} />;
}

export type HeadingSize = "display-xl" | "display-lg" | "display-md" | "heading-xl" | "heading-lg" | "heading-md" | "heading-sm";
export type HeadingWeight = "medium" | "bold";
export type HeadingElement = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface HeadingOwnProps<T extends HeadingElement> {
  as?: T;
  size?: HeadingSize;
  weight?: HeadingWeight;
  tone?: TextTone;
  balance?: boolean;
}

export type HeadingProps<T extends HeadingElement = "h2"> = HeadingOwnProps<T> & Omit<ComponentPropsWithRef<T>, keyof HeadingOwnProps<T>>;

export function Heading<T extends HeadingElement = "h2">({ as, size = "heading-lg", weight = "medium", tone = "default", balance = false, className, ...props }: HeadingProps<T>) {
  const Component = (as ?? "h2") as ElementType;
  return <Component className={cx("qv-heading", className)} data-size={size} data-weight={weight} data-tone={tone} data-balance={balance || undefined} {...props} />;
}
