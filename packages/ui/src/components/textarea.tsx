"use client"

import * as React from "react"
import { cn } from "#lib/utils"

function Textarea({
  className,
  autoResize = true,
  resizable = false,
  minRows,
  maxRows,
  rows,
  style,
  ref,
  onInput,
  onScroll,
  ...props
}: React.ComponentProps<"textarea"> & {
  autoResize?: boolean
  resizable?: boolean
  minRows?: number
  maxRows?: number
}) {
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const frameRef = React.useRef<HTMLDivElement>(null)
  React.useImperativeHandle(ref, () => inputRef.current!, [])

  // Observe only overflow presentation. Native/React still own value, selection,
  // focus, scrolling and resizing; typing does not create another value state.
  const syncOverflow = React.useCallback(() => {
    const input = inputRef.current
    const frame = frameRef.current
    if (!input || !frame) return
    const computed = getComputedStyle(input)
    const inlineBorder = Number.parseFloat(computed.borderLeftWidth) + Number.parseFloat(computed.borderRightWidth)
    const scrollbar = Math.max(0, input.offsetWidth - input.clientWidth - inlineBorder)
    frame.style.setProperty("--qv-textarea-scrollbar", `${scrollbar}px`)
    frame.toggleAttribute("data-overflow-start", input.scrollTop > 1)
    frame.toggleAttribute("data-overflow-end", input.scrollHeight - input.clientHeight - input.scrollTop > 1)
  }, [])

  React.useLayoutEffect(syncOverflow)
  React.useEffect(() => {
    const input = inputRef.current
    if (!input) return
    const observer = new ResizeObserver(syncOverflow)
    observer.observe(input)
    let resetFrame = 0
    const afterReset = () => {
      cancelAnimationFrame(resetFrame)
      resetFrame = requestAnimationFrame(syncOverflow)
    }
    const form = input.form
    form?.addEventListener("reset", afterReset)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(resetFrame)
      form?.removeEventListener("reset", afterReset)
    }
  }, [props.form, syncOverflow])

  const minimumRows = Math.max(1, minRows ?? rows ?? 3)
  const maximumRows = maxRows === undefined ? undefined : Math.max(minimumRows, maxRows)
  const resizeMode = autoResize ? "auto" : resizable ? "vertical" : "none"
  const textareaStyle = {
    "--qv-textarea-min-block-size": `calc(${minimumRows}lh + 1.125rem)`,
    ...(maximumRows === undefined
      ? {}
      : { "--qv-textarea-max-block-size": `calc(${maximumRows}lh + 1.125rem)` }),
    ...style,
  } as React.CSSProperties

  return (
    <div ref={frameRef} className="qv-textarea-frame" data-slot="textarea-frame">
      <textarea
        ref={inputRef}
        data-slot="textarea"
        data-focus-target="composite"
        data-resize={resizeMode}
        rows={rows}
        style={textareaStyle}
        className={cn(
          "qv-textarea w-full min-w-0 rounded-lg border px-3 py-2 text-base leading-6 text-foreground outline-none sm:text-sm placeholder:text-muted-foreground",
          resizeMode === "auto" && "field-sizing-content resize-none overflow-y-auto",
          resizeMode === "vertical" && "resize-y overflow-y-auto",
          resizeMode === "none" && "resize-none overflow-y-auto",
          className
        )}
        {...props}
        onInput={(event) => {
          syncOverflow()
          onInput?.(event)
        }}
        onScroll={(event) => {
          syncOverflow()
          onScroll?.(event)
        }}
      />
      <span aria-hidden="true" className="qv-textarea-overflow" data-slot="textarea-overflow">
        {(["start", "end"] as const).map((edge) => (
          <span key={edge} data-textarea-edge={edge} />
        ))}
      </span>
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

export { Textarea, TextareaGroup, TextareaToolbar }
