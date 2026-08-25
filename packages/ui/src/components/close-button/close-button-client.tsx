"use client"

import { IconX } from "@tabler/icons-react"

import { cn } from "#lib/utils"
import type { IconButtonProps } from "../icon-button"
import { IconButtonRoot } from "../icon-button/icon-button-client"

export type CloseButtonAccessibleName =
  | { "aria-label": string; "aria-labelledby"?: string }
  | { "aria-label"?: string; "aria-labelledby": string }

type CloseButtonBaseProps = Omit<
  IconButtonProps,
  | "aria-label"
  | "aria-labelledby"
  | "children"
  | "loading"
  | "size"
  | "style"
  | "variant"
>

export type CloseButtonProps = CloseButtonBaseProps & CloseButtonAccessibleName

function CloseButton({ className, ...props }: CloseButtonProps) {
  return (
    <IconButtonRoot
      {...props}
      className={cn(
        "text-muted-foreground hover:text-foreground focus-visible:text-foreground",
        className
      )}
      data-slot="close-button"
      motionIntent="close"
      size="sm"
      variant="ghost"
    >
      <IconX aria-hidden="true" />
    </IconButtonRoot>
  )
}

export { CloseButton }
