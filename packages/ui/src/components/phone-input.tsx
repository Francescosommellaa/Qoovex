"use client"

import * as React from "react"
import { Input } from "./input"
import { CompositeInput } from "./composite-input"
import { SelectableAddon } from "./input/selectable-addon"
import { phoneEntryError, phoneNationalDigitLimit, sanitizePhoneEntry } from "./input/entry-validation"
import { useEntryValidation } from "./input/use-entry-validation"

export type PhoneCountry = { code: string; name: string; dialCode: string }
const countries: readonly PhoneCountry[] = [
  { code: "IT", name: "Italia", dialCode: "+39" },
  { code: "FR", name: "Francia", dialCode: "+33" },
  { code: "DE", name: "Germania", dialCode: "+49" },
  { code: "ES", name: "Spagna", dialCode: "+34" },
  { code: "GB", name: "Regno Unito", dialCode: "+44" },
  { code: "US", name: "Stati Uniti", dialCode: "+1" },
  { code: "CH", name: "Svizzera", dialCode: "+41" },
  { code: "AT", name: "Austria", dialCode: "+43" },
  { code: "BE", name: "Belgio", dialCode: "+32" },
  { code: "NL", name: "Paesi Bassi", dialCode: "+31" },
  { code: "PT", name: "Portogallo", dialCode: "+351" },
  { code: "RO", name: "Romania", dialCode: "+40" },
  { code: "GR", name: "Grecia", dialCode: "+30" },
]

export type PhoneInputProps = Omit<React.ComponentProps<"input">, "type"> & {
  countries?: readonly PhoneCountry[]
  country?: string
  defaultCountry?: string
  onCountryChange?: (country: string) => void
  countryName?: string
  onValidationChange?: (message: string | null) => void
}

export function PhoneInput({ className, countries: options = countries, country, defaultCountry,
  onCountryChange, countryName, disabled, readOnly, form, ref, onBlur, onChange, onInvalid,
  onValidationChange, maxLength: requestedMaxLength, "aria-invalid": invalid, "aria-describedby": describedBy, ...props
}: PhoneInputProps) {
  const descriptionId = React.useId()
  const [localCountry, setLocalCountry] = React.useState(defaultCountry ?? options[0]?.code ?? "")
  const selected = country ?? localCountry
  const dialCode = options.find((option) => option.code === selected)?.dialCode ?? ""
  const maxLength = Math.min(requestedMaxLength ?? Number.POSITIVE_INFINITY, phoneNationalDigitLimit(dialCode))
  const { inputRef, error, report } = useEntryValidation(ref, onValidationChange)
  React.useEffect(() => {
    report(phoneEntryError(inputRef.current?.value ?? "", dialCode))
  }, [dialCode, props.value, props.defaultValue, report, inputRef])
  return (
    <CompositeInput className={className} data-phone-input>
      <SelectableAddon label="Paese e prefisso" descriptionId={descriptionId} value={selected}
        defaultValue={defaultCountry ?? options[0]?.code ?? ""} onValueChange={(next) => {
          if (country === undefined) setLocalCountry(next)
          onCountryChange?.(next)
        }}
        disabled={disabled} readOnly={readOnly} name={countryName} form={form}
        options={options.map((option) => ({ value: option.code, label: `${option.name} · ${option.dialCode}`,
          display: <span>{option.dialCode}</span>,
        }))} />
      <Input {...props} ref={inputRef} type="tel" inputMode="numeric" pattern="[0-9]*"
        spellCheck={false} autoCapitalize="none" disabled={disabled} readOnly={readOnly} form={form}
        aria-invalid={error ? true : invalid}
        onChange={(event) => {
          const sanitized = sanitizePhoneEntry(event.currentTarget.value, dialCode, maxLength)
          if (event.currentTarget.value !== sanitized) event.currentTarget.value = sanitized
          report(phoneEntryError(sanitized, dialCode), Boolean(error))
          onChange?.(event)
        }}
        onBlur={(event) => { report(phoneEntryError(event.currentTarget.value, dialCode)); onBlur?.(event) }}
        onInvalid={(event) => {
          report(phoneEntryError(event.currentTarget.value, dialCode) ?? (event.currentTarget.validity.valueMissing ? "Inserisci il numero di telefono." : null))
          onInvalid?.(event)
        }}
        aria-describedby={[descriptionId, describedBy].filter(Boolean).join(" ")} />
    </CompositeInput>
  )
}
