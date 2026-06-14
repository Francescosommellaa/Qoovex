"use client";

import { X } from "@phosphor-icons/react";
import { Dialog as DrawerPrimitive } from "radix-ui";
import type { ComponentPropsWithoutRef } from "react";

import { IconButton } from "./icon-button";
import { mergeClassNames } from "./merge-class-names";

export const Drawer = DrawerPrimitive.Root;
export const DrawerTrigger = DrawerPrimitive.Trigger;
export const DrawerClose = DrawerPrimitive.Close;

export type DrawerContentProps = ComponentPropsWithoutRef<
  typeof DrawerPrimitive.Content
> & {
  description?: string;
  side?: "left" | "right" | "bottom";
  title: string;
};

export function DrawerContent({
  children,
  className,
  description,
  side = "right",
  title,
  ...props
}: DrawerContentProps) {
  return (
    <DrawerPrimitive.Portal>
      <DrawerPrimitive.Overlay className="qv-overlay" />
      <DrawerPrimitive.Content
        className={mergeClassNames(
          "qv-surface",
          "qv-drawer",
          className,
        )}
        data-material="crystal"
        data-purpose="overlay"
        data-side={side}
        data-tone="light"
        {...props}
      >
        <div className="qv-overlay-panel__heading">
          <div>
            <DrawerPrimitive.Title>{title}</DrawerPrimitive.Title>
            {description ? (
              <DrawerPrimitive.Description>
                {description}
              </DrawerPrimitive.Description>
            ) : null}
          </div>
          <DrawerPrimitive.Close asChild>
            <IconButton aria-label="Chiudi pannello" variant="tertiary">
              <X aria-hidden="true" size={20} />
            </IconButton>
          </DrawerPrimitive.Close>
        </div>
        {children}
      </DrawerPrimitive.Content>
    </DrawerPrimitive.Portal>
  );
}
