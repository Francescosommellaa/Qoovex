"use client";

import { Check, CaretDown } from "@phosphor-icons/react";
import { Select as SelectPrimitive } from "radix-ui";
import type { ComponentPropsWithoutRef } from "react";

import { mergeClassNames } from "./merge-class-names";

export type SelectOption = {
  disabled?: boolean;
  label: string;
  value: string;
};

export type SelectProps = ComponentPropsWithoutRef<typeof SelectPrimitive.Root> & {
  "aria-label": string;
  className?: string;
  options: readonly SelectOption[];
  placeholder?: string;
};

export function Select({
  "aria-label": ariaLabel,
  className,
  options,
  placeholder = "Seleziona",
  ...props
}: SelectProps) {
  return (
    <SelectPrimitive.Root {...props}>
      <SelectPrimitive.Trigger
        aria-label={ariaLabel}
        className={mergeClassNames("qv-control", "qv-select", className)}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon aria-hidden="true">
          <CaretDown size={16} weight="bold" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="qv-floating qv-select-content"
          position="popper"
          sideOffset={8}
        >
          <SelectPrimitive.Viewport>
            {options.map((option) => (
              <SelectPrimitive.Item
                className="qv-select-item"
                disabled={option.disabled}
                key={option.value}
                value={option.value}
              >
                <SelectPrimitive.ItemText>
                  {option.label}
                </SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator>
                  <Check aria-hidden="true" size={16} weight="bold" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
