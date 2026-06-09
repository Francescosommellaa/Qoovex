import type * as React from "react";
import type { QvTextVariantProps } from "../../../config/variants";

export interface TextProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color">,
    Omit<QvTextVariantProps, "role"> {
  as?: "p" | "span" | "strong" | "small" | "label" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  textStyle?: NonNullable<QvTextVariantProps["role"]>;
}
