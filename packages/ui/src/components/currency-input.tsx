"use client"

import * as React from "react"
import { Input } from "./input"
import { CompositeInput, InputAddon } from "./composite-input"
import { SelectableAddon } from "./input/selectable-addon"
import { currencyEntryError, currencyEntryRules, editCurrencyEntry, formatCurrencyEntry } from "./input/entry-validation"
import { useEntryValidation } from "./input/use-entry-validation"

export type CurrencyOption = { code: string; symbol: string; name: string }
const currencies: readonly CurrencyOption[] = [
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "USD", symbol: "$", name: "Dollaro statunitense" },
  { code: "GBP", symbol: "£", name: "Sterlina britannica" },
  { code: "CHF", symbol: "CHF", name: "Franco svizzero" },
  { code: "JPY", symbol: "¥", name: "Yen giapponese" },
]

export type CurrencyInputProps = Omit<React.ComponentProps<"input">, "type" | "value" | "defaultValue" | "min" | "max" | "step"> & {
  value?: string
  defaultValue?: string
  min?: number
  max?: number
  locale?: Intl.LocalesArgument
  currencies?: readonly CurrencyOption[]
  currency?: string
  defaultCurrency?: string
  onCurrencyChange?: (currency: string) => void
  currencyName?: string
  onValidationChange?: (message: string | null) => void
}

/** Exact entry text, not an accounting value. Native Input owns editing; validation
 * never parses back into the value, rounds on blur, or converts on currency change. */
export function CurrencyInput({ className, currencies: options = currencies, currency, defaultCurrency,
  onCurrencyChange, currencyName, ref, form, disabled, readOnly, min, max, locale = "it-IT",
  value, defaultValue = "", onValidationChange, onChange, onBlur, onFocus, onInvalid,
  onPointerDown, onKeyDown, onPaste,
  "aria-invalid": invalid, "aria-describedby": describedBy, ...props
}: CurrencyInputProps) {
  const descriptionId = React.useId()
  const [localCurrency, setLocalCurrency] = React.useState(defaultCurrency ?? options[0]?.code ?? "EUR")
  const selected = options.length === 1 ? options[0]!.code : currency ?? localCurrency
  const rules = currencyEntryRules(selected, locale)
  const { inputRef, error, report } = useEntryValidation(ref, onValidationChange)
  const [localText, setLocalText] = React.useState(defaultValue)
  const [editing, setEditing] = React.useState(false)
  const [hasTyped, setHasTyped] = React.useState(false)
  const text = value ?? localText
  const validate = (text: string) => currencyEntryError(text, rules, min, max)
  const display = editing ? (hasTyped ? text : editCurrencyEntry(text, rules)) : validate(text) ? text : formatCurrencyEntry(text, rules)
  const selectedOption = options.find((option) => option.code === selected)
  const beginEditing = (input: HTMLInputElement) => {
    if (editing || readOnly || disabled) return
    const next = editCurrencyEntry(text, rules)
    const offset = (position: number) => input.value === next ? position : input.value.slice(0, position).split(rules.group).join("").length
    const start = offset(input.selectionStart ?? 0)
    const end = offset(input.selectionEnd ?? 0)
    input.value = next
    input.setSelectionRange(start, end)
  }
  React.useEffect(() => {
    report(currencyEntryError(text, rules, min, max))
  }, [text, rules.precision, rules.decimal, rules.group, rules.primary, rules.secondary, min, max, report])
  React.useEffect(() => {
    const owner = inputRef.current?.form
    if (!owner || value !== undefined) return
    const reset = (event: Event) => queueMicrotask(() => {
      if (!event.defaultPrevented) { setLocalText(defaultValue); setEditing(false); report(null) }
    })
    owner.addEventListener("reset", reset)
    return () => owner.removeEventListener("reset", reset)
  }, [defaultValue, value, form, inputRef, report])

  return <CompositeInput className={className} data-currency-input>
    <Input inputMode="decimal"
      {...props} ref={inputRef} type="text" value={display} form={form} disabled={disabled} readOnly={readOnly}
      aria-invalid={error ? true : invalid}
      aria-describedby={[descriptionId, describedBy].filter(Boolean).join(" ")}
      onChange={(event) => {
        setHasTyped(true)
        setEditing(true)
        if (value === undefined) setLocalText(event.currentTarget.value)
        report(validate(event.currentTarget.value))
        onChange?.(event)
      }}
      onPointerDown={(event) => { beginEditing(event.currentTarget); onPointerDown?.(event) }}
      onKeyDown={(event) => {
        if (event.key !== "Tab" && !event.altKey && !event.metaKey && !(event.ctrlKey && event.key.toLowerCase() !== "a")) beginEditing(event.currentTarget)
        onKeyDown?.(event)
      }}
      onPaste={(event) => { beginEditing(event.currentTarget); onPaste?.(event) }}
      onFocus={onFocus}
      onBlur={(event) => {
        const message = validate(text)
        report(message)
        if (!editing && !message) event.currentTarget.value = formatCurrencyEntry(text, rules)
        setEditing(false)
        onBlur?.(event)
      }}
      onInvalid={(event) => {
        report(validate(text) ?? (event.currentTarget.validity.valueMissing ? "Inserisci l’importo." : null))
        onInvalid?.(event)
      }} />
    {options.length === 1 ? <>
      <InputAddon aria-hidden="true">{selectedOption?.symbol ?? selected}</InputAddon>
      <span className="sr-only" id={descriptionId}>Valuta: {selected} · {selectedOption?.name}</span>
      {currencyName && <input type="hidden" name={currencyName} value={selected} form={form} disabled={disabled} />}
    </> : <SelectableAddon label="Valuta" descriptionId={descriptionId} value={selected}
      defaultValue={defaultCurrency ?? options[0]?.code ?? ""}
      onValueChange={(next) => {
        if (currency === undefined) setLocalCurrency(next)
        onCurrencyChange?.(next)
      }}
      disabled={disabled} readOnly={readOnly} name={currencyName} form={form}
      options={options.map((option) => ({ value: option.code, label: `${option.code} · ${option.name}`,
        display: <><span>{option.code}</span>{option.symbol !== option.code && <span aria-hidden="true">{option.symbol}</span>}</>,
      }))} />}
  </CompositeInput>
}
