import * as React from "react"
import { IconUser } from "@tabler/icons-react"

import { Badge } from "#components/badge"
import { cn } from "#lib/utils"

function Timeline({ className, ...props }: React.ComponentProps<"ol">) {
  return <ol className={cn("grid gap-0", className)} data-slot="timeline" {...props} />
}

function TimelineDateSeparator({ className, children, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      className={cn(
        "sticky top-0 z-10 flex items-center gap-3 bg-background/95 py-3 text-xs font-medium text-muted-foreground backdrop-blur-sm",
        className
      )}
      data-slot="timeline-date-separator"
      {...props}
    >
      <span className="h-px flex-1 bg-border" />
      <span className="font-accent uppercase tracking-wider text-[0.7rem]">{children}</span>
      <span className="h-px flex-1 bg-border" />
    </li>
  )
}

function TimelineEntry({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      className={cn(
        "relative grid grid-cols-[2rem_minmax(0,1fr)] gap-3 pb-6 before:absolute before:top-7 before:bottom-0 before:left-[0.9375rem] before:w-px before:bg-border/80 last:pb-0 last:before:hidden",
        className
      )}
      data-slot="timeline-entry"
      {...props}
    />
  )
}

function TimelineMarker({
  className,
  variant = "default",
  children,
  ...props
}: React.ComponentProps<"span"> & {
  variant?: "default" | "active" | "success" | "warning" | "destructive"
}) {
  const variantStyles = {
    default: "border-border/80 bg-muted/60 text-muted-foreground",
    active: "border-primary/80 bg-primary/10 text-primary shadow-2xs",
    success: "border-success/60 bg-success/15 text-success shadow-2xs",
    warning: "border-warning-emphasis/60 bg-warning/15 text-warning-emphasis shadow-2xs",
    destructive: "border-destructive/60 bg-destructive/15 text-destructive shadow-2xs",
  }

  return (
    <span
      aria-hidden
      className={cn(
        "mt-0.5 flex size-7 items-center justify-center rounded-full border text-xs font-medium transition-colors overflow-hidden shrink-0 [&_svg]:size-3.5 [&_svg]:shrink-0",
        variantStyles[variant],
        className
      )}
      data-slot="timeline-marker"
      data-variant={variant}
      {...props}
    >
      {children}
    </span>
  )
}

function TimelineContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-xl border bg-card p-4 shadow-2xs",
        className
      )}
      data-slot="timeline-content"
      {...props}
    />
  )
}

function TimelineActor({ className, children, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-xs text-muted-foreground", className)}
      data-slot="timeline-actor"
      {...props}
    >
      <IconUser aria-hidden className="size-3.5 shrink-0" />
      {children}
    </span>
  )
}

function TimelineTransition({ from, to, className }: { from?: string | null; to?: string | null; className?: string }) {
  if (!from && !to) return null
  return (
    <div className={cn("mt-2.5 flex flex-wrap items-center gap-1.5 text-xs", className)} data-slot="timeline-transition">
      <span className="text-muted-foreground font-medium">Stato:</span>
      <Badge variant="outline" className="font-accent text-[0.7rem]">{from ?? "—"}</Badge>
      <span aria-hidden className="text-muted-foreground text-xs">→</span>
      <Badge className="font-accent text-[0.7rem]">{to ?? "—"}</Badge>
    </div>
  )
}

function TimelineArtifactReference({ className, ...props }: React.ComponentProps<"a">) {
  return (
    <a
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-lg border bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-3.5",
        className
      )}
      data-slot="timeline-artifact-reference"
      {...props}
    />
  )
}

export {
  Timeline,
  TimelineActor,
  TimelineArtifactReference,
  TimelineContent,
  TimelineDateSeparator,
  TimelineEntry,
  TimelineMarker,
  TimelineTransition,
}
