"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "#lib/utils"

const avatarVariants = cva(
  "group/avatar relative flex shrink-0 select-none overflow-hidden rounded-full border border-border/60 bg-muted transition-all duration-150",
  {
    variants: {
      size: {
        xs: "size-6 text-[0.625rem]",
        sm: "size-8 text-xs",
        default: "size-10 text-sm",
        lg: "size-12 text-base",
        xl: "size-14 text-lg",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

function Avatar({
  className,
  size = "default",
  ...props
}: AvatarPrimitive.Root.Props & VariantProps<typeof avatarVariants>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(avatarVariants({ size }), className)}
      {...props}
    />
  )
}

function AvatarImage({ className, ...props }: AvatarPrimitive.Image.Props) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(
        "aspect-square size-full rounded-full object-cover",
        className
      )}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: AvatarPrimitive.Fallback.Props) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-muted font-medium text-muted-foreground uppercase tracking-wider",
        className
      )}
      {...props}
    />
  )
}

function AvatarBadge({
  className,
  status = "online",
  ...props
}: React.ComponentProps<"span"> & {
  status?: "online" | "offline" | "busy" | "away"
}) {
  const statusStyles = {
    online: "bg-success border-background",
    offline: "bg-muted-foreground/60 border-background",
    busy: "bg-destructive border-background",
    away: "bg-warning border-background",
  }

  return (
    <span
      data-slot="avatar-badge"
      data-status={status}
      className={cn(
        "absolute right-0 bottom-0 z-10 block rounded-full border-2 ring-1 ring-border/20 select-none",
        "group-data-[size=xs]/avatar:size-2 group-data-[size=xs]/avatar:border-1",
        "group-data-[size=sm]/avatar:size-2.5",
        "group-data-[size=default]/avatar:size-3",
        "group-data-[size=lg]/avatar:size-3.5",
        "group-data-[size=xl]/avatar:size-4",
        statusStyles[status],
        className
      )}
      {...props}
    />
  )
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "group/avatar-group flex items-center -space-x-2.5 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroupCount({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "relative flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted font-accent text-xs font-semibold text-muted-foreground ring-2 ring-background select-none",
        "group-has-data-[size=xs]/avatar-group:size-6 group-has-data-[size=xs]/avatar-group:text-[0.625rem]",
        "group-has-data-[size=sm]/avatar-group:size-8 group-has-data-[size=sm]/avatar-group:text-xs",
        "group-has-data-[size=lg]/avatar-group:size-12 group-has-data-[size=lg]/avatar-group:text-sm",
        "group-has-data-[size=xl]/avatar-group:size-14 group-has-data-[size=xl]/avatar-group:text-base",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
  avatarVariants,
}
