"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { cn } from "#lib/utils"

/* ─── Slider ──────────────────────────────────────────────────────────────── */

export interface SliderProps
  extends Omit<SliderPrimitive.Root.Props, "children"> {
  className?: string
  color?: "primary" | "success" | "destructive" | "warning"
  size?: "sm" | "default" | "lg"
  showTooltip?: boolean
  showValue?: boolean
}

const trackHeightStyles = {
  sm: "h-1",
  default: "h-1.5",
  lg: "h-2",
}

const thumbSizeStyles = {
  sm: "size-3",
  default: "size-4",
  lg: "size-5",
}

const colorStyles = {
  primary: {
    indicator: "bg-primary",
    thumb:
      "border-primary/80 focus-visible:border-primary focus-visible:ring-primary/50 hover:border-primary",
    tooltip: "bg-primary text-primary-foreground",
  },
  success: {
    indicator: "bg-success",
    thumb:
      "border-success/80 focus-visible:border-success focus-visible:ring-success/50 hover:border-success",
    tooltip: "bg-success text-success-foreground",
  },
  destructive: {
    indicator: "bg-destructive",
    thumb:
      "border-destructive/80 focus-visible:border-destructive focus-visible:ring-destructive/50 hover:border-destructive",
    tooltip: "bg-destructive text-destructive-foreground",
  },
  warning: {
    indicator: "bg-warning-emphasis",
    thumb:
      "border-warning-emphasis/80 focus-visible:border-warning-emphasis focus-visible:ring-warning-emphasis/50 hover:border-warning-emphasis",
    tooltip: "bg-warning text-warning-foreground",
  },
}

function Slider({
  className,
  color = "primary",
  size = "default",
  showTooltip = false,
  showValue = false,
  ...props
}: SliderProps) {
  const colors = colorStyles[color]

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn("relative flex w-full touch-none items-center py-2 select-none", className)}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "relative w-full grow overflow-hidden rounded-full bg-input/80 dark:bg-input/50 transition-colors duration-150",
          trackHeightStyles[size]
        )}
      >
        <SliderPrimitive.Indicator
          data-slot="slider-indicator"
          className={cn(
            "absolute h-full rounded-full transition-[width] duration-100 ease-out",
            colors.indicator
          )}
        />
      </SliderPrimitive.Track>

      <SliderPrimitive.Thumb
        data-slot="slider-thumb"
        className={cn(
          "group/thumb block rounded-full border-2 bg-background shadow-sm outline-none transition-all duration-150 ease-out",
          "hover:scale-110",
          "focus-visible:ring-3 focus-visible:scale-110",
          "active:scale-[0.92]",
          "disabled:pointer-events-none disabled:opacity-50",
          colors.thumb,
          thumbSizeStyles[size]
        )}
      >
        {showTooltip && (
          <span
            className={cn(
              "absolute -top-8 left-1/2 -translate-x-1/2 rounded-md px-1.5 py-0.5 text-[0.625rem] font-semibold font-accent leading-none opacity-0 transition-opacity duration-150 group-hover/thumb:opacity-100 group-focus-visible/thumb:opacity-100",
              colors.tooltip
            )}
          >
            <SliderPrimitive.Value />
          </span>
        )}
      </SliderPrimitive.Thumb>

      {showValue && (
        <span className="ml-3 min-w-[2ch] text-right text-xs font-semibold font-accent tabular-nums text-muted-foreground">
          <SliderPrimitive.Value />
        </span>
      )}
    </SliderPrimitive.Root>
  )
}

export { Slider }
