"use client";

import * as React from "react";
import { Input } from "../Input";
import { Select, type SelectOption } from "../Select";
import { FormField } from "../Form";
import { cn } from "../../lib/utils";

export type PhoneRegionOption = SelectOption;
export type PhoneNumberFieldStatus = "default" | "error" | "success";

const DEFAULT_PHONE_REGION_OPTIONS: PhoneRegionOption[] = [
  { value: "+39", label: "IT (+39)" },
  { value: "+41", label: "CH (+41)" },
  { value: "+33", label: "FR (+33)" },
  { value: "+49", label: "DE (+49)" },
  { value: "+34", label: "ES (+34)" },
  { value: "+44", label: "UK (+44)" },
  { value: "+1", label: "US (+1)" },
];

export interface PhoneNumberFieldProps {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  status?: PhoneNumberFieldStatus;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  regionOptions?: PhoneRegionOption[];
  regionCode: string;
  onRegionCodeChange: (value: string) => void;
  nationalNumber: string;
  onNationalNumberChange: (value: string) => void;
  onE164ValueChange?: (value?: string) => void;
  selectPlaceholder?: string;
  selectClassName?: string;
  inputPlaceholder?: string;
  inputAutoComplete?: string;
  inputClassName?: string;
}

export function PhoneNumberField({
  label = "Numero di telefono",
  helperText,
  status = "default",
  required = false,
  disabled = false,
  className,
  regionOptions = DEFAULT_PHONE_REGION_OPTIONS,
  regionCode,
  onRegionCodeChange,
  nationalNumber,
  onNationalNumberChange,
  onE164ValueChange,
  selectPlaceholder = "Prefisso",
  selectClassName,
  inputPlaceholder = "333 123 4567",
  inputAutoComplete = "tel-national",
  inputClassName,
}: PhoneNumberFieldProps) {
  const nationalNumberId = React.useId();

  React.useEffect(() => {
    const normalizedDigits = nationalNumber.replace(/[^\d]/g, "");
    const e164Value =
      normalizedDigits === "" ? undefined : `${regionCode}${normalizedDigits}`;
    onE164ValueChange?.(e164Value);
  }, [nationalNumber, onE164ValueChange, regionCode]);

  function handleNationalNumberChange(rawValue: string) {
    const digitsOnly = rawValue.replace(/[^\d]/g, "");
    onNationalNumberChange(digitsOnly);
  }

  return (
    <FormField
      label={label}
      helperText={helperText}
      status={status}
      required={required}
      disabled={disabled}
      controlId={nationalNumberId}
      className={cn("qv-phone-number-field", className)}
    >
      <div className="flex w-full items-stretch gap-(--spacing-2)">
        <div className="w-40 shrink-0">
          <Select
            options={regionOptions}
            value={regionCode}
            onChange={onRegionCodeChange}
            placeholder={selectPlaceholder}
            status={status}
            disabled={disabled}
            className={cn("w-full", selectClassName)}
          />
        </div>
        <div className="min-w-0 flex-1">
          <Input
            id={nationalNumberId}
            type="tel"
            placeholder={inputPlaceholder}
            autoComplete={inputAutoComplete}
            inputMode="numeric"
            pattern="[0-9]*"
            status={status}
            disabled={disabled}
            value={nationalNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleNationalNumberChange(e.target.value)
            }
            className={cn("w-full", inputClassName)}
          />
        </div>
      </div>
    </FormField>
  );
}
