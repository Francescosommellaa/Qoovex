"use client";

import { Tooltip as TooltipPrimitive } from "radix-ui";
import type { ComponentPropsWithoutRef } from "react";

import { mergeClassNames } from "./merge-class-names";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({
  className,
  sideOffset = 8,
  ...props
}: ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        className={mergeClassNames("qv-tooltip", className)}
        sideOffset={sideOffset}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}
