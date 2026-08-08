"use client"

import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "#lib/utils"

/* ─── RadioGroup ──────────────────────────────────────────────────────────── */

function RadioGroup({
  className,
  ...props
}: RadioGroupPrimitive.Props & { className?: string }) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("flex flex-col gap-3", className)}
      {...props}
    />
  )
}

/* ─── Radio ───────────────────────────────────────────────────────────────── */

const radioVariants = cva(
  "peer relative flex shrink-0 items-center justify-center rounded-full border outline-none transition-[border-color,background-color,box-shadow] duration-150 ease-out after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-90 disabled:cursor-not-allowed disabled:opacity-50 group-has-disabled/field:opacity-50",
  {
    variants: {
      size: {
        sm: "size-3.5",
        default: "size-4",
        lg: "size-5",
      },
      color: {
        primary:
          "border-input hover:border-ring/60 dark:bg-input/30 data-checked:border-primary data-checked:bg-primary data-checked:shadow-2xs",
        success:
          "border-input hover:border-success/60 dark:bg-input/30 data-checked:border-success data-checked:bg-success data-checked:shadow-2xs",
        destructive:
          "border-input hover:border-destructive/60 dark:bg-input/30 data-checked:border-destructive data-checked:bg-destructive data-checked:shadow-2xs",
      },
    },
    defaultVariants: {
      size: "default",
      color: "primary",
    },
  }
)

const dotSizeStyles = {
  sm: "size-1.5",
  default: "size-2",
  lg: "size-2.5",
}

export interface RadioProps
  extends RadioPrimitive.Root.Props,
    VariantProps<typeof radioVariants> {}

function Radio({
  className,
  size = "default",
  color = "primary",
  ...props
}: RadioProps) {
  return (
    <RadioPrimitive.Root
      data-slot="radio"
      className={cn(radioVariants({ size, color }), className)}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-indicator"
        className={cn(
          "rounded-full bg-primary-foreground transition-transform duration-100 ease-out",
          "data-unchecked:scale-0 data-checked:scale-100",
          dotSizeStyles[size ?? "default"]
        )}
      />
    </RadioPrimitive.Root>
  )
}

/* ─── RadioCard ────────────────────────────────────────────────────────────── */

function RadioCard({
  className,
  children,
  ...props
}: RadioPrimitive.Root.Props & { className?: string }) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-card"
      className={cn(
        "group/card relative flex cursor-pointer items-start gap-3 rounded-lg border border-input bg-transparent p-3.5 outline-none transition-all duration-200 ease-out",
        "shadow-2xs dark:bg-input/30",
        "hover:border-ring/40 hover:bg-accent/30",
        "focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/30",
        "active:scale-[0.98]",
        "data-checked:border-primary/60 data-checked:bg-primary/5 data-checked:shadow-sm dark:data-checked:bg-primary/10",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <div className="flex size-4 shrink-0 items-center justify-center rounded-full border border-input transition-[border-color,background-color] duration-150 group-data-checked/card:border-primary group-data-checked/card:bg-primary dark:bg-input/30">
        <RadioPrimitive.Indicator
          className="size-2 rounded-full bg-primary-foreground transition-transform duration-100 ease-out data-unchecked:scale-0 data-checked:scale-100"
        />
      </div>
      <div className="flex-1 text-sm">{children}</div>
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, Radio, RadioCard, radioVariants }
