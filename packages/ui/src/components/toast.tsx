"use client";

import { X } from "@phosphor-icons/react";
import { Toast as ToastPrimitive } from "radix-ui";
import type { ComponentPropsWithoutRef } from "react";

import { IconButton } from "./icon-button";
import { mergeClassNames } from "./merge-class-names";

export const ToastProvider = ToastPrimitive.Provider;
export const ToastViewport = ({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>) => (
  <ToastPrimitive.Viewport
    className={mergeClassNames("qv-toast-viewport", className)}
    {...props}
  />
);

export type ToastProps = ComponentPropsWithoutRef<typeof ToastPrimitive.Root> & {
  description?: string;
  title: string;
  tone?: "neutral" | "success" | "warning" | "danger";
};

export function Toast({
  children,
  className,
  description,
  title,
  tone = "neutral",
  ...props
}: ToastProps) {
  return (
    <ToastPrimitive.Root
      className={mergeClassNames(
        "qv-surface",
        "qv-toast",
        className,
      )}
      data-elevation="floating"
      data-material="paper"
      data-tone={tone}
      {...props}
    >
      <ToastPrimitive.Title className="qv-toast__title">
        {title}
      </ToastPrimitive.Title>
      {description ? (
        <ToastPrimitive.Description className="qv-toast__description">
          {description}
        </ToastPrimitive.Description>
      ) : null}
      {children}
      <ToastPrimitive.Close asChild>
        <IconButton
          aria-label="Chiudi notifica"
          className="qv-toast__close"
          variant="tertiary"
        >
          <X aria-hidden="true" size={18} />
        </IconButton>
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
}

export const ToastAction = ToastPrimitive.Action;
