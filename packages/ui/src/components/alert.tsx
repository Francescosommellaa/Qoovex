import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "#lib/utils"

const alertVariants = cva(
  "relative flex w-full gap-3 rounded-lg border p-4 text-sm text-foreground transition-colors has-data-[slot=alert-action]:pr-12 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:translate-y-0.5",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-card-foreground [&_svg]:text-foreground",
        info: "border-info/30 bg-info/10 text-foreground [&_svg]:text-info",
        success: "border-success/30 bg-success/10 text-foreground [&_svg]:text-success",
        warning: "border-warning/30 bg-warning/10 text-foreground [&_svg]:text-warning-foreground dark:[&_svg]:text-warning",
        destructive: "border-destructive/30 bg-destructive/10 text-foreground [&_svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-link-scope="inline"
      data-slot="alert-title"
      className={cn(
        "font-semibold tracking-tight text-foreground leading-none mb-1.5 [&_a]:hover:underline",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-link-scope="inline"
      data-slot="alert-description"
      className={cn(
        "text-sm leading-relaxed text-muted-foreground [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-2",
        className
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-3.5 right-3.5 flex items-center gap-2", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
