import type { ComponentPropsWithRef } from "react";

import { mergeClassNames } from "./merge-class-names";

export type SkeletonProps = ComponentPropsWithRef<"div"> & {
  height?: string | number;
  width?: string | number;
};

export function Skeleton({
  className,
  height,
  style,
  width,
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={mergeClassNames("qv-skeleton", className)}
      style={{ height, width, ...style }}
      {...props}
    />
  );
}
