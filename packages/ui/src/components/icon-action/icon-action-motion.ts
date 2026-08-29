import type { Transition, Variants } from "motion/react"

import {
  instantTransition,
  readActionMotion,
  type ActionMotion,
} from "../action-motion"
import type { ActionVisualPhase } from "../action-interaction"

export type IconActionIntent =
  | "neutral"
  | "forward"
  | "back"
  | "up"
  | "down"
  | "disclosure"
  | "menu"
  | "clear"
  | "visibility"
  | "copy"
  | "close"
  | "increment"
  | "decrement"
  | "download"
  | "retry"

export type IconActionState =
  | "rest"
  | "closed"
  | "open"
  | "hidden"
  | "visible"
  | "idle"
  | "copying"
  | "success"
  | "error"

const iconActionSettleSpring: Transition = Object.freeze({
  type: "spring",
  stiffness: 460,
  damping: 31,
  mass: 0.58,
})

export function readIconActionMotion(reducedMotion: boolean): ActionMotion {
  return readActionMotion(reducedMotion, iconActionSettleSpring)
}

function interactionTarget(
  intent: IconActionIntent,
  state: IconActionState,
  phase: ActionVisualPhase,
  reducedMotion: boolean
) {
  const distance = phase === "pressed" ? 0.9 : phase === "hover" ? 1.5 : 0
  const stateRotation = intent === "disclosure" && state === "open" ? 180 : 0

  if (reducedMotion) {
    return { rotate: stateRotation, scale: 1, x: 0, y: 0, scaleX: 1, scaleY: 1 }
  }

  switch (intent) {
    case "forward":
      return { rotate: 0, scale: 1, x: distance, y: 0 }
    case "back":
      return { rotate: 0, scale: 1, x: -distance, y: 0 }
    case "up":
      return { rotate: 0, scale: 1, x: 0, y: -distance }
    case "down":
      return { rotate: 0, scale: 1, x: 0, y: distance }
    case "disclosure":
      return {
        rotate: stateRotation,
        scale: phase === "pressed" ? 0.94 : phase === "hover" ? 1.025 : 1,
        x: 0,
        y: 0,
      }
    case "close":
    case "clear":
      return {
        rotate: phase === "hover" ? 2.5 : 0,
        scale: phase === "pressed" ? 0.9 : phase === "hover" ? 1.06 : 1,
        x: 0,
        y: 0,
      }
    case "increment":
    case "decrement":
      return {
        rotate: 0,
        scale: phase === "pressed" ? 0.9 : phase === "hover" ? 1.08 : 1,
        x: 0,
        y: 0,
      }
    case "menu":
      return state === "open"
        ? {
            rotate: phase === "hover" ? 2.5 : 0,
            scale: phase === "pressed" ? 0.9 : phase === "hover" ? 1.06 : 1,
            scaleX: 1,
            scaleY: 1,
            x: 0,
            y: 0,
          }
        : {
            rotate: 0,
            scale: phase === "pressed" ? 0.92 : 1,
            scaleX: phase === "hover" ? 1.08 : 1,
            scaleY: phase === "hover" ? 1.18 : 1,
            x: 0,
            y: 0,
          }
    case "retry":
      return {
        rotate: reducedMotion ? 0 : phase === "pressed" ? -18 : phase === "hover" ? -10 : 0,
        scale: phase === "pressed" ? 0.94 : 1,
        x: 0,
        y: 0,
      }
    case "download":
    case "neutral":
    case "visibility":
    case "copy":
      return { rotate: 0, scale: 1, x: 0, y: 0 }
  }
}

export function getIconActionDownloadArrowVariants(
  reducedMotion: boolean,
  actionMotion: ActionMotion
): Variants {
  const target = (phase: ActionVisualPhase) => ({
    opacity: phase === "pressed" ? 0.82 : 1,
    y: reducedMotion ? 0 : phase === "hover" ? 1.5 : phase === "pressed" ? 0.75 : 0,
    transition: reducedMotion ? instantTransition : phase === "pressed" ? actionMotion.contact : actionMotion.settle,
  })

  return { rest: target("rest"), hover: target("hover"), pressed: target("pressed") }
}

export function getIconActionInteractionVariants(
  intent: IconActionIntent,
  state: IconActionState,
  reducedMotion: boolean,
  actionMotion: ActionMotion
): Variants {
  const variant = (phase: ActionVisualPhase) => ({
    ...interactionTarget(intent, state, phase, reducedMotion),
    transition: reducedMotion ? instantTransition : actionMotion.settle,
  })

  return {
    rest: variant("rest"),
    hover: variant("hover"),
    pressed: variant("pressed"),
  }
}

export function getIconActionLayerVariants(
  layer: IconActionState,
  activeState: IconActionState,
  reducedMotion: boolean,
  actionMotion: ActionMotion
): Variants {
  const active = layer === activeState

  return {
    active: {
      opacity: activeState === "copying" && layer === "idle" ? 0.62 : 1,
      scale: 1,
      transition: reducedMotion ? instantTransition : actionMotion.settle,
    },
    inactive: {
      opacity: 0,
      scale: reducedMotion ? 1 : layer === "success" ? 0.74 : 0.84,
      transition: reducedMotion ? instantTransition : actionMotion.state,
    },
  }
}
