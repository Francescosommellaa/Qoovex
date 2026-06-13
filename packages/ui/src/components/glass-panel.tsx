import type { ComponentPropsWithRef } from "react";

import { mergeClassNames } from "./merge-class-names";

export type GlassPanelVariant =
  | "subtle"
  | "soft"
  | "medium"
  | "strong"
  | "deep";

export type GlassPanelProps = ComponentPropsWithRef<"div"> & {
  variant?: GlassPanelVariant;
};

export function GlassPanel({
  className,
  variant = "soft",
  ...props
}: GlassPanelProps) {
  return (
    <div
      className={mergeClassNames(
        "qv-glass-panel",
        `qv-glass-${variant}`,
        className,
      )}
      data-variant={variant}
      {...props}
    />
  );
}
