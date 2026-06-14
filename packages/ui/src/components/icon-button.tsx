import type { ComponentPropsWithRef } from "react";

import { mergeClassNames } from "./merge-class-names";

export type IconButtonProps = ComponentPropsWithRef<"button"> & {
  "aria-label": string;
  variant?: "secondary" | "tertiary" | "destructive";
};

export function IconButton({
  className,
  type = "button",
  variant = "secondary",
  ...props
}: IconButtonProps) {
  return (
    <button
      className={mergeClassNames("qv-icon-button", className)}
      data-variant={variant}
      type={type}
      {...props}
    />
  );
}
