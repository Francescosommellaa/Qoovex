import type { Transition, Variants } from "motion/react"

import {
  instantTransition,
  readActionMotion,
  type ActionMotion,
} from "../action-motion"

const toggleButtonSettleSpring: Transition = Object.freeze({
  type: "spring",
  stiffness: 425,
  damping: 29,
  mass: 0.7,
})

export function readToggleButtonMotion(reducedMotion: boolean): ActionMotion {
  return readActionMotion(reducedMotion, toggleButtonSettleSpring)
}

export function getToggleButtonInteractionVariants(
  reducedMotion: boolean,
  actionMotion: ActionMotion
): Variants {
  if (reducedMotion) {
    return {
      rest: { scaleX: 1, scaleY: 1, transition: instantTransition },
      hover: { scaleX: 1, scaleY: 1, transition: instantTransition },
      pressed: { scaleX: 1, scaleY: 1, transition: instantTransition },
    }
  }

  return {
    rest: { scaleX: 1, scaleY: 1, boxShadow: "none", transition: actionMotion.settle },
    hover: { scaleX: 1.014, scaleY: 1.026, boxShadow: "var(--elevation-raised)", transition: actionMotion.settle },
    pressed: { scaleX: 1.016, scaleY: 0.958, boxShadow: "none", transition: actionMotion.contact },
  }
}

export function getToggleButtonHoverVariants(
  reducedMotion: boolean,
  actionMotion: ActionMotion
): Variants {
  const transition = reducedMotion ? instantTransition : actionMotion.settle
  return {
    rest: { opacity: 0, scaleX: reducedMotion ? 1 : 0.88, scaleY: reducedMotion ? 1 : 0.8, transition },
    hover: { opacity: 1, scaleX: 1, scaleY: 1, transition },
    pressed: { opacity: 1, scaleX: 1, scaleY: 1, transition: reducedMotion ? instantTransition : actionMotion.contact },
  }
}

export function getToggleButtonStateVariants(
  reducedMotion: boolean,
  actionMotion: ActionMotion
): Variants {
  const transition = reducedMotion ? instantTransition : actionMotion.settle
  return {
    unpressed: { opacity: 0, scaleX: reducedMotion ? 1 : 0.86, scaleY: reducedMotion ? 1 : 0.82, transition },
    pressed: { opacity: 1, scaleX: 1, scaleY: 1, transition },
  }
}

export function getToggleButtonContentVariants(reducedMotion: boolean): Variants {
  return {
    rest: { opacity: 1 },
    hover: { opacity: 1 },
    pressed: { opacity: reducedMotion ? 0.78 : 0.9 },
  }
}

export function getToggleButtonStateContentVariants(
  reducedMotion: boolean,
  actionMotion: ActionMotion,
  layer: "unpressed" | "pressed",
): Variants {
  const transition = reducedMotion ? instantTransition : actionMotion.settle
  const visible = () => ({
    opacity: 1,
    scale: 1,
    x: 0,
    transition,
  })
  const hidden = (direction: number) => ({
    opacity: 0,
    scale: reducedMotion ? 1 : 0.965,
    x: reducedMotion ? 0 : direction * 2,
    transition,
  })

  return layer === "unpressed"
    ? { unpressed: visible(), pressed: hidden(-1) }
    : { unpressed: hidden(1), pressed: visible() }
}

export function getToggleButtonIndicatorVariants(
  reducedMotion: boolean,
  actionMotion: ActionMotion,
): Variants {
  const transition = reducedMotion ? instantTransition : actionMotion.settle

  return {
    unpressed: { opacity: 0, scale: reducedMotion ? 1 : 0.4, transition },
    pressed: { opacity: 1, scale: 1, transition },
  }
}
