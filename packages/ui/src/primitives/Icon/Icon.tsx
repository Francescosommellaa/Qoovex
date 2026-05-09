import * as React from "react";
import { cn } from "../../lib/utils";
import { toneTextClass } from "../../../config/variants";
import type { IconProps, IconSize } from "./Icon.types";

const iconSizes: Record<IconSize, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
};

export const Icon = React.forwardRef<HTMLSpanElement, IconProps>(function Icon(
  {
    icon: Glyph,
    size = "md",
    tone = "current",
    weight = "regular",
    label,
    className,
    ...props
  },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex shrink-0 items-center justify-center leading-none",
        tone === "current" ? "text-current" : toneTextClass[tone],
        className,
      )}
      aria-label={label}
      aria-hidden={label ? undefined : "true"}
      {...props}
    >
      <Glyph size={iconSizes[size]} weight={weight} aria-hidden="true" />
    </span>
  );
});

Icon.displayName = "Icon";

