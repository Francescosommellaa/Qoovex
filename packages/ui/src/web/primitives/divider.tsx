import type { HTMLAttributes, Ref } from "react";

import { cx } from "./utils";

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  orientation?: "horizontal" | "vertical";
  tone?: "subtle" | "default" | "strong";
}

export function Divider({ ref, orientation = "horizontal", tone = "default", className, ...props }: DividerProps) {
  return <div ref={ref} role="separator" aria-orientation={orientation} className={cx("qv-divider", className)} data-orientation={orientation} data-tone={tone} {...props} />;
}
