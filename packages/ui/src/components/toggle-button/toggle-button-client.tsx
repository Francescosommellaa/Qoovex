"use client"

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { motion, useReducedMotion } from "motion/react"
import * as React from "react"

import { cn } from "#lib/utils"
import { useActionInteraction } from "../action-interaction"
import { buttonVariants } from "../button/button-variants"
import { IconActionInteractionProvider } from "../icon-action/icon-action-client"
import { iconButtonVariants } from "../icon-button/icon-button-variants"
import {
  getToggleButtonContentVariants,
  getToggleButtonHoverVariants,
  getToggleButtonIndicatorVariants,
  getToggleButtonInteractionVariants,
  getToggleButtonStateVariants,
  getToggleButtonStateContentVariants,
  readToggleButtonMotion,
} from "./toggle-button-motion"
import { toggleButtonVariants } from "./toggle-button-variants"

type TextSize = "sm" | "default" | "lg"
type IconSize = "icon-xs" | "icon-sm" | "icon"
type AccessibleName =
  | { "aria-label": string; "aria-labelledby"?: string }
  | { "aria-label"?: string; "aria-labelledby": string }

type ToggleButtonBaseProps = Omit<TogglePrimitive.Props, "aria-label" | "aria-labelledby">

type TextToggleButtonProps = ToggleButtonBaseProps & {
  size?: TextSize
  pressedContent?: React.ReactNode
  "aria-label"?: string
  "aria-labelledby"?: string
}

type IconToggleButtonProps = ToggleButtonBaseProps & AccessibleName & {
  size: IconSize
  pressedContent?: React.ReactNode
}

type EventHandler<Event> = ((event: Event) => void) | undefined

function callDistinctHandlers<Event>(event: Event, ...handlers: EventHandler<Event>[]) {
  const called = new Set<EventHandler<Event>>()

  for (const handler of handlers) {
    if (!handler || called.has(handler)) continue
    called.add(handler)
    handler(event)
  }
}

export type ToggleButtonProps = TextToggleButtonProps | IconToggleButtonProps

function isIconSize(size: ToggleButtonProps["size"]): size is IconSize {
  return size === "icon-xs" || size === "icon-sm" || size === "icon"
}

function iconButtonSize(size: IconSize) {
  if (size === "icon-xs") return "xs" as const
  if (size === "icon-sm") return "sm" as const
  return "default" as const
}

function ToggleButton({
  className,
  children,
  disabled,
  nativeButton,
  pressedContent,
  render,
  size = "default",
  ...props
}: ToggleButtonProps) {
  const systemReducedMotion = Boolean(useReducedMotion())
  const [reducedMotion, setReducedMotion] = React.useState(false)
  React.useEffect(() => setReducedMotion(systemReducedMotion), [systemReducedMotion])

  const interaction = useActionInteraction(Boolean(disabled))
  const actionMotion = React.useMemo(
    () => readToggleButtonMotion(reducedMotion),
    [reducedMotion]
  )
  const interactionVariants = React.useMemo(
    () => getToggleButtonInteractionVariants(reducedMotion, actionMotion),
    [actionMotion, reducedMotion]
  )
  const hoverVariants = React.useMemo(
    () => getToggleButtonHoverVariants(reducedMotion, actionMotion),
    [actionMotion, reducedMotion]
  )
  const stateVariants = React.useMemo(
    () => getToggleButtonStateVariants(reducedMotion, actionMotion),
    [actionMotion, reducedMotion]
  )
  const contentVariants = React.useMemo(
    () => getToggleButtonContentVariants(reducedMotion),
    [reducedMotion]
  )
  const indicatorVariants = React.useMemo(
    () => getToggleButtonIndicatorVariants(reducedMotion, actionMotion),
    [actionMotion, reducedMotion]
  )
  const unpressedContentVariants = React.useMemo(
    () => getToggleButtonStateContentVariants(reducedMotion, actionMotion, "unpressed"),
    [actionMotion, reducedMotion]
  )
  const pressedContentVariants = React.useMemo(
    () => getToggleButtonStateContentVariants(reducedMotion, actionMotion, "pressed"),
    [actionMotion, reducedMotion]
  )

  const iconOnly = isIconSize(size)
  const geometry = iconOnly
    ? iconButtonVariants({ size: iconButtonSize(size), variant: "ghost" })
    : buttonVariants({ size, variant: "ghost" })

  return (
    <TogglePrimitive
      {...props}
      className={cn(geometry, toggleButtonVariants(), className)}
      data-reduced-motion={reducedMotion ? "true" : undefined}
      data-slot="toggle-button"
      disabled={disabled}
      nativeButton={nativeButton}
      render={(rootProps, state) => {
        const root = typeof render === "function"
          ? render(rootProps, state)
          : render ?? <button />
        const rootElement = React.isValidElement(root) ? root : <button />
        const elementProps = rootElement.props as React.ComponentPropsWithoutRef<"button">

        return React.cloneElement(
          rootElement as React.ReactElement<Record<string, unknown>>,
          {
            ...rootProps,
            onBlur: (event: React.FocusEvent<HTMLButtonElement>) => {
              callDistinctHandlers(event, elementProps.onBlur, rootProps.onBlur)
              interaction.reset()
            },
            onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => {
              callDistinctHandlers(event, elementProps.onKeyDown, rootProps.onKeyDown)
              if (state.disabled || event.defaultPrevented || event.repeat || (event.key !== "Enter" && event.key !== " ")) return
              interaction.beginPress()
            },
            onKeyUp: (event: React.KeyboardEvent<HTMLButtonElement>) => {
              callDistinctHandlers(event, elementProps.onKeyUp, rootProps.onKeyUp)
              if (event.key === "Enter" || event.key === " ") interaction.settle()
            },
            onPointerCancel: (event: React.PointerEvent<HTMLButtonElement>) => {
              callDistinctHandlers(event, elementProps.onPointerCancel, rootProps.onPointerCancel)
              if (!state.disabled) interaction.reset()
            },
            onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
              callDistinctHandlers(event, elementProps.onPointerDown, rootProps.onPointerDown)
              if (!state.disabled && event.button === 0) interaction.beginPress()
            },
            onPointerEnter: (event: React.PointerEvent<HTMLButtonElement>) => {
              callDistinctHandlers(event, elementProps.onPointerEnter, rootProps.onPointerEnter)
              if (!state.disabled && event.pointerType !== "touch") interaction.beginHover(event.buttons)
            },
            onPointerLeave: (event: React.PointerEvent<HTMLButtonElement>) => {
              callDistinctHandlers(event, elementProps.onPointerLeave, rootProps.onPointerLeave)
              if (!state.disabled) interaction.reset()
            },
            onPointerUp: (event: React.PointerEvent<HTMLButtonElement>) => {
              callDistinctHandlers(event, elementProps.onPointerUp, rootProps.onPointerUp)
              if (!state.disabled) interaction.settle()
            },
          },
          <>
            <motion.span
              animate={state.disabled ? "rest" : interaction.visualPhase}
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-0 -z-10 origin-center rounded-[inherit]",
                iconOnly && "grid place-items-center"
              )}
              data-slot="toggle-button-interaction-surface"
              initial={false}
              variants={interactionVariants}
            >
              <span
                className={cn(
                  "absolute inset-0 rounded-[inherit]",
                  iconOnly && "m-auto size-[var(--icon-button-visual-size)] rounded-[var(--icon-button-radius)]"
                )}
                data-slot="toggle-button-visual-surface"
              >
                <motion.span
                  className="absolute inset-0 rounded-[inherit] border border-transparent bg-[var(--toggle-button-interaction-surface)] forced-colors:border-[ButtonBorder] forced-colors:bg-[ButtonFace]"
                  data-slot="toggle-button-hover-surface"
                  variants={hoverVariants}
                />
                <motion.span
                  animate={state.pressed ? "pressed" : "unpressed"}
                  className="absolute inset-0 rounded-[inherit] border border-[var(--toggle-button-state-border)] bg-[var(--toggle-button-state-surface)] forced-colors:border-[Highlight] forced-colors:bg-[Highlight]"
                  data-slot="toggle-button-state-surface"
                  initial={false}
                  variants={stateVariants}
                />
                <motion.span
                  animate={state.pressed ? "pressed" : "unpressed"}
                  className="absolute right-1 top-1 size-1 rounded-full bg-current forced-colors:bg-[HighlightText]"
                  data-slot="toggle-button-state-indicator"
                  initial={false}
                  variants={indicatorVariants}
                />
              </span>
            </motion.span>
            <motion.span
              animate={state.disabled ? "rest" : interaction.visualPhase}
              className="relative inline-flex min-w-0 items-center justify-center gap-[inherit]"
              data-slot="toggle-button-content"
              initial={false}
              variants={contentVariants}
            >
              <IconActionInteractionProvider phase={state.disabled ? "rest" : interaction.visualPhase}>
                {pressedContent === undefined ? children : (
                  <span className="inline-grid min-w-0 items-center justify-items-center">
                    <motion.span
                      animate={state.pressed ? "pressed" : "unpressed"}
                      aria-hidden={state.pressed}
                      className="col-start-1 row-start-1 inline-flex min-w-0 items-center justify-center gap-[inherit]"
                      data-slot="toggle-button-unpressed-content"
                      initial={false}
                      variants={unpressedContentVariants}
                    >
                      {children}
                    </motion.span>
                    <motion.span
                      animate={state.pressed ? "pressed" : "unpressed"}
                      aria-hidden={!state.pressed}
                      className="col-start-1 row-start-1 inline-flex min-w-0 items-center justify-center gap-[inherit]"
                      data-slot="toggle-button-pressed-content"
                      initial={false}
                      variants={pressedContentVariants}
                    >
                      {pressedContent}
                    </motion.span>
                  </span>
                )}
              </IconActionInteractionProvider>
            </motion.span>
          </>
        )
      }}
    />
  )
}

export { ToggleButton }
