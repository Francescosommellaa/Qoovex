import * as React from "react";
import { qvBoxVariants } from "../../../config/variants";
import { cn } from "../../lib/utils";
import type { BoxProps } from "./Box.types";

export const Box = React.forwardRef<HTMLElement, BoxProps>(function Box(
  {
    as: Component = "div",
    surface,
    radius,
    padding,
    border,
    shadow,
    className,
    ...props
  },
  ref,
) {
  const Element = Component as React.ElementType;

  return (
    <Element
      ref={ref as never}
      className={cn(qvBoxVariants({ surface, radius, padding, border, shadow }), className)}
      {...props}
    />
  );
});

Box.displayName = "Box";
