"use client"

import * as React from "react"

/** Only validation feedback; native/Base UI retain value, caret and editing state. */
export function useEntryValidation(ref: React.Ref<HTMLInputElement> | undefined, onValidationChange?: (message: string | null) => void) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [error, setError] = React.useState<string | null>(null)
  const lastError = React.useRef<string | null>(null)
  React.useImperativeHandle(ref, () => inputRef.current!, [])
  const report = React.useCallback((message: string | null, reveal = true) => {
    inputRef.current?.setCustomValidity(message ?? "")
    if (!reveal && message) return false
    setError(message)
    if (lastError.current !== message) {
      lastError.current = message
      onValidationChange?.(message)
    }
    return message === null
  }, [onValidationChange])
  return { inputRef, error, report }
}
