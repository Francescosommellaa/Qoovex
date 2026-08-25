import type { Transition } from "motion/react"

import { resolveMotionTransition } from "#lib/motion"

export type ActionVariant = "default" | "secondary" | "outline" | "ghost" | "destructive"

export type ActionMotion = Readonly<{
  contact: Transition
  state: Transition
  settle: Transition
}>

const instantTransition: Transition = Object.freeze({ duration: 0 })

export function readActionMotion(
  reducedMotion: boolean,
  settle: Transition
): ActionMotion {
  if (reducedMotion || typeof window === "undefined") {
    return {
      contact: instantTransition,
      state: instantTransition,
      settle: instantTransition,
    }
  }

  const styles = window.getComputedStyle(document.documentElement)

  return {
    contact: resolveMotionTransition(styles, "instant"),
    state: resolveMotionTransition(styles, "state"),
    settle,
  }
}

export { instantTransition }
