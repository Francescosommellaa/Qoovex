"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { IconX } from "@tabler/icons-react"
import { cva, type VariantProps } from "class-variance-authority"

import { Button } from "#components/button"
import { cn } from "#lib/utils"

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/50 backdrop-blur-xs transition-all duration-300 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

const dialogContentVariants = cva(
  // Regola responsiva automatica per tutte le modali: Tendina dal basso su Mobile, Modal centrato 50%/50% su Desktop con animazione molla elastica
  "fixed z-50 grid gap-5 overflow-y-auto bg-background text-sm text-foreground outline-none transition-all duration-300 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:max-h-[90vh] max-sm:w-full max-sm:rounded-t-2xl max-sm:border-t max-sm:border-border max-sm:shadow-2xl max-sm:p-6 max-sm:data-open:slide-in-from-bottom-full max-sm:data-closed:slide-out-to-bottom-full sm:fixed sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-h-[calc(100vh-3rem)] sm:rounded-xl sm:border sm:border-border sm:p-6 sm:shadow-xl sm:data-open:zoom-in-95 sm:data-closed:zoom-out-95",
  {
    variants: {
      variant: {
        default: "",
        destructive: "border-destructive/30 sm:border-destructive/40",
        alert: "text-center sm:text-center [&_[data-slot=dialog-header]]:items-center [&_[data-slot=dialog-header]]:pr-0 [&_[data-slot=dialog-footer]]:sm:justify-center",
        media: "p-0 max-sm:p-0 sm:p-0 overflow-hidden sm:max-w-3xl",
      },
      size: {
        sm: "sm:max-w-sm",
        default: "sm:max-w-lg",
        lg: "sm:max-w-2xl",
        xl: "sm:max-w-4xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function DialogContent({
  className,
  children,
  showCloseButton = true,
  showHandle = true,
  variant = "default",
  size = "default",
  ...props
}: DialogPrimitive.Popup.Props &
  VariantProps<typeof dialogContentVariants> & {
    showCloseButton?: boolean
    showHandle?: boolean
  }) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        data-variant={variant}
        data-size={size}
        className={cn(dialogContentVariants({ variant, size }), className)}
        {...props}
      >
        {showHandle ? (
          <div
            aria-hidden
            data-slot="dialog-handle"
            className="mx-auto -mt-2 mb-1 h-1.5 w-12 rounded-full bg-muted-foreground/30 shrink-0 sm:hidden"
          />
        ) : null}
        {children}
        {showCloseButton ? (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                aria-label="Chiudi finestra"
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10"
                size="icon-xs"
                variant="ghost"
              />
            }
          >
            <IconX />
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

function DialogIcon({
  className,
  variant = "default",
  children,
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "default" | "destructive" | "warning" | "info" | "success"
}) {
  const variantStyles = {
    default: "border-border bg-muted text-muted-foreground",
    destructive: "border-destructive/30 bg-destructive/10 text-destructive",
    warning: "border-warning/30 bg-warning/10 text-warning-emphasis",
    info: "border-info/30 bg-info/10 text-info",
    success: "border-success/30 bg-success/10 text-success",
  }

  return (
    <div
      data-slot="dialog-icon"
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-xl border font-medium [&_svg]:size-5 mb-1",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1.5 pr-6 text-left", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-4 border-t border-border/50 mt-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg font-semibold tracking-tight text-foreground leading-none", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-xs sm:text-sm text-muted-foreground leading-relaxed", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogIcon,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  dialogContentVariants,
}
