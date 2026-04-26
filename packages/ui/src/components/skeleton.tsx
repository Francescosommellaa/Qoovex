"use client";

import * as React from "react";
import { cn } from "../lib/utils";

export type SkeletonVariant =
  | "text"
  | "title"
  | "block"
  | "thumbnail"
  | "avatar"
  | "circle";
export type SkeletonSize = "xs" | "sm" | "md" | "lg" | "xl";
export type SkeletonRadius = "none" | "sm" | "md" | "lg" | "full";
export type SkeletonTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "error";

type SkeletonDimension = React.CSSProperties["width"];
type SkeletonStyle = React.CSSProperties & {
  "--skeleton-width"?: SkeletonDimension;
  "--skeleton-height"?: SkeletonDimension;
  "--skeleton-line-width"?: SkeletonDimension;
};

export interface SkeletonProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  variant?: SkeletonVariant;
  size?: SkeletonSize;
  radius?: SkeletonRadius;
  tone?: SkeletonTone;
  animated?: boolean;
  lines?: number;
  lineWidths?: SkeletonDimension[];
  width?: SkeletonDimension;
  height?: React.CSSProperties["height"];
}

const VARIANTS: Record<SkeletonVariant, string> = {
  text: "qv-skeleton--text",
  title: "qv-skeleton--title",
  block: "qv-skeleton--block",
  thumbnail: "qv-skeleton--thumbnail",
  avatar: "qv-skeleton--avatar",
  circle: "qv-skeleton--circle",
};

const SIZES: Record<SkeletonSize, string> = {
  xs: "qv-skeleton--size-xs",
  sm: "qv-skeleton--size-sm",
  md: "qv-skeleton--size-md",
  lg: "qv-skeleton--size-lg",
  xl: "qv-skeleton--size-xl",
};

const RADII: Record<SkeletonRadius, string> = {
  none: "qv-skeleton--radius-none",
  sm: "qv-skeleton--radius-sm",
  md: "qv-skeleton--radius-md",
  lg: "qv-skeleton--radius-lg",
  full: "qv-skeleton--radius-full",
};

const TONES: Record<SkeletonTone, string> = {
  neutral: "qv-skeleton--tone-neutral",
  primary: "qv-skeleton--tone-primary",
  success: "qv-skeleton--tone-success",
  warning: "qv-skeleton--tone-warning",
  error: "qv-skeleton--tone-error",
};

function getSkeletonStyle({
  style,
  width,
  height,
}: {
  style?: React.CSSProperties;
  width?: SkeletonDimension;
  height?: React.CSSProperties["height"];
}) {
  const nextStyle: SkeletonStyle = { ...style };

  if (width !== undefined) {
    nextStyle["--skeleton-width"] = width;
  }

  if (height !== undefined) {
    nextStyle["--skeleton-height"] = height;
  }

  return nextStyle;
}

function getLineWidth(
  index: number,
  total: number,
  lineWidths?: SkeletonDimension[],
) {
  const width = lineWidths?.[index];
  if (width !== undefined) return width;
  if (index === total - 1) return "72%";
  return "100%";
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  function Skeleton(
    {
      variant = "block",
      size = "md",
      radius = "md",
      tone = "neutral",
      animated = true,
      lines = 1,
      lineWidths,
      width,
      height,
      className,
      style,
      "aria-hidden": ariaHidden,
      ...props
    },
    ref,
  ) {
    const lineCount = Math.max(1, Math.floor(lines));
    const isTextStack =
      lineCount > 1 && (variant === "text" || variant === "title");
    const resolvedStyle = getSkeletonStyle({ style, width, height });

    if (isTextStack) {
      const lineVariant = variant === "title" ? "title" : "text";

      return (
        <div
          ref={ref}
          className={cn("qv-skeleton-stack", SIZES[size], className)}
          style={resolvedStyle}
          aria-hidden={ariaHidden ?? true}
          {...props}
        >
          {Array.from({ length: lineCount }, (_, index) => {
            const lineStyle: SkeletonStyle = {
              "--skeleton-line-width": getLineWidth(
                index,
                lineCount,
                lineWidths,
              ),
            };

            return (
              <span
                key={index}
                className={cn(
                  "qv-skeleton",
                  VARIANTS[lineVariant],
                  SIZES[size],
                  RADII.full,
                  TONES[tone],
                )}
                style={lineStyle}
                data-animated={animated ? "true" : "false"}
                aria-hidden="true"
              />
            );
          })}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "qv-skeleton",
          VARIANTS[variant],
          SIZES[size],
          RADII[radius],
          TONES[tone],
          className,
        )}
        style={resolvedStyle}
        data-animated={animated ? "true" : "false"}
        aria-hidden={ariaHidden ?? true}
        {...props}
      />
    );
  },
);

Skeleton.displayName = "Skeleton";
