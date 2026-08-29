import type { Transition, Variants } from "motion/react"

import {
  instantTransition,
  readActionMotion,
  type ActionMotion,
  type ActionVariant,
} from "../action-motion"
import type { IconActionIntent } from "../icon-action/icon-action-motion"

export type IconButtonVariant = ActionVariant

// A square control has less visual mass than the text Button. This spring is
// slightly faster while retaining the same single, restrained elastic settle.
const iconButtonSettleSpring: Transition = Object.freeze({
  type: "spring",
  stiffness: 440,
  damping: 29,
  mass: 0.64,
})

export function readIconButtonMotion(reducedMotion: boolean): ActionMotion {
  return readActionMotion(reducedMotion, iconButtonSettleSpring)
}

export function getIconButtonSurfaceVariants(
  variant: IconButtonVariant,
  reducedMotion: boolean,
  actionMotion: ActionMotion,
  disabled = false,
  intent?: IconActionIntent,
): Variants {
  const ghost = variant === "ghost"

  if (disabled) {
    return {
      rest: { opacity: 1, scaleX: 1, scaleY: 1, x: 0, y: 0, boxShadow: "none", transition: instantTransition },
      hover: { opacity: 1, scaleX: 1, scaleY: 1, x: 0, y: 0, boxShadow: "none", transition: instantTransition },
      pressed: { opacity: 1, scaleX: 1, scaleY: 1, x: 0, y: 0, boxShadow: "none", transition: instantTransition },
    }
  }

  if (reducedMotion) {
    return {
      rest: { opacity: ghost ? 0 : 1, scaleX: 1, scaleY: 1, x: 0, y: 0, transition: instantTransition },
      hover: { opacity: 1, scaleX: 1, scaleY: 1, x: 0, y: 0, transition: instantTransition },
      pressed: { opacity: 1, scaleX: 1, scaleY: 1, x: 0, y: 0, transition: instantTransition },
    }
  }

  const directional = intent === "forward" || intent === "back" || intent === "up" || intent === "down"
  const horizontal = intent === "forward" || intent === "back"
  const sign = intent === "forward" || intent === "down" ? 1 : -1

  return {
    rest: {
      opacity: ghost ? 0 : 1,
      scaleX: ghost ? 0.78 : 1,
      scaleY: ghost ? 0.78 : 1,
      x: 0,
      y: 0,
      boxShadow: "none",
      transition: actionMotion.settle,
    },
    hover: {
      opacity: 1,
      scaleX: directional ? (horizontal ? 1.09 : 1.015) : 1.028,
      scaleY: directional ? (horizontal ? 1.015 : 1.09) : 1.036,
      x: directional && horizontal ? sign * 0.9 : 0,
      y: directional && !horizontal ? sign * 0.9 : 0,
      boxShadow: ghost ? "none" : "var(--elevation-raised)",
      transition: actionMotion.settle,
    },
    pressed: {
      opacity: 1,
      scaleX: directional ? (horizontal ? 1.065 : 0.952) : 1.024,
      scaleY: directional ? (horizontal ? 0.952 : 1.065) : 0.948,
      x: directional && horizontal ? sign * 1.1 : 0,
      y: directional && !horizontal ? sign * 1.1 : 0,
      boxShadow: "none",
      transition: actionMotion.contact,
    },
  }
}

export function getIconButtonContentVariants(reducedMotion: boolean): Variants {
  return {
    rest: { opacity: 1 },
    hover: { opacity: 1 },
    pressed: { opacity: reducedMotion ? 0.78 : 0.9 },
  }
}

export function getIconButtonLoadingVariants(
  reducedMotion: boolean,
  actionMotion: ActionMotion,
  direction: "icon" | "loader"
): Variants {
  const visible = direction === "icon" ? "idle" : "loading"
  const hidden = direction === "icon" ? "loading" : "idle"
  const transition = reducedMotion ? instantTransition : actionMotion.state

  return {
    [visible]: { opacity: 1, scale: 1, transition },
    [hidden]: {
      opacity: 0,
      scale: reducedMotion ? 1 : direction === "icon" ? 0.88 : 0.92,
      transition,
    },
  }
}
