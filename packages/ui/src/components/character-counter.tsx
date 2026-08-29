import * as React from "react"

import { cn } from "#lib/utils"

type CharacterCounterState = "normal" | "near-limit" | "at-limit" | "over-limit"

type CharacterCounterProps = Omit<React.ComponentProps<"span">, "children"> & {
  current: number
  max: number
}

function readCharacterCounterState(current: number, max: number): CharacterCounterState {
  if (current > max) return "over-limit"
  if (current === max) return "at-limit"
  if (max > 0 && current / max >= 0.9) return "near-limit"
  return "normal"
}

function CharacterCounter({ className, current, max, style, ...props }: CharacterCounterProps) {
  const state = readCharacterCounterState(current, max)
  const reservedCharacters = Math.max(7, String(Math.abs(Math.trunc(max))).length * 2 + 3)

  return (
    <span
      aria-label={`${current} caratteri su ${max}`}
      className={cn(
        "inline-flex shrink-0 justify-end whitespace-nowrap text-xs font-medium leading-5 tabular-nums transition-colors duration-150 ease-out motion-reduce:transition-none",
        state === "normal" && "text-muted-foreground",
        state === "near-limit" && "text-foreground/80",
        state === "at-limit" && "text-warning-emphasis",
        state === "over-limit" && "text-destructive",
        className
      )}
      data-slot="character-counter"
      data-state={state}
      style={{ minInlineSize: `${reservedCharacters}ch`, ...style }}
      {...props}
    >
      {current} / {max}
    </span>
  )
}

export { CharacterCounter }
export type { CharacterCounterProps }
