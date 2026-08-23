export const MOTION_DURATION_PROPERTIES = Object.freeze({
  instant: "--motion-duration-instant",
  feedback: "--motion-duration-feedback",
  state: "--motion-duration-state",
  surface: "--motion-duration-surface",
} as const)

export const MOTION_EASING_PROPERTIES = Object.freeze({
  standard: "--ease-standard",
  emphasized: "--ease-emphasized",
} as const)

export const PREFERS_REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

export type MotionDurationRole = keyof typeof MOTION_DURATION_PROPERTIES
export type MotionEasingRole = keyof typeof MOTION_EASING_PROPERTIES
export type MotionBezier = readonly [number, number, number, number]
export type MotionTransition = {
  duration: number
  ease?: MotionBezier
}

type MotionStyleDeclaration = Pick<CSSStyleDeclaration, "getPropertyValue">

function readRequiredToken(styles: MotionStyleDeclaration, property: string) {
  const value = styles.getPropertyValue(property).trim()

  if (!value) {
    throw new Error(`Missing CSS motion token ${property}`)
  }

  return value
}

function parseDuration(styles: MotionStyleDeclaration, role: MotionDurationRole) {
  const property = MOTION_DURATION_PROPERTIES[role]
  const value = readRequiredToken(styles, property)
  const match = /^(\d*\.?\d+)(ms|s)$/.exec(value)

  if (!match) {
    throw new Error(`Invalid CSS duration token ${property}: ${value}`)
  }

  const duration = Number(match[1])
  return match[2] === "ms" ? duration / 1000 : duration
}

function parseEasing(styles: MotionStyleDeclaration, role: MotionEasingRole) {
  const property = MOTION_EASING_PROPERTIES[role]
  const value = readRequiredToken(styles, property)
  const match = /^cubic-bezier\(\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*\)$/.exec(
    value
  )

  if (!match) {
    throw new Error(`Invalid CSS easing token ${property}: ${value}`)
  }

  return match.slice(1).map(Number) as unknown as MotionBezier
}

/**
 * Projects the canonical CSS motion tokens into the seconds and Bezier tuple
 * expected by Motion. CSS remains the only numeric source of truth.
 */
export function resolveMotionTransition(
  styles: MotionStyleDeclaration,
  duration: MotionDurationRole,
  easing: MotionEasingRole = "standard",
  reducedMotion = false
): MotionTransition {
  if (reducedMotion) {
    return { duration: 0 }
  }

  return {
    duration: parseDuration(styles, duration),
    ease: parseEasing(styles, easing),
  }
}
