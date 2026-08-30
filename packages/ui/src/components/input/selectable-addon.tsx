"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { Select, SelectContent, SelectItem, SelectValue } from "../select"
import { IconAction } from "../icon-action"

export type AddonOption = { value: string; label: string; display: React.ReactNode }

/** Private composition: Select owns selection, typeahead, keyboard and popup.
 * No input value state and no second dropdown behavior. */
export function SelectableAddon({ options, label, descriptionId, value, defaultValue,
  onValueChange, disabled, readOnly, name, form,
}: {
  options: readonly AddonOption[]
  label: string
  descriptionId: string
  value?: string
  defaultValue: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  readOnly?: boolean
  name?: string
  form?: string
}) {
  const renderTrigger = (props: React.ComponentProps<"button">, state: { disabled: boolean; open: boolean }, children: React.ReactNode) => (
    <button {...props} type="button" className="qv-addon-trigger" disabled={state.disabled || readOnly} aria-label={label} aria-describedby={descriptionId}>
      <span className="qv-addon-value">{children}</span>
      <IconAction intent="disclosure" state={state.open ? "open" : "closed"} />
    </button>
  )
  return (
    <div data-slot="selectable-addon" className="qv-selectable-addon flex items-center">
      <Select value={value} defaultValue={defaultValue} disabled={disabled} readOnly={readOnly}
        name={name} form={form} items={options}
        onValueChange={(next) => { if (next !== null) onValueChange?.(next) }}>
        <SelectValue id={descriptionId} className="sr-only">
          {(selected) => `${label}: ${options.find((option) => option.value === selected)?.label ?? "Non selezionato"}`}
        </SelectValue>
        <SelectPrimitive.Trigger render={(props, state) => renderTrigger(props, state,
          <SelectValue>{(selected) => options.find((option) => option.value === selected)?.display}</SelectValue>)} />
        <SelectContent align="start" alignItemWithTrigger={false} className="qv-addon-options">
          {options.map((option) => <SelectItem key={option.value} value={option.value} label={option.label}>
            {option.label}
          </SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}
