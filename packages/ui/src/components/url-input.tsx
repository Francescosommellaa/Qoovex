"use client"

import * as React from "react"
import { Input } from "./input"
import { CompositeInput, InputAddon } from "./composite-input"
import { urlEntryError } from "./input/entry-validation"
import { useEntryValidation } from "./input/use-entry-validation"

export type UrlInputProps = Omit<React.ComponentProps<"input">, "type"> & {
  onValidationChange?: (message: string | null) => void
}

/** Value and FormData contain only domain/path. The consumer adds https:// explicitly. */
export function UrlInput({ className, ref, onValidationChange, onChange, onBlur, onInvalid,
  "aria-invalid": invalid, "aria-describedby": describedBy, ...props }: UrlInputProps) {
  const descriptionId = React.useId()
  const { inputRef, error, report } = useEntryValidation(ref, onValidationChange)
  React.useEffect(() => { report(urlEntryError(inputRef.current?.value ?? "")) }, [props.value, props.defaultValue, report, inputRef])
  return <CompositeInput className={className} data-url-input>
    <InputAddon aria-hidden="true">https://</InputAddon>
    <span className="sr-only" id={descriptionId}>Protocollo HTTPS già presente; inserisci solo dominio e percorso.</span>
    <Input inputMode="url" autoCapitalize="none" autoCorrect="off" {...props} ref={inputRef} type="text"
      aria-invalid={error ? true : invalid} aria-describedby={[descriptionId, describedBy].filter(Boolean).join(" ")}
      onChange={(event) => { report(urlEntryError(event.currentTarget.value), Boolean(error)); onChange?.(event) }}
      onBlur={(event) => { report(urlEntryError(event.currentTarget.value)); onBlur?.(event) }}
      onInvalid={(event) => {
        report(urlEntryError(event.currentTarget.value) ?? (event.currentTarget.validity.valueMissing ? "Inserisci il dominio." : null))
        onInvalid?.(event)
      }} />
  </CompositeInput>
}
