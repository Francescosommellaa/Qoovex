"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "#lib/utils"
import { IconCheck, IconMinus } from "@tabler/icons-react"

const checkboxVariants = cva(
  "peer relative flex shrink-0 items-center justify-center outline-none transition-[border-color,background-color,box-shadow] duration-150 ease-out group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-90 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      size: {
        sm: "size-3.5 rounded-[3px] [&_svg]:size-3",
        default: "size-4 rounded-[4px] [&_svg]:size-3.5",
        lg: "size-5 rounded-[5px] [&_svg]:size-4",
      },
      color: {
        primary:
          "border border-input hover:border-ring/60 dark:bg-input/30 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground data-checked:shadow-2xs dark:data-checked:bg-primary data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground",
        success:
          "border border-input hover:border-success/60 dark:bg-input/30 data-checked:border-success data-checked:bg-success data-checked:text-success-foreground data-checked:shadow-2xs dark:data-checked:bg-success data-indeterminate:border-success data-indeterminate:bg-success data-indeterminate:text-success-foreground",
        destructive:
          "border border-input hover:border-destructive/60 dark:bg-input/30 data-checked:border-destructive data-checked:bg-destructive data-checked:text-destructive-foreground data-checked:shadow-2xs dark:data-checked:bg-destructive data-indeterminate:border-destructive data-indeterminate:bg-destructive data-indeterminate:text-destructive-foreground",
        warning:
          "border border-input hover:border-warning-emphasis/60 dark:bg-input/30 data-checked:border-warning-emphasis data-checked:bg-warning data-checked:text-warning-foreground data-checked:shadow-2xs dark:data-checked:bg-warning data-indeterminate:border-warning-emphasis data-indeterminate:bg-warning data-indeterminate:text-warning-foreground",
      },
    },
    defaultVariants: {
      size: "default",
      color: "primary",
    },
  }
)

export interface CheckboxProps
  extends CheckboxPrimitive.Root.Props,
    VariantProps<typeof checkboxVariants> {}

function Checkbox({
  className,
  size = "default",
  color = "primary",
  indeterminate,
  ...props
}: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      indeterminate={indeterminate}
      className={cn(checkboxVariants({ size, color }), className)}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        {indeterminate ? <IconMinus aria-hidden="true" /> : <IconCheck aria-hidden="true" />}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox, checkboxVariants }
