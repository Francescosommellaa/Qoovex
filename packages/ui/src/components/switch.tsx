"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, useReducedMotion, type Transition, type Variants } from "motion/react"
import type { ComponentProps } from "react"

import { cn } from "#lib/utils"

/**
 * Motion consumes seconds and Bezier arrays rather than CSS custom properties.
 * This component-local mapping mirrors the canonical CSS tokens in tokens.css.
 */
const switchMotion = {
  feedback: {
    duration: 0.16,
    ease: [0.2, 0, 0, 1],
  },
  state: {
    duration: 0.2,
    ease: [0.2, 0, 0, 1],
  },
} as const satisfies Record<"feedback" | "state", Transition>

function getThumbMotionVariants(reducedMotion: boolean): Variants {
  const transition: Transition = reducedMotion
    ? { duration: 0 }
    : switchMotion.state

  return {
    unchecked: {
      x: 0,
      scaleX: 1,
      scaleY: 1,
      transition,
    },
    checked: {
      x: "calc(100% - 2px)",
      scaleX: 1,
      scaleY: 1,
      transition,
    },
    pressed: reducedMotion
      ? {}
      : {
          scaleX: 1.055,
          scaleY: 0.965,
          transition: switchMotion.feedback,
        },
  }
}

const switchVariants = cva(
  "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent outline-none transition-[background-color] [transition-duration:var(--motion-duration-state)] [transition-timing-function:var(--ease-standard)] motion-reduce:transition-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-unchecked:bg-input dark:data-unchecked:bg-input/80",
  {
    variants: {
      size: {
        sm: "h-[14px] w-[24px]",
        default: "h-[18.4px] w-[32px]",
        lg: "h-[24px] w-[42px]",
      },
      color: {
        primary: "data-checked:bg-primary",
        success: "data-checked:bg-success",
        destructive: "data-checked:bg-destructive",
        warning: "data-checked:border-warning-emphasis data-checked:bg-warning",
      },
    },
    defaultVariants: {
      size: "default",
      color: "primary",
    },
  }
)

const thumbSizeStyles = {
  sm: "size-3",
  default: "size-4",
  lg: "size-5",
}

export interface SwitchProps
  extends SwitchPrimitive.Root.Props,
    VariantProps<typeof switchVariants> {}

function Switch({
  className,
  size = "default",
  color = "primary",
  ...props
}: SwitchProps) {
  const reducedMotion = useReducedMotion()
  const thumbMotionVariants = getThumbMotionVariants(Boolean(reducedMotion))

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(switchVariants({ size, color }), className)}
      {...props}
      render={(rootProps, state) => {
        const motionRootProps = rootProps as ComponentProps<typeof motion.span>

        return (
          <motion.span
            {...motionRootProps}
            animate={state.checked ? "checked" : "unchecked"}
            initial={false}
            whileTap={
              reducedMotion || state.disabled || state.readOnly ? undefined : "pressed"
            }
          />
        )
      }}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block origin-left rounded-full bg-background ring-0 data-checked:origin-right",
          "dark:data-checked:bg-primary-foreground dark:data-unchecked:bg-foreground",
          thumbSizeStyles[size ?? "default"]
        )}
        render={<motion.span variants={thumbMotionVariants} />}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch, switchVariants }
