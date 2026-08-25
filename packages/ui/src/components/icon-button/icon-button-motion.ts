import type { Transition, Variants } from "motion/react"

import {
  instantTransition,
  readActionMotion,
  type ActionMotion,
  type ActionVariant,
} from "../action-motion"

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
): Variants {
  const ghost = variant === "ghost"

  if (disabled) {
    return {
      rest: { opacity: 1, scaleX: 1, scaleY: 1, boxShadow: "none", transition: instantTransition },
      hover: { opacity: 1, scaleX: 1, scaleY: 1, boxShadow: "none", transition: instantTransition },
      pressed: { opacity: 1, scaleX: 1, scaleY: 1, boxShadow: "none", transition: instantTransition },
    }
  }

  if (reducedMotion) {
    return {
      rest: { opacity: ghost ? 0 : 1, scaleX: 1, scaleY: 1, transition: instantTransition },
      hover: { opacity: 1, scaleX: 1, scaleY: 1, transition: instantTransition },
      pressed: { opacity: 1, scaleX: 1, scaleY: 1, transition: instantTransition },
    }
  }

  return {
    rest: {
      opacity: ghost ? 0 : 1,
      scaleX: ghost ? 0.78 : 1,
      scaleY: ghost ? 0.78 : 1,
      boxShadow: "none",
      transition: actionMotion.settle,
    },
    hover: {
      opacity: 1,
      scaleX: 1.028,
      scaleY: 1.036,
      boxShadow: ghost ? "none" : "var(--elevation-raised)",
      transition: actionMotion.settle,
    },
    pressed: {
      opacity: 1,
      scaleX: 1.024,
      scaleY: 0.948,
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
