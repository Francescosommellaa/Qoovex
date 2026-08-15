"use client"

import * as React from "react"
import { usePlatform } from "#hooks/use-platform"
import { cn } from "#lib/utils"

export interface KbdShortcutProps extends React.ComponentProps<"kbd"> {
  value?: string
}

function KbdShortcut({ className, children, value, ...props }: KbdShortcutProps) {
  const platform = usePlatform()
  const rawText = value ?? (typeof children === "string" ? children : "")

  const formattedText = React.useMemo(() => {
    if (!rawText) return children
    if (platform === "windows") {
      return rawText
        .replace(/⌘/g, "Ctrl+")
        .replace(/⌫/g, "Del")
        .replace(/⌥/g, "Alt+")
        .replace(/⇧/g, "Shift+")
    }
    return rawText
  }, [rawText, children, platform])

  if (platform === "mobile") {
    return null
  }

  return (
    <kbd
      data-slot="kbd-shortcut"
      className={cn(
        "hidden md:inline-flex items-center justify-center font-mono text-[0.6875rem] font-medium tracking-wider text-muted-foreground/70 select-none truncate max-w-[5.5rem]",
        className
      )}
      {...props}
    >
      {formattedText}
    </kbd>
  )
}

export { KbdShortcut }
