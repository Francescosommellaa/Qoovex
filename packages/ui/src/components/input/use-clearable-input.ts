"use client"

import * as React from "react"

type ClearableInputOptions = {
  clearable?: boolean
  defaultValue?: React.ComponentProps<"input">["defaultValue"]
  disabled?: boolean
  onClear?: () => void
  onInput?: React.FormEventHandler<HTMLInputElement>
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
  readOnly?: boolean
  ref?: React.Ref<HTMLInputElement>
  value?: React.ComponentProps<"input">["value"]
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value)
  } else if (ref) {
    ref.current = value
  }
}

function setNativeInputValue(input: HTMLInputElement, value: string) {
  const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set

  if (valueSetter) valueSetter.call(input, value)
  else input.value = value

  input.dispatchEvent(new Event("input", { bubbles: true }))
}

function useClearableInput({
  clearable = true,
  defaultValue,
  disabled,
  onClear,
  onInput,
  onKeyDown,
  readOnly,
  ref,
  value,
}: ClearableInputOptions) {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const isControlled = value !== undefined
  const [uncontrolledValue, setUncontrolledValue] = React.useState(() =>
    String(defaultValue ?? "")
  )
  const displayedValue = isControlled ? String(value ?? "") : uncontrolledValue
  const canClear = clearable && !disabled && !readOnly
  const showClear = canClear && displayedValue.length > 0

  const composedRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node
      assignRef(ref, node)
    },
    [ref]
  )

  const clear = React.useCallback(() => {
    const input = inputRef.current
    if (!input || !canClear || input.value.length === 0) return false

    setNativeInputValue(input, "")
    if (!isControlled) setUncontrolledValue("")
    onClear?.()
    input.focus({ preventScroll: true })
    input.setSelectionRange(0, 0)
    return true
  }, [canClear, isControlled, onClear])

  const handleInput = React.useCallback<React.FormEventHandler<HTMLInputElement>>(
    (event) => {
      if (!isControlled) setUncontrolledValue(event.currentTarget.value)
      onInput?.(event)
    },
    [isControlled, onInput]
  )

  const handleKeyDown = React.useCallback<React.KeyboardEventHandler<HTMLInputElement>>(
    (event) => {
      onKeyDown?.(event)
      if (
        event.defaultPrevented ||
        event.nativeEvent.isComposing ||
        event.key !== "Escape" ||
        !showClear
      ) return

      event.preventDefault()
      clear()
    },
    [clear, onKeyDown, showClear]
  )

  return {
    clear,
    composedRef,
    handleInput,
    handleKeyDown,
    showClear,
  }
}

export { useClearableInput }
