"use client"

import * as React from "react"
import { OTPField } from "@base-ui/react/otp-field"
import { cn } from "#lib/utils"

export interface OtpInputProps
  extends Omit<OTPField.Root.Props, "autoSubmit" | "children" | "length" | "mask"> {
  autoFocus?: boolean
  className?: string
  inputClassName?: string
  length?: number
}

function OtpInput({
  autoFocus = false,
  className,
  inputClassName,
  length = 6,
  style,
  ...props
}: OtpInputProps) {
  return (
    <OTPField.Root
      className={cn("qv-otp-field", className)}
      data-slot="otp-input"
      length={length}
      {...props}
      style={{ ...style, "--qv-otp-length": length } as React.CSSProperties}
    >
      {Array.from({ length }, (_, index) => (
        <OTPField.Input
          autoFocus={autoFocus && index === 0}
          className={cn("qv-otp-slot", inputClassName)}
          key={index}
        />
      ))}
    </OTPField.Root>
  )
}

export { OtpInput }
