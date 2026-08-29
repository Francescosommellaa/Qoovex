import type { Transition, Variants } from "motion/react"
import type { IconActionIntent } from "../icon-action/icon-action-motion"

import {
  instantTransition,
  readActionMotion,
  type ActionMotion,
  type ActionVariant,
} from "../action-motion"

export type ButtonVariant = ActionVariant

// Balanced after browser tuning against rigid and elastic bounds. The damping
// permits one restrained return past equilibrium while preserving input velocity.
const buttonSettleSpring: Transition = Object.freeze({
  type: "spring",
  stiffness: 410,
  damping: 28,
  mass: 0.76,
})

export function readButtonMotion(reducedMotion: boolean): ActionMotion {
  return readActionMotion(reducedMotion, buttonSettleSpring)
}

export function getButtonSurfaceVariants(
  variant: ButtonVariant,
  reducedMotion: boolean,
  buttonMotion: ActionMotion,
  intent?: IconActionIntent,
): Variants {
  const ghost = variant === "ghost"

  if (reducedMotion) {
    return {
      rest: { opacity: ghost ? 0 : 1, scaleX: 1, scaleY: 1, x: 0, y: 0, transition: instantTransition },
      hover: { opacity: 1, scaleX: 1, scaleY: 1, x: 0, y: 0, transition: instantTransition },
      pressed: { opacity: 1, scaleX: 1, scaleY: 1, x: 0, y: 0, transition: instantTransition },
    }
  }

  // Same directional push as IconButton, tuned for the wider text surface.
  // Vertical arrows and download retain the ordinary centered Button response.
  const horizontal = intent === "forward" || intent === "back"
  const sign = intent === "back" ? -1 : 1
  return {
    rest: {
      opacity: ghost ? 0 : 1,
      scaleX: ghost ? 0.92 : 1,
      scaleY: ghost ? 0.78 : 1,
      x: 0,
      y: 0,
      boxShadow: "none",
      transition: buttonMotion.settle,
    },
    hover: {
      opacity: 1,
      scaleX: horizontal ? 1.035 : 1.01,
      scaleY: 1.024,
      x: horizontal ? sign * 0.9 : 0,
      y: 0,
      boxShadow: ghost ? "none" : "var(--elevation-raised)",
      transition: buttonMotion.settle,
    },
    pressed: {
      opacity: 1,
      scaleX: horizontal ? 1.025 : 1.012,
      scaleY: 0.962,
      x: horizontal ? sign * 1.1 : 0,
      y: 0,
      boxShadow: "none",
      transition: buttonMotion.contact,
    },
  }
}

export function getButtonContentVariants(
  reducedMotion: boolean,
  buttonMotion: ActionMotion
): Variants {
  if (reducedMotion) {
    return {
      rest: { opacity: 1, scaleX: 1, scaleY: 1, y: 0, transition: instantTransition },
      hover: { opacity: 1, scaleX: 1, scaleY: 1, y: 0, transition: instantTransition },
      pressed: { opacity: 0.82, scaleX: 1, scaleY: 1, y: 0, transition: instantTransition },
    }
  }

  return {
    rest: { scaleX: 1, scaleY: 1, y: 0, transition: buttonMotion.settle },
    hover: {
      scaleX: 1.004,
      scaleY: 1.01,
      y: 0,
      transition: buttonMotion.settle,
    },
    pressed: {
      scaleX: 1.008,
      scaleY: 0.972,
      y: 0,
      transition: buttonMotion.contact,
    },
  }
}

export function getLoadingContentVariants(
  reducedMotion: boolean,
  buttonMotion: ActionMotion,
  direction: "content" | "loader"
): Variants {
  const visible = direction === "content" ? "idle" : "loading"
  const hidden = direction === "content" ? "loading" : "idle"
  const transition = reducedMotion ? instantTransition : buttonMotion.state

  return {
    [visible]: { opacity: 1, scale: 1, y: 0, transition },
    [hidden]: {
      opacity: 0,
      scale: reducedMotion ? 1 : 0.985,
      y: reducedMotion ? 0 : direction === "content" ? -2 : 2,
      transition,
    },
  }
}
