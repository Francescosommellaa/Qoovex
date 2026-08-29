"use client"

import * as React from "react"

import { IconAction } from "#components/icon-action"
import { IconButton } from "#components/icon-button"
import { Input } from "#components/input"
import { cn } from "#lib/utils"

type PendingSelection = {
  direction: "backward" | "forward" | "none" | null
  end: number | null
  restoreFocus: boolean
  start: number | null
}

type PasswordStrength = {
  label: string
  value: 0 | 1 | 2 | 3
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value)
  } else if (ref) {
    ref.current = value
  }
}

function PasswordInput({
  className,
  inputClassName,
  strength,
  revealLabel = "Mostra password",
  concealLabel = "Nascondi password",
  disabled,
  ref,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "type" | "className"> & {
  className?: string
  inputClassName?: string
  revealLabel?: string
  concealLabel?: string
  strength?: PasswordStrength
}) {
  const [revealed, setRevealed] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const pendingSelectionRef = React.useRef<PendingSelection | null>(null)
  const visible = revealed && !disabled
  const label = visible ? concealLabel : revealLabel
  React.useEffect(() => {
    if (disabled) setRevealed(false)
  }, [disabled])

  React.useLayoutEffect(() => {
    const input = inputRef.current
    const selection = pendingSelectionRef.current
    if (!input || !selection) return

    pendingSelectionRef.current = null
    if (selection.restoreFocus) input.focus({ preventScroll: true })
    if (selection.start !== null && selection.end !== null) {
      input.setSelectionRange(selection.start, selection.end, selection.direction ?? undefined)
    }
  }, [visible])

  const composedRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node
      assignRef(ref, node)
    },
    [ref]
  )

  const toggleVisibility = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const input = inputRef.current
    if (!input || disabled) return

    pendingSelectionRef.current = {
      direction: input.selectionDirection,
      end: input.selectionEnd,
      restoreFocus: event.detail > 0,
      start: input.selectionStart,
    }
    setRevealed((current) => !current)
  }, [disabled])

  return (
    <div
      className={cn("w-full", className)}
      data-password-visibility={visible ? "visible" : "hidden"}
      data-slot="password-input"
    >
      <div className="relative">
        <Input
          {...props}
          className={cn(inputClassName, "pr-14")}
          disabled={disabled}
          ref={composedRef}
          type={visible ? "text" : "password"}
        />
        <span className="absolute inset-y-0 right-1.5 flex items-center">
          <IconButton
            aria-label={label}
            className="text-muted-foreground hover:text-foreground focus-visible:text-foreground"
            disabled={disabled}
            onClick={toggleVisibility}
            size="xs"
            type="button"
            variant="ghost"
          >
            <IconAction intent="visibility" state={visible ? "visible" : "hidden"} />
          </IconButton>
        </span>
      </div>
      {strength ? (
        <div
          aria-label={`Efficacia password: ${strength.label}`}
          aria-valuemax={3}
          aria-valuemin={0}
          aria-valuenow={strength.value}
          aria-valuetext={strength.label}
          className="qv-password-strength"
          data-level={strength.value}
          data-slot="password-strength"
          role="meter"
          style={{ "--qv-password-strength": strength.value } as React.CSSProperties}
        >
          <span aria-hidden="true" className="qv-password-strength-track">
            <span className="qv-password-strength-fill" />
          </span>
          <span aria-hidden="true" className="qv-password-strength-label">
            {strength.value === 0 ? null : strength.label}
          </span>
        </div>
      ) : null}
    </div>
  )
}

export { PasswordInput, type PasswordStrength }
