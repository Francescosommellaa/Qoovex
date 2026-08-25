import type { Variants } from "motion/react"

import { instantTransition, type ActionMotion } from "./action-motion"

export type ActionIconMotionIntent =
  | "neutral"
  | "directional-right"
  | "directional-left"
  | "directional-up"
  | "directional-down"
  | "download"
  | "upload"
  | "disclosure"
  | "close"

type IconTransform = {
  rotate: number
  scale: number
  x: number
  y: number
}

function transformFor(
  intent: ActionIconMotionIntent,
  phase: "rest" | "hover" | "pressed",
  expanded: boolean,
): IconTransform {
  const distance = phase === "pressed" ? 1.1 : phase === "hover" ? 1.75 : 0

  switch (intent) {
    case "directional-right":
      return { rotate: 0, scale: 1, x: distance, y: 0 }
    case "directional-left":
      return { rotate: 0, scale: 1, x: -distance, y: 0 }
    case "directional-up":
    case "upload":
      return { rotate: 0, scale: 1, x: 0, y: -distance }
    case "directional-down":
    case "download":
      return { rotate: 0, scale: 1, x: 0, y: distance }
    case "disclosure":
      return {
        rotate: expanded ? 180 : 0,
        scale: phase === "pressed" ? 0.9 : phase === "hover" ? 1.035 : 1,
        x: 0,
        y: 0,
      }
    case "close":
      return {
        rotate: phase === "pressed" ? -1.5 : phase === "hover" ? 3.5 : 0,
        scale: phase === "pressed" ? 0.92 : phase === "hover" ? 1.05 : 1,
        x: 0,
        y: 0,
      }
    case "neutral":
      return { rotate: 0, scale: 1, x: 0, y: 0 }
  }
}

export function getActionIconVariants(
  intent: ActionIconMotionIntent,
  expanded: boolean,
  reducedMotion: boolean,
  actionMotion: ActionMotion,
): Variants {
  const variant = (phase: "rest" | "hover" | "pressed") => ({
    ...(reducedMotion
      ? { rotate: 0, scale: 1, x: 0, y: 0 }
      : transformFor(intent, phase, expanded)),
    transition: reducedMotion ? instantTransition : actionMotion.settle,
  })

  return {
    rest: variant("rest"),
    hover: variant("hover"),
    pressed: variant("pressed"),
  }
}
