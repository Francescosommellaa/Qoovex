"use client"

import {
  IconAlertCircle,
  IconArrowDown,
  IconArrowLeft,
  IconArrowRight,
  IconArrowUp,
  IconCheck,
  IconChevronDown,
  IconCopy,
  IconDownload,
  IconEye,
  IconEyeOff,
  IconMenu,
  IconMinus,
  IconPlus,
  IconRefresh,
  IconX,
  type Icon as TablerIcon,
} from "@tabler/icons-react"
import { motion } from "motion/react"
import * as React from "react"

import { cn } from "#lib/utils"
import { PREFERS_REDUCED_MOTION_QUERY } from "#lib/motion"
import type { ActionVisualPhase } from "../action-interaction"
import {
  getIconActionInteractionVariants,
  getIconActionDownloadArrowVariants,
  getIconActionLayerVariants,
  readIconActionMotion,
  type IconActionIntent,
  type IconActionState,
} from "./icon-action-motion"

type IconPlacement = "inline-start" | "inline-end"

type CommonProps = {
  "data-icon"?: IconPlacement
}

type NeutralProps = CommonProps & {
  icon: TablerIcon
  intent: "neutral"
  state?: never
}

type VisibilityProps = CommonProps & {
  icon?: never
  intent: "visibility"
  state: "hidden" | "visible"
}

type DisclosureProps = CommonProps & {
  icon?: never
  intent: "disclosure"
  state: "closed" | "open"
}

type MenuProps = CommonProps & {
  icon?: never
  intent: "menu"
  state: "closed" | "open"
}

type CopyProps = CommonProps & {
  icon?: never
  intent: "copy"
  state: "idle" | "copying" | "success" | "error"
}

type StatelessProps = CommonProps & {
  icon?: never
  intent: Exclude<IconActionIntent, "neutral" | "visibility" | "disclosure" | "menu" | "copy">
  state?: never
}

export type IconActionProps =
  | NeutralProps
  | VisibilityProps
  | DisclosureProps
  | MenuProps
  | CopyProps
  | StatelessProps

const interactionContext = React.createContext<ActionVisualPhase>("rest")

function IconActionInteractionProvider({
  children,
  phase,
}: {
  children: React.ReactNode
  phase: ActionVisualPhase
}) {
  return <interactionContext.Provider value={phase}>{children}</interactionContext.Provider>
}

const statelessGlyphs = {
  forward: IconArrowRight,
  back: IconArrowLeft,
  up: IconArrowUp,
  down: IconArrowDown,
  clear: IconX,
  close: IconX,
  increment: IconPlus,
  decrement: IconMinus,
  download: IconDownload,
  retry: IconRefresh,
} satisfies Record<StatelessProps["intent"], TablerIcon>

function stateFor(props: IconActionProps): IconActionState {
  if (props.intent === "visibility" || props.intent === "disclosure" || props.intent === "menu" || props.intent === "copy") {
    return props.state
  }
  return "rest"
}

function layersFor(props: VisibilityProps | MenuProps | CopyProps) {
  if (props.intent === "visibility") {
    return [
      ["hidden", IconEye],
      ["visible", IconEyeOff],
    ] as const
  }

  if (props.intent === "menu") {
    return [
      ["closed", IconMenu],
      ["open", IconX],
    ] as const
  }

  return [
    ["idle", IconCopy],
    ["success", IconCheck],
    ["error", IconAlertCircle],
  ] as const
}

function IconAction(props: IconActionProps) {
  const phase = React.useContext(interactionContext)
  const [reducedMotion, setReducedMotion] = React.useState(false)
  React.useEffect(() => {
    const preference = window.matchMedia(PREFERS_REDUCED_MOTION_QUERY)
    const update = () => setReducedMotion(preference.matches)
    update()
    preference.addEventListener("change", update)
    return () => preference.removeEventListener("change", update)
  }, [])

  const state = stateFor(props)
  const actionMotion = React.useMemo(
    () => readIconActionMotion(reducedMotion),
    [reducedMotion]
  )
  const interactionVariants = React.useMemo(
    () => getIconActionInteractionVariants(props.intent, state, reducedMotion, actionMotion),
    [actionMotion, props.intent, reducedMotion, state]
  )
  const commonProps = {
    "aria-hidden": true,
    className: "pointer-events-none relative inline-grid size-[var(--icon-action-size,var(--icon))] shrink-0 place-items-center",
    "data-icon": props["data-icon"],
    "data-icon-action-intent": props.intent,
    "data-icon-action-state": state === "rest" ? undefined : state,
    "data-reduced-motion": reducedMotion ? "true" : undefined,
    "data-slot": "icon-action",
  } as const

  if (props.intent === "visibility" || props.intent === "menu" || props.intent === "copy") {
    const activeLayer = props.intent === "copy" && state === "copying" ? "idle" : state

    return (
      <motion.span {...commonProps} animate={phase} initial={false} variants={interactionVariants}>
        {layersFor(props).map(([layer, Glyph]) => {
          const variants = getIconActionLayerVariants(layer, activeLayer, reducedMotion, actionMotion)
          const active = layer === activeLayer

          return (
            <motion.span
              animate={active ? "active" : "inactive"}
              className={cn(
                "absolute inset-0 inline-grid place-items-center",
                props.intent === "copy" && layer === "error" && "text-destructive"
              )}
              data-icon-action-layer={layer}
              initial={false}
              key={layer}
              variants={variants}
            >
              <Glyph aria-hidden="true" className="size-full" focusable="false" />
            </motion.span>
          )
        })}
      </motion.span>
    )
  }


  if (props.intent === "download") {
    const arrowVariants = getIconActionDownloadArrowVariants(reducedMotion, actionMotion)

    return (
      <motion.span {...commonProps} animate={phase} initial={false} variants={interactionVariants}>
        <svg aria-hidden="true" className="size-full" fill="none" focusable="false" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
          <motion.path animate={phase} d="M12 3v12m0 0 4-4m-4 4-4-4" initial={false} variants={arrowVariants} />
          <path d="M5 21h14" />
        </svg>
      </motion.span>
    )
  }

  const Glyph = props.intent === "neutral"
    ? props.icon
    : props.intent === "disclosure"
      ? IconChevronDown
      : statelessGlyphs[props.intent]

  return (
    <motion.span {...commonProps} animate={phase} initial={false} variants={interactionVariants}>
      <Glyph aria-hidden="true" className="size-full" focusable="false" />
    </motion.span>
  )
}

// Internal Action composition contract: inspect explicit intent, never SVG identity.
function readIconActionIntent(children: React.ReactNode): IconActionIntent | undefined {
  for (const child of React.Children.toArray(children)) {
    if (!React.isValidElement(child)) continue
    if (child.type === IconAction) return (child.props as IconActionProps).intent
    const nested = readIconActionIntent((child.props as { children?: React.ReactNode }).children)
    if (nested) return nested
  }
  return undefined
}

export { IconAction, IconActionInteractionProvider, readIconActionIntent }
