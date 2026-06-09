import * as React from "react";
import { qvTextVariants } from "../../../config/variants";
import { cn } from "../../lib/utils";
import type { TextProps } from "./Text.types";

export const Text = React.forwardRef<HTMLElement, TextProps>(function Text(
  {
    as: Component = "p",
    textStyle,
    size,
    tone,
    family,
    weight,
    leading,
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
        qvTextVariants({ role: textStyle, size, tone, family, weight, leading }),
        className,
      )}
      {...props}
    />
  );
});

Text.displayName = "Text";
