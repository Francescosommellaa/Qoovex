"use client";

import { ToggleGroup } from "radix-ui";
import type { ComponentPropsWithRef } from "react";

export type SegmentedControlItem = {
  disabled?: boolean;
  label: string;
  value: string;
};

export type SegmentedControlProps = Omit<
  ComponentPropsWithRef<"div">,
  "defaultValue" | "dir" | "onChange"
> & {
  "aria-label": string;
  defaultValue?: string;
  dir?: "ltr" | "rtl";
  disabled?: boolean;
  items: readonly SegmentedControlItem[];
  loop?: boolean;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  value?: string;
};

export function SegmentedControl({
  "aria-label": ariaLabel,
  items,
  ...props
}: SegmentedControlProps) {
  return (
    <ToggleGroup.Root
      aria-label={ariaLabel}
      className="qv-segmented"
      type="single"
      {...props}
    >
      {items.map((item) => (
        <ToggleGroup.Item
          className="qv-segmented__item"
          disabled={item.disabled}
          key={item.value}
          value={item.value}
        >
          {item.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
