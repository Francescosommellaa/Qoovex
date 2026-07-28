import * as React from "react"

import { cn } from "#lib/utils"

function WorkQueueItem({ className, priority = "default", ...props }: React.ComponentProps<"article"> & { priority?: "default" | "attention" | "blocking" }) {
  return <article className={cn("grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center", priority === "attention" && "border-warning/50", priority === "blocking" && "border-destructive/50", className)} data-priority={priority} data-slot="work-queue-item" {...props} />
}

function WorkQueueItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("min-w-0 space-y-1", className)} data-slot="work-queue-item-content" {...props} />
}

function WorkQueueItemActions({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-wrap items-center gap-2", className)} data-slot="work-queue-item-actions" {...props} />
}

export { WorkQueueItem, WorkQueueItemActions, WorkQueueItemContent }
