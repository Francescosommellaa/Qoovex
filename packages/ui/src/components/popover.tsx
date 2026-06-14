"use client";

import { Popover as PopoverPrimitive } from "radix-ui";
import type { ComponentPropsWithoutRef } from "react";

import { mergeClassNames } from "./merge-class-names";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverClose = PopoverPrimitive.Close;

export type PopoverContentProps = ComponentPropsWithoutRef<
  typeof PopoverPrimitive.Content
>;

export function PopoverContent({
  className,
  sideOffset = 8,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        className={mergeClassNames(
          "qv-surface",
          "qv-floating",
          "qv-popover",
          className,
        )}
        data-material="paper"
        data-elevation="floating"
        sideOffset={sideOffset}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
