"use client"

import * as React from "react"
import { NumberField } from "@base-ui/react/number-field"

import { cn } from "#lib/utils"
import { IconAction } from "./icon-action"
import { IconButton } from "./icon-button"
import { inputControlClassName } from "./input/input-styles"

type NumericProps = Pick<NumberField.Root.Props,
  "value" | "defaultValue" | "onValueChange" | "onValueCommitted" |
  "min" | "max" | "step" | "locale"
>

export type NumberInputProps = NumericProps & Omit<React.ComponentProps<"input">,
  keyof NumericProps | "type" | "children"
>

// Motion's keyboard press feedback dispatches a PointerEvent with no pointerType.
// It must not start Base UI's pointer hold loop: native keyboard click already
// performs the step. Real mouse/touch/pen keep the complete Base UI lifecycle.
const ignoreKeyboardPointer: NumberField.Decrement.Props["onPointerDown"] = (event) => {
  if (event.nativeEvent.pointerType === "") event.preventDefault()
}

/** Numeric behavior belongs to NumberField; ref/native props target its input.
 * className owns composition width/layout, not the private action geometry. */
function NumberInput({
  className, ref, id, name, form, required, disabled, readOnly,
  value, defaultValue, onValueChange, onValueCommitted, min, max, step, locale,
  ...inputProps
}: NumberInputProps) {
  return (
    <NumberField.Root
      className={cn("w-full min-w-0", className)}
      data-slot="number-input"
      id={id}
      name={name}
      form={form}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      onValueCommitted={onValueCommitted}
      min={min}
      max={max}
      step={step}
      locale={locale}
      allowWheelScrub={false}
    >
      <NumberField.Group className="qv-number-group">
        <NumberField.Decrement
          tabIndex={0}
          onPointerDown={ignoreKeyboardPointer}
          render={(buttonProps, state) => (
            <IconButton
              {...buttonProps}
              aria-label="Riduci valore"
              className="qv-number-decrement"
              disabled={state.disabled || state.readOnly}
              variant="ghost"
              size="sm"
            >
              <IconAction intent="decrement" />
            </IconButton>
          )}
        />
        <NumberField.Input
          {...inputProps}
          ref={ref}
          form={form}
          data-slot="input"
          className={cn(inputControlClassName, "qv-number-value text-center tabular-nums")}
        />
        <NumberField.Increment
          tabIndex={0}
          onPointerDown={ignoreKeyboardPointer}
          render={(buttonProps, state) => (
            <IconButton
              {...buttonProps}
              aria-label="Aumenta valore"
              className="qv-number-increment"
              disabled={state.disabled || state.readOnly}
              variant="ghost"
              size="sm"
            >
              <IconAction intent="increment" />
            </IconButton>
          )}
        />
      </NumberField.Group>
    </NumberField.Root>
  )
}

export { NumberInput }
