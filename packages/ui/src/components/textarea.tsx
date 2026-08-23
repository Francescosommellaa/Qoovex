"use client"

import * as React from "react"
import { cn } from "#lib/utils"

function GripIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      {...props}
    >
      <path d="M6 2L2 6M6 5L5 6" />
    </svg>
  )
}

function Textarea({
  className,
  autoResize = true,
  resizable = false,
  minRows,
  maxRows,
  ...props
}: React.ComponentProps<"textarea"> & {
  autoResize?: boolean
  resizable?: boolean
  minRows?: number
  maxRows?: number
}) {
  const style: React.CSSProperties = {
    ...props.style,
    ...(minRows ? { minHeight: `${minRows * 1.5 + 1}rem` } : {}),
    ...(maxRows ? { maxHeight: `${maxRows * 1.5 + 1}rem` } : {}),
  }

  // Quando autoResize è attivo, il ridimensionamento manuale con la maniglia del browser è superfluo.
  // Quando resizable è true, la maniglia nativa viene personalizzata per seguire lo stile minimalista del design system.
  const isResizable = resizable && !autoResize

  return (
    <div className="relative w-full">
      <textarea
        data-slot="textarea"
        data-focus-target="composite"
        style={style}
        className={cn(
          "flex w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-2 text-base sm:text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/30 qv-readonly:cursor-text qv-readonly:bg-muted/30 qv-readonly:text-foreground qv-readonly:opacity-100 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/30 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
          autoResize ? "field-sizing-content min-h-20 resize-none" : "",
          isResizable ? "min-h-24 resize-y [&::-webkit-resizer]:bg-transparent" : "resize-none",
          className
        )}
        {...props}
      />
      {isResizable ? (
        <div
          aria-hidden
          className="pointer-events-none absolute right-1.5 bottom-1.5 flex items-center justify-center text-muted-foreground/50"
        >
          <GripIcon className="size-2.5" />
        </div>
      ) : null}
    </div>
  )
}

function TextareaGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="textarea-group"
      data-focus-owner="composite"
      className={cn(
        "relative flex w-full flex-col rounded-xl border border-input bg-background/50 transition-colors focus-within:border-ring dark:bg-input/30",
        className
      )}
      {...props}
    />
  )
}

function TextareaCounter({
  current = 0,
  max,
  mode = "character",
  className,
}: {
  current: number
  max: number
  mode?: "character" | "word"
  className?: string
}) {
  const isOverLimit = current > max
  const label = mode === "word" ? `${current} / ${max} parole` : `${current} / ${max}`

  return (
    <span
      data-slot="textarea-counter"
      className={cn(
        "font-accent text-[0.6875rem] font-semibold tracking-wider select-none",
        isOverLimit ? "text-destructive font-bold" : "text-muted-foreground",
        className
      )}
    >
      {label}
    </span>
  )
}

function TextareaToolbar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="textarea-toolbar"
      className={cn(
        "flex items-center justify-between gap-2 border-t border-border/50 px-3 py-2 bg-muted/20 rounded-b-xl",
        className
      )}
      {...props}
    />
  )
}

export { Textarea, TextareaGroup, TextareaCounter, TextareaToolbar }
