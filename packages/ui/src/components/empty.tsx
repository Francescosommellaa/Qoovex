"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "#lib/utils"

const emptyVariants = cva(
  "flex w-full min-w-0 flex-1 flex-col items-center justify-center text-center text-balance transition-colors duration-150",
  {
    variants: {
      variant: {
        dashed: "rounded-2xl border border-dashed border-border/80 bg-card/40 p-8 sm:p-12",
        outline: "rounded-2xl border border-border bg-card p-8 sm:p-12 shadow-2xs",
        card: "rounded-2xl border border-border/60 bg-muted/30 p-8 sm:p-12",
        ghost: "bg-transparent p-6 sm:p-10 border-none",
      },
    },
    defaultVariants: {
      variant: "dashed",
    },
  }
)

function Empty({
  className,
  variant = "dashed",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyVariants>) {
  return (
    <div
      data-slot="empty"
      data-variant={variant}
      className={cn(emptyVariants({ variant }), className)}
      {...props}
    />
  )
}

function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-header"
      className={cn("flex max-w-md flex-col items-center gap-2", className)}
      {...props}
    />
  )
}

const emptyMediaVariants = cva(
  "mb-3 flex shrink-0 items-center justify-center transition-all duration-150 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "size-14 rounded-2xl border border-border bg-muted/60 text-foreground shadow-2xs [&_svg]:size-7",
        badge: "size-16 rounded-full border border-primary/20 bg-primary/10 text-primary [&_svg]:size-8",
        destructive: "size-14 rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive [&_svg]:size-7",
      },
    },
    defaultVariants: {
      variant: "icon",
    },
  }
)

function EmptyMedia({
  className,
  variant = "icon",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-media"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

function EmptyTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="empty-title"
      className={cn(
        "text-base sm:text-lg font-semibold tracking-tight text-foreground leading-snug",
        className
      )}
      {...props}
    />
  )
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-link-scope="inline"
      data-slot="empty-description"
      className={cn(
        "text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm [&>a:hover]:text-primary",
        className
      )}
      {...props}
    />
  )
}

function EmptyActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-actions"
      className={cn(
        "mt-5 flex flex-wrap items-center justify-center gap-2.5",
        className
      )}
      {...props}
    />
  )
}

function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        "flex w-full max-w-md min-w-0 flex-col items-center gap-3 text-sm text-balance",
        className
      )}
      {...props}
    />
  )
}

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
  EmptyActions,
  emptyVariants,
  emptyMediaVariants,
}
