import * as React from "react"
import { IconAlertTriangle, IconLock } from "@tabler/icons-react"
import { cn } from "#lib/utils"

export interface WorkQueueItemProps extends React.ComponentProps<"article"> {
  priority?: "default" | "attention" | "blocking"
}

function WorkQueueItem({
  className,
  priority = "default",
  ...props
}: WorkQueueItemProps) {
  const priorityPresentation = priority === "attention"
    ? { icon: IconAlertTriangle, label: "Richiede attenzione" }
    : priority === "blocking"
      ? { icon: IconLock, label: "Bloccante" }
      : null

  return (
    <article
      data-slot="work-queue-item"
      data-priority={priority}
      className={cn(
        "group relative grid gap-4 rounded-xl border p-4 shadow-2xs backdrop-blur-md transition-all duration-200 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center",
        priority === "default" &&
          "border-border/80 bg-card/60 hover:border-border hover:bg-card/80 hover:shadow-xs",
        priority === "attention" &&
          "border-warning-emphasis/70 bg-warning-surface/30 hover:border-warning-emphasis hover:bg-warning-surface/50 hover:shadow-xs",
        priority === "blocking" &&
          "border-destructive/70 bg-destructive-surface/30 hover:border-destructive hover:bg-destructive-surface/50 hover:shadow-xs",
        className
      )}
      {...props}
    >
      {priorityPresentation ? (
        <span
          className={cn(
            "col-span-full inline-flex w-fit items-center gap-1.5 text-xs font-semibold",
            priority === "attention" ? "text-warning-emphasis" : "text-destructive"
          )}
          data-slot="work-queue-item-priority"
        >
          <priorityPresentation.icon aria-hidden="true" data-slot="work-queue-item-priority-icon" />
          {priorityPresentation.label}
        </span>
      ) : null}
      {props.children}
    </article>
  )
}

function WorkQueueItemContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="work-queue-item-content"
      className={cn("min-w-0 space-y-1.5", className)}
      {...props}
    />
  )
}

function WorkQueueItemTitle({
  className,
  ...props
}: React.ComponentProps<"h4">) {
  return (
    <h4
      data-slot="work-queue-item-title"
      className={cn("text-sm font-semibold font-accent tracking-tight text-foreground", className)}
      {...props}
    />
  )
}

function WorkQueueItemDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="work-queue-item-description"
      className={cn("text-xs text-muted-foreground leading-relaxed", className)}
      {...props}
    />
  )
}

function WorkQueueItemActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="work-queue-item-actions"
      className={cn("flex flex-wrap items-center gap-2 sm:justify-end", className)}
      {...props}
    />
  )
}

export {
  WorkQueueItem,
  WorkQueueItemContent,
  WorkQueueItemTitle,
  WorkQueueItemDescription,
  WorkQueueItemActions,
}
