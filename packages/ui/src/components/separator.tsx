import type { ComponentPropsWithRef } from "react";

import { mergeClassNames } from "./merge-class-names";

export type SeparatorProps = ComponentPropsWithRef<"div"> & {
  orientation?: "horizontal" | "vertical";
};

export function Separator({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorProps) {
  return (
    <div
      aria-orientation={orientation}
      className={mergeClassNames("qv-separator", className)}
      data-orientation={orientation}
      role="separator"
      {...props}
    />
  );
}
