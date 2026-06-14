"use client";

import { X } from "@phosphor-icons/react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useId, type ComponentPropsWithoutRef, type ReactNode } from "react";

import { IconButton } from "./icon-button";
import { mergeClassNames } from "./merge-class-names";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export type DialogContentProps = ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> & {
  description?: string;
  title: string;
};

export function DialogContent({
  children,
  className,
  description,
  title,
  ...props
}: DialogContentProps) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="qv-overlay" />
      <DialogPrimitive.Content
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        className={mergeClassNames(
          "qv-surface",
          "qv-dialog",
          "qv-overlay-panel",
          className,
        )}
        data-material="crystal"
        data-purpose="overlay"
        data-tone="light"
        {...props}
      >
        <div className="qv-overlay-panel__heading">
          <div>
            <DialogPrimitive.Title id={titleId}>{title}</DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description id={descriptionId}>
                {description}
              </DialogPrimitive.Description>
            ) : null}
          </div>
          <DialogPrimitive.Close asChild>
            <IconButton aria-label="Chiudi finestra" variant="tertiary">
              <X aria-hidden="true" size={20} />
            </IconButton>
          </DialogPrimitive.Close>
        </div>
        {children as ReactNode}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
