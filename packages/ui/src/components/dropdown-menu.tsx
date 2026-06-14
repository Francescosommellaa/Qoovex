"use client";

import { Check, CaretRight } from "@phosphor-icons/react";
import { DropdownMenu as DropdownPrimitive } from "radix-ui";
import type { ComponentPropsWithoutRef } from "react";

import { mergeClassNames } from "./merge-class-names";

export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;
export const DropdownMenuGroup = DropdownPrimitive.Group;
export const DropdownMenuLabel = DropdownPrimitive.Label;
export const DropdownMenuSeparator = DropdownPrimitive.Separator;
export const DropdownMenuSub = DropdownPrimitive.Sub;
export const DropdownMenuPortal = DropdownPrimitive.Portal;

export function DropdownMenuContent({
  className,
  sideOffset = 8,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownPrimitive.Content>) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        className={mergeClassNames(
          "qv-surface",
          "qv-floating",
          "qv-menu",
          className,
        )}
        data-elevation="floating"
        data-material="paper"
        sideOffset={sideOffset}
        {...props}
      />
    </DropdownPrimitive.Portal>
  );
}

export function DropdownMenuItem({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownPrimitive.Item>) {
  return (
    <DropdownPrimitive.Item
      className={mergeClassNames("qv-menu__item", className)}
      {...props}
    />
  );
}

export function DropdownMenuCheckboxItem({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownPrimitive.CheckboxItem>) {
  return (
    <DropdownPrimitive.CheckboxItem
      className={mergeClassNames("qv-menu__item", className)}
      {...props}
    >
      <DropdownPrimitive.ItemIndicator className="qv-menu__indicator">
        <Check aria-hidden="true" size={16} weight="bold" />
      </DropdownPrimitive.ItemIndicator>
      {children}
    </DropdownPrimitive.CheckboxItem>
  );
}

export function DropdownMenuSubTrigger({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownPrimitive.SubTrigger>) {
  return (
    <DropdownPrimitive.SubTrigger
      className={mergeClassNames("qv-menu__item", className)}
      {...props}
    >
      {children}
      <CaretRight aria-hidden="true" size={16} />
    </DropdownPrimitive.SubTrigger>
  );
}

export function DropdownMenuSubContent({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownPrimitive.SubContent>) {
  return (
    <DropdownPrimitive.SubContent
      className={mergeClassNames(
        "qv-surface",
        "qv-floating",
        "qv-menu",
        className,
      )}
      data-elevation="floating"
      data-material="paper"
      {...props}
    />
  );
}
