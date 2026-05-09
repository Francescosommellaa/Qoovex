import type * as React from "react";
import type { QvBoxVariantProps, QvRadius, QvSpacing, QvSurface } from "../../../config/variants";

export type BoxElement =
  | "div"
  | "section"
  | "main"
  | "header"
  | "footer"
  | "article"
  | "aside"
  | "nav";

export interface BoxProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color">,
    QvBoxVariantProps {
  as?: BoxElement;
  padding?: QvSpacing;
  radius?: QvRadius;
  surface?: QvSurface;
}
