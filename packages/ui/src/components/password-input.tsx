"use client"

import * as React from "react"
import { IconEye, IconEyeOff } from "@tabler/icons-react"

import { Button } from "#components/button"
import { Input } from "#components/input"
import { cn } from "#lib/utils"

function PasswordInput({
  className,
  inputClassName,
  revealLabel = "Show password",
  concealLabel = "Hide password",
  ...props
}: Omit<React.ComponentProps<typeof Input>, "type" | "className"> & {
  className?: string
  inputClassName?: string
  revealLabel?: string
  concealLabel?: string
}) {
  const [revealed, setRevealed] = React.useState(false)
  const label = revealed ? concealLabel : revealLabel

  return (
    <div className={cn("relative", className)} data-slot="password-input">
      <Input
        className={cn("pr-10", inputClassName)}
        type={revealed ? "text" : "password"}
        {...props}
      />
      <Button
        aria-label={label}
        aria-pressed={revealed}
        className="absolute top-1/2 right-1.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        onClick={() => setRevealed((current) => !current)}
        size="icon-sm"
        title={label}
        type="button"
        variant="ghost"
      >
        {revealed ? <IconEyeOff aria-hidden="true" /> : <IconEye aria-hidden="true" />}
      </Button>
    </div>
  )
}

export { PasswordInput }
