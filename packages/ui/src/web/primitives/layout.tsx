import type { ComponentPropsWithRef, ElementType } from "react";

import { cx } from "./utils";

export type Space = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "8" | "10" | "12";
export type Align = "start" | "center" | "end" | "stretch" | "baseline";
export type Justify = "start" | "center" | "end" | "between";
type LayoutElement = "div" | "main" | "section" | "ul" | "ol";

interface ContainerOwnProps<T extends "div" | "main"> { as?: T; size?: "page" | "reading" | "full" }
export type ContainerProps<T extends "div" | "main" = "div"> = ContainerOwnProps<T> & Omit<ComponentPropsWithRef<T>, keyof ContainerOwnProps<T>>;
export function Container<T extends "div" | "main" = "div">({ as, size = "page", className, ...props }: ContainerProps<T>) {
  const Component = (as ?? "div") as ElementType;
  return <Component className={cx("qv-container", className)} data-size={size} {...props} />;
}

interface SectionOwnProps<T extends "section" | "div"> { as?: T; spacing?: "sm" | "md" | "lg" }
export type SectionProps<T extends "section" | "div" = "section"> = SectionOwnProps<T> & Omit<ComponentPropsWithRef<T>, keyof SectionOwnProps<T>>;
export function Section<T extends "section" | "div" = "section">({ as, spacing = "md", className, ...props }: SectionProps<T>) {
  const Component = (as ?? "section") as ElementType;
  return <Component className={cx("qv-section", className)} data-spacing={spacing} {...props} />;
}

interface StackOwnProps<T extends LayoutElement> {
  as?: T;
  gap?: Space;
  direction?: "row" | "column";
  tabletDirection?: "row" | "column";
  desktopDirection?: "row" | "column";
  align?: Align;
  justify?: Justify;
  wrap?: boolean;
}
export type StackProps<T extends LayoutElement = "div"> = StackOwnProps<T> & Omit<ComponentPropsWithRef<T>, keyof StackOwnProps<T>>;
export function Stack<T extends LayoutElement = "div">({ as, gap = "4", direction = "column", tabletDirection, desktopDirection, align = "stretch", justify = "start", wrap = false, className, ...props }: StackProps<T>) {
  const Component = (as ?? "div") as ElementType;
  return <Component className={cx("qv-stack", className)} data-gap={gap} data-direction={direction} data-tablet-direction={tabletDirection} data-desktop-direction={desktopDirection} data-align={align} data-justify={justify} data-wrap={wrap || undefined} {...props} />;
}

interface GridOwnProps<T extends LayoutElement> {
  as?: T;
  gap?: Space;
  columns?: 1 | 2 | 3 | 4;
  tabletColumns?: 1 | 2 | 3 | 4;
  desktopColumns?: 1 | 2 | 3 | 4;
  align?: Align;
}
export type GridProps<T extends LayoutElement = "div"> = GridOwnProps<T> & Omit<ComponentPropsWithRef<T>, keyof GridOwnProps<T>>;
export function Grid<T extends LayoutElement = "div">({ as, gap = "4", columns = 1, tabletColumns, desktopColumns, align = "stretch", className, ...props }: GridProps<T>) {
  const Component = (as ?? "div") as ElementType;
  return <Component className={cx("qv-grid", className)} data-gap={gap} data-columns={columns} data-tablet-columns={tabletColumns} data-desktop-columns={desktopColumns} data-align={align} {...props} />;
}
