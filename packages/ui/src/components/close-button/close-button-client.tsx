"use client"

import { cn } from "#lib/utils"
import { IconAction } from "../icon-action"
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
      size="sm"
      variant="ghost"
    >
      <IconAction intent="close" />
    </IconButtonRoot>
  )
}

export { CloseButton }
