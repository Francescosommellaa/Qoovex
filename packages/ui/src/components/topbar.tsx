import * as React from "react"
import { cn } from "#lib/utils"

function Topbar({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      data-slot="topbar"
      className={cn(
        "sticky top-[var(--safe-area-top)] z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border/80 bg-background/90 px-3 backdrop-blur-xl sm:px-4",
        className
      )}
      {...props}
    />
  )
}

function TopbarStart({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="topbar-start"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  )
}

function TopbarCenter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="topbar-center"
      className={cn("min-w-0 flex-1", className)}
      {...props}
    />
  )
}

function TopbarEnd({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="topbar-end"
      className={cn("ml-auto flex items-center gap-1.5", className)}
      {...props}
    />
  )
}

export { Topbar, TopbarStart, TopbarCenter, TopbarEnd }
