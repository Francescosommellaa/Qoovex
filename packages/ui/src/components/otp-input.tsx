"use client"

import * as React from "react"
import { OTPField } from "@base-ui/react/otp-field"
import { cn } from "#lib/utils"
import { IconCheck, IconAlertCircle } from "@tabler/icons-react"

export interface OtpInputProps
  extends Omit<OTPField.Root.Props, "autoFocus" | "children" | "length"> {
  autoFocus?: boolean
  className?: string
  inputClassName?: string
  length?: number
  size?: "sm" | "default" | "lg"
  mask?: boolean
  groupSeparator?: boolean
  status?: "default" | "success" | "error"
  onComplete?: (code: string) => void
}

function OtpInput({
  autoFocus = false,
  className,
  inputClassName,
  length = 6,
  size = "default",
  mask = false,
  groupSeparator = true,
  status = "default",
  onComplete,
  onValueChange,
  disabled,
  ...props
}: OtpInputProps) {
  const handleValueChange = React.useCallback(
    (value: string, eventDetails: any) => {
      onValueChange?.(value, eventDetails)
      if (value.length === length && onComplete) {
        onComplete(value)
      }
    },
    [length, onComplete, onValueChange]
  )

  const isError = status === "error"
  const isSuccess = status === "success"

  const sizeStyles = {
    sm: "h-9 w-8 text-xs font-medium rounded-md sm:w-9 sm:text-sm",
    default: "h-10 w-9 text-base font-semibold rounded-lg sm:h-11 sm:w-10",
    lg: "h-12 w-11 text-lg font-bold rounded-xl sm:h-13 sm:w-12",
  }

  return (
    <div className="flex flex-col items-center gap-2.5 w-full">
      <OTPField.Root
        className={cn(
          "flex items-center justify-center gap-2 sm:gap-2.5 transition-all duration-200",
          isError && "[animation:otp-shake_0.4s_ease-in-out]",
          className
        )}
        data-slot="otp-input"
        data-status={status}
        disabled={disabled}
        length={length}
        onValueChange={handleValueChange}
        {...props}
      >
        {Array.from({ length }, (_, index) => {
          const showSeparator = groupSeparator && length === 6 && index === 3

          return (
            <React.Fragment key={index}>
              {showSeparator ? (
                <div aria-hidden="true" className="flex items-center justify-center px-0.5 text-muted-foreground/40 font-bold select-none">
                  —
                </div>
              ) : null}
              <OTPField.Input
                aria-label={index === 0 ? undefined : `${index + 1} / ${length}`}
                autoFocus={autoFocus && index === 0}
                type={mask ? "password" : "text"}
                className={cn(
                  "flex items-center justify-center text-center font-accent tabular-nums outline-none select-none transition-all duration-200 ease-out",
                  sizeStyles[size],
                  "border border-input bg-transparent shadow-2xs dark:bg-input/30",
                  "hover:border-border hover:bg-muted/30 hover:shadow-xs hover:scale-[1.03]",
                  "focus-visible:z-10 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/30 focus-visible:bg-background focus-visible:scale-[1.06] focus-visible:shadow-sm",
                  "active:scale-[0.95]",
                  "data-filled:border-ring/40 data-filled:bg-accent/30 data-filled:scale-[1.02] data-filled:shadow-xs",
                  isSuccess &&
                    "border-success/60 text-success dark:border-success/50 focus-visible:border-success focus-visible:ring-1 focus-visible:ring-success/30 shadow-[0_0_8px_rgba(var(--success-rgb,0,0,0),0.15)]",
                  (isError || props["aria-invalid"]) &&
                    "border-destructive/60 text-destructive dark:border-destructive/50 focus-visible:border-destructive focus-visible:ring-1 focus-visible:ring-destructive/30",
                  disabled && "pointer-events-none opacity-50 bg-input/50",
                  inputClassName
                )}
              />
            </React.Fragment>
          )
        })}
      </OTPField.Root>

      {/* Status feedback pill */}
      {status !== "default" ? (
        <div
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold font-accent animate-in fade-in duration-200",
            isSuccess && "text-success bg-success/10 border border-success/20",
            isError && "text-destructive bg-destructive/10 border border-destructive/20"
          )}
        >
          {isSuccess ? (
            <>
              <IconCheck aria-hidden="true" className="size-3.5 stroke-[2.5]" />
              <span>Codice verificato</span>
            </>
          ) : (
            <>
              <IconAlertCircle aria-hidden="true" className="size-3.5 stroke-[2.5]" />
              <span>Codice errato</span>
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}

export { OtpInput }
