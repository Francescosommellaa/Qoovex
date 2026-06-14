"use client";

import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import type { ComponentPropsWithoutRef } from "react";

export type RadioOption = {
  description?: string;
  disabled?: boolean;
  label: string;
  value: string;
};

export type RadioGroupProps = ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Root
> & {
  label: string;
  options: readonly RadioOption[];
};

export function RadioGroup({
  label,
  options,
  ...props
}: RadioGroupProps) {
  return (
    <fieldset className="qv-radio-fieldset">
      <legend>{label}</legend>
      <RadioGroupPrimitive.Root className="qv-radio-group" {...props}>
        {options.map((option) => (
          <div className="qv-choice" key={option.value}>
            <RadioGroupPrimitive.Item
              className="qv-radio"
              disabled={option.disabled}
              id={`${props.name ?? "qv-radio"}-${option.value}`}
              value={option.value}
            >
              <RadioGroupPrimitive.Indicator className="qv-radio__indicator" />
            </RadioGroupPrimitive.Item>
            <div>
              <label
                className="qv-choice__label"
                htmlFor={`${props.name ?? "qv-radio"}-${option.value}`}
              >
                {option.label}
              </label>
              {option.description ? (
                <p className="qv-choice__description">{option.description}</p>
              ) : null}
            </div>
          </div>
        ))}
      </RadioGroupPrimitive.Root>
    </fieldset>
  );
}
