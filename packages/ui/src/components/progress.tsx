"use client";

import { Progress as ProgressPrimitive } from "radix-ui";
import type { ComponentPropsWithoutRef } from "react";

import { mergeClassNames } from "./merge-class-names";

export type ProgressProps = ComponentPropsWithoutRef<
  typeof ProgressPrimitive.Root
> & {
  label: string;
  value: number;
};

export function Progress({
  className,
  label,
  max = 100,
  value,
  ...props
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="qv-progress-group">
      <div className="qv-progress-label">
        <span>{label}</span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <ProgressPrimitive.Root
        aria-label={label}
        className={mergeClassNames("qv-progress", className)}
        max={max}
        value={value}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className="qv-progress__indicator"
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </ProgressPrimitive.Root>
    </div>
  );
}
