"use client";

import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import type { ComponentPropsWithoutRef } from "react";

import { mergeClassNames } from "./merge-class-names";

export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
export const AlertDialogCancel = AlertDialogPrimitive.Cancel;
export const AlertDialogAction = AlertDialogPrimitive.Action;

export type AlertDialogContentProps = ComponentPropsWithoutRef<
  typeof AlertDialogPrimitive.Content
> & {
  description: string;
  title: string;
};

export function AlertDialogContent({
  children,
  className,
  description,
  title,
  ...props
}: AlertDialogContentProps) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className="qv-overlay" />
      <AlertDialogPrimitive.Content
        className={mergeClassNames(
          "qv-surface",
          "qv-alert-dialog",
          "qv-overlay-panel",
          className,
        )}
        data-material="crystal"
        data-purpose="overlay"
        data-tone="light"
        {...props}
      >
        <AlertDialogPrimitive.Title>{title}</AlertDialogPrimitive.Title>
        <AlertDialogPrimitive.Description>
          {description}
        </AlertDialogPrimitive.Description>
        {children}
      </AlertDialogPrimitive.Content>
    </AlertDialogPrimitive.Portal>
  );
}
