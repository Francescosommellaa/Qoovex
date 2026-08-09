"use client"

import * as React from "react"
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "#lib/utils"
import {
  useSlidingIndicatorState,
  SlidingIndicatorProvider,
  SlidingIndicator,
  useSlidingIndicator,
  type SlidingIndicatorContextValue,
} from "#components/sliding-indicator"

/* ─── Toggle ──────────────────────────────────────────────────────────────── */

const toggleVariants = cva(
  "group/toggle relative z-10 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-transparent font-medium outline-none select-none transition-all duration-200 ease-out focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/30 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-transparent text-muted-foreground hover:text-foreground data-pressed:bg-accent data-pressed:text-foreground data-pressed:shadow-2xs",
        outline:
          "border-input bg-transparent text-muted-foreground shadow-2xs hover:text-foreground data-pressed:border-ring/50 data-pressed:bg-accent data-pressed:text-foreground dark:bg-input/30 dark:hover:bg-input/50",
        solid:
          "bg-transparent text-muted-foreground hover:text-foreground data-pressed:bg-primary data-pressed:text-primary-foreground data-pressed:shadow-2xs",
      },
      size: {
        sm: "h-7 px-2 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        default: "h-8 px-3 text-sm",
        lg: "h-9.5 px-4 text-base",
        icon: "size-8",
        "icon-sm": "size-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ToggleProps
  extends TogglePrimitive.Props,
    VariantProps<typeof toggleVariants> {
  className?: string
}

function Toggle({
  className,
  variant = "default",
  size = "default",
  onMouseEnter: onMouseEnterProp,
  onFocus: onFocusProp,
  ...props
}: ToggleProps) {
  const slidingCtx = useSlidingIndicator()

  const handleMouseEnter = React.useCallback(
    (event: any) => {
      onMouseEnterProp?.(event)
      slidingCtx?.moveIndicator(event.currentTarget)
    },
    [onMouseEnterProp, slidingCtx]
  )

  const handleFocus = React.useCallback(
    (event: any) => {
      onFocusProp?.(event)
      slidingCtx?.moveIndicator(event.currentTarget)
    },
    [onFocusProp, slidingCtx]
  )

  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size }), className)}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
      {...props}
    />
  )
}

/* ─── ToggleGroup ──────────────────────────────────────────────────────────── */

export interface ToggleGroupProps
  extends ToggleGroupPrimitive.Props {
  className?: string
  variant?: VariantProps<typeof toggleVariants>["variant"]
  size?: VariantProps<typeof toggleVariants>["size"]
}

function ToggleGroup({
  className,
  variant,
  size,
  children,
  onMouseLeave: onMouseLeaveProp,
  onBlur: onBlurProp,
  ...props
}: ToggleGroupProps) {
  const {
    containerRef,
    indicator,
    moveIndicator,
    clearIndicator,
    handleMouseLeave,
    handleBlur,
  } = useSlidingIndicatorState()

  const slidingCtxValue = React.useMemo<SlidingIndicatorContextValue>(
    () => ({
      indicator,
      moveIndicator,
      clearIndicator,
      containerRef,
    }),
    [indicator, moveIndicator, clearIndicator, containerRef]
  )

  return (
    <SlidingIndicatorProvider value={slidingCtxValue}>
      <ToggleGroupPrimitive
        ref={containerRef as React.RefObject<HTMLDivElement>}
        data-slot="toggle-group"
        className={cn(
          "relative inline-flex items-center gap-0.5 rounded-lg",
          className
        )}
        onMouseLeave={(e) => {
          onMouseLeaveProp?.(e)
          handleMouseLeave()
        }}
        onBlur={(e) => {
          onBlurProp?.(e)
          handleBlur(e)
        }}
        {...props}
      >
        <SlidingIndicator rounded="lg" />
        {React.Children.map(children, (child) => {
          if (React.isValidElement<ToggleProps>(child)) {
            return React.cloneElement(child, {
              variant: child.props.variant ?? variant,
              size: child.props.size ?? size,
            } as Partial<ToggleProps>)
          }
          return child
        })}
      </ToggleGroupPrimitive>
    </SlidingIndicatorProvider>
  )
}

export { Toggle, ToggleGroup, toggleVariants }
