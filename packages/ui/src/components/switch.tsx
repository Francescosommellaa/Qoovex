"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "#lib/utils"

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
  sm: "size-3 data-checked:translate-x-[calc(100%-2px)] data-unchecked:translate-x-0",
  default:
    "size-4 data-checked:translate-x-[calc(100%-2px)] data-unchecked:translate-x-0",
  lg: "size-5 data-checked:translate-x-[calc(100%-2px)] data-unchecked:translate-x-0",
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
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(switchVariants({ size, color }), className)}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-background ring-0 transition-[transform,background-color] [transition-duration:var(--motion-duration-state)] [transition-timing-function:var(--ease-standard)] motion-reduce:transition-none",
          "data-checked:scale-110 data-unchecked:scale-100",
          "dark:data-checked:bg-primary-foreground dark:data-unchecked:bg-foreground",
          thumbSizeStyles[size ?? "default"]
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch, switchVariants }
