import * as React from "react";
import { cn } from "../../lib/utils";
import { spacingClass } from "../../../config/variants";
import type { StackProps } from "./Stack.types";

const directionClass = {
  row: "flex-row",
  column: "flex-col",
} as const;

const alignClass = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
} as const;

const justifyClass = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
} as const;

export const Stack = React.forwardRef<HTMLElement, StackProps>(function Stack(
  {
    as: Component = "div",
    direction = "column",
    gap = "4",
    align = "stretch",
    justify = "start",
    wrap = false,
    className,
    ...props
  },
  ref,
) {
  const Element = Component as React.ElementType;

  return (
    <Element
      ref={ref as never}
      className={cn(
        "flex min-w-0",
        directionClass[direction],
        spacingClass[gap],
        alignClass[align],
        justifyClass[justify],
        wrap && "flex-wrap",
        className,
      )}
      {...props}
    />
  );
});

Stack.displayName = "Stack";
