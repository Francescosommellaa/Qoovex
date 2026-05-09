import type * as React from "react";
import type { QvSpacing } from "../../../config/variants";

export type StackDirection = "row" | "column";
export type StackAlign = "start" | "center" | "end" | "stretch";
export type StackJustify = "start" | "center" | "end" | "between";

export interface StackProps extends React.HTMLAttributes<HTMLElement> {
  as?: "div" | "section" | "main" | "header" | "footer" | "article" | "aside" | "nav" | "ul" | "li";
  direction?: StackDirection;
  gap?: QvSpacing;
  align?: StackAlign;
  justify?: StackJustify;
  wrap?: boolean;
}
