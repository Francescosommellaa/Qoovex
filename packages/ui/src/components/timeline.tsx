import * as React from "react"
import { IconUser } from "@tabler/icons-react"

import { Badge } from "#components/badge"
import { cn } from "#lib/utils"

function Timeline({ className, ...props }: React.ComponentProps<"ol">) {
  return <ol className={cn("grid gap-0", className)} data-slot="timeline" {...props} />
}

function TimelineDateSeparator({ className, children, ...props }: React.ComponentProps<"li">) {
  return (
    <li className={cn("sticky top-0 z-10 flex items-center gap-3 bg-background/95 py-3 text-xs font-medium text-muted-foreground backdrop-blur-sm", className)} data-slot="timeline-date-separator" {...props}>
      <span className="h-px flex-1 bg-border" /><span>{children}</span><span className="h-px flex-1 bg-border" />
    </li>
  )
}

function TimelineEntry({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li className={cn("relative grid grid-cols-[1.5rem_minmax(0,1fr)] gap-3 pb-5 before:absolute before:top-6 before:bottom-0 before:left-[0.6875rem] before:w-px before:bg-border last:pb-0 last:before:hidden", className)} data-slot="timeline-entry" {...props} />
  )
}

function TimelineMarker({ className, ...props }: React.ComponentProps<"span">) {
  return <span aria-hidden className={cn("mt-1 flex size-6 items-center justify-center rounded-full border bg-background text-muted-foreground", className)} data-slot="timeline-marker" {...props} />
}

function TimelineContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("min-w-0 rounded-xl border bg-card p-3", className)} data-slot="timeline-content" {...props} />
}

function TimelineActor({ className, children, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("inline-flex items-center gap-1 text-xs text-muted-foreground", className)} data-slot="timeline-actor" {...props}><IconUser aria-hidden className="size-3.5" />{children}</span>
}

function TimelineTransition({ from, to, className }: { from?: string | null; to?: string | null; className?: string }) {
  if (!from && !to) return null
  return <div className={cn("mt-2 flex flex-wrap items-center gap-1.5 text-xs", className)} data-slot="timeline-transition"><Badge variant="outline">{from ?? "—"}</Badge><span aria-hidden>→</span><Badge>{to ?? "—"}</Badge></div>
}

function TimelineArtifactReference({ className, ...props }: React.ComponentProps<"a">) {
  return <a className={cn("inline-flex max-w-full items-center rounded-md border px-2 py-1 text-xs font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className)} data-slot="timeline-artifact-reference" {...props} />
}

export { Timeline, TimelineActor, TimelineArtifactReference, TimelineContent, TimelineDateSeparator, TimelineEntry, TimelineMarker, TimelineTransition }
