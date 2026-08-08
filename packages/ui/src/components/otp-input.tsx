"use client"

import * as React from "react"
import { OTPField } from "@base-ui/react/otp-field"

import { cn } from "#lib/utils"

function OtpInput({
  autoFocus = false,
  className,
  inputClassName,
  length = 6,
  ...props
}: Omit<OTPField.Root.Props, "autoFocus" | "children" | "length"> & {
  autoFocus?: boolean
  className?: string
  inputClassName?: string
  length?: number
}) {
  return (
    <OTPField.Root
      className={cn("flex w-full min-w-0 max-w-full items-center gap-1.5 overflow-hidden", className)}
      data-slot="otp-input"
      length={length}
      {...props}
    >
      {Array.from({ length }, (_, index) => (
        <OTPField.Input
          aria-label={index === 0 ? undefined : `${index + 1} / ${length}`}
          autoFocus={autoFocus && index === 0}
          className={cn(
            "h-11 w-0 min-w-0 flex-1 rounded-lg border border-input bg-transparent text-center font-accent text-base font-medium tabular-nums outline-none ring-inset transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-muted-foreground focus-visible:z-10 focus-visible:border-ring/60 focus-visible:bg-accent/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/25 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 data-filled:bg-muted/50 dark:bg-input/30 dark:data-filled:bg-input/50",
            inputClassName,
          )}
          key={index}
        />
      ))}
    </OTPField.Root>
  )
}

export { OtpInput }
