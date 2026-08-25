"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { IconLoader2 } from "@tabler/icons-react"
import { type VariantProps } from "class-variance-authority"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import * as React from "react"

import { cn } from "#lib/utils"
import {
  getActionIconVariants,
  type ActionIconMotionIntent,
} from "../action-icon-motion"
import { useActionInteraction } from "../action-interaction"
import {
  getIconButtonContentVariants,
  getIconButtonLoadingVariants,
  getIconButtonSurfaceVariants,
  readIconButtonMotion,
  type IconButtonVariant,
} from "./icon-button-motion"
import { iconButtonVariants } from "./icon-button-variants"

type AccessibleName =
  | { "aria-label": string; "aria-labelledby"?: string }
  | { "aria-label"?: string; "aria-labelledby": string }

type IconButtonBaseProps = Omit<
  ButtonPrimitive.Props,
  "aria-label" | "aria-labelledby" | "nativeButton" | "render"
> &
  VariantProps<typeof iconButtonVariants> & {
    loading?: boolean
    motionIntent?: ActionIconMotionIntent
  }

export type IconButtonProps = IconButtonBaseProps & AccessibleName

type IconButtonRootProps = IconButtonProps & {
  "data-slot"?: "icon-button" | "close-button" | "copy-button"
}

function IconButtonRoot({
  className,
  "data-slot": dataSlot = "icon-button",
  variant = "default",
  size = "default",
  loading = false,
  motionIntent = "neutral",
  disabled,
  focusableWhenDisabled,
  "aria-busy": ariaBusy,
  children,
  ...props
}: IconButtonRootProps) {
  const systemReducedMotion = Boolean(useReducedMotion())
  const [reducedMotion, setReducedMotion] = React.useState(false)
  React.useEffect(() => setReducedMotion(systemReducedMotion), [systemReducedMotion])

  const resolvedVariant = (variant ?? "default") as IconButtonVariant
  const isUnavailable = Boolean(disabled || loading)
  const expanded = props["aria-expanded"] === true
  const interaction = useActionInteraction(isUnavailable)
  const actionMotion = React.useMemo(
    () => readIconButtonMotion(reducedMotion),
    [reducedMotion]
  )
  const surfaceVariants = React.useMemo(
    () => getIconButtonSurfaceVariants(resolvedVariant, reducedMotion, actionMotion, Boolean(disabled)),
    [actionMotion, disabled, reducedMotion, resolvedVariant]
  )
  const contentVariants = React.useMemo(
    () => getIconButtonContentVariants(reducedMotion),
    [reducedMotion]
  )
  const iconVariants = React.useMemo(
    () => getIconButtonLoadingVariants(reducedMotion, actionMotion, "icon"),
    [actionMotion, reducedMotion]
  )
  const loaderVariants = React.useMemo(
    () => getIconButtonLoadingVariants(reducedMotion, actionMotion, "loader"),
    [actionMotion, reducedMotion]
  )
  const semanticIconVariants = React.useMemo(
    () => getActionIconVariants(motionIntent, expanded, reducedMotion, actionMotion),
    [actionMotion, expanded, motionIntent, reducedMotion]
  )

  return (
    <ButtonPrimitive
      {...props}
      aria-busy={loading ? true : ariaBusy}
      className={cn(iconButtonVariants({ className, size, variant: resolvedVariant }))}
      data-loading={loading ? "true" : undefined}
      data-availability={disabled ? "disabled" : loading ? "loading" : undefined}
      data-icon-motion={motionIntent}
      data-reduced-motion={reducedMotion ? "true" : undefined}
      data-slot={dataSlot}
      data-variant={resolvedVariant}
      disabled={isUnavailable}
      focusableWhenDisabled={loading ? true : focusableWhenDisabled}
      nativeButton
      render={
        ((rootProps, state) => {
          const motionRootProps = rootProps as React.ComponentProps<typeof motion.button>

          return (
            <motion.button
              {...motionRootProps}
              animate={state.disabled ? "rest" : interaction.visualPhase}
              initial={false}
              onBlur={(event) => {
                motionRootProps.onBlur?.(event)
                interaction.reset()
              }}
              onHoverEnd={state.disabled ? undefined : interaction.reset}
              onHoverStart={state.disabled ? undefined : (event) => interaction.beginHover(event.buttons)}
              onKeyDown={(event) => {
                motionRootProps.onKeyDown?.(event)
                if (
                  state.disabled ||
                  event.defaultPrevented ||
                  event.repeat ||
                  (event.key !== "Enter" && event.key !== " ")
                ) return
                interaction.beginPress()
              }}
              onKeyUp={(event) => {
                motionRootProps.onKeyUp?.(event)
                if (event.key === "Enter" || event.key === " ") interaction.settle()
              }}
              onPointerCancel={(event) => {
                motionRootProps.onPointerCancel?.(event)
                if (!state.disabled) interaction.reset()
              }}
              onPointerEnter={(event) => {
                motionRootProps.onPointerEnter?.(event)
                if (!state.disabled && event.pointerType !== "touch") interaction.beginHover(event.buttons)
              }}
              onPointerLeave={(event) => {
                motionRootProps.onPointerLeave?.(event)
                if (!state.disabled) interaction.reset()
              }}
              onTap={state.disabled ? undefined : interaction.settle}
              onTapCancel={state.disabled ? undefined : interaction.settle}
              onTapStart={state.disabled ? undefined : interaction.beginPress}
            />
          )
        })
      }
    >
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 grid place-items-center">
        <motion.span
          className="size-[var(--icon-button-visual-size)] origin-center rounded-[var(--icon-button-radius)] border border-[var(--icon-button-border)] bg-[var(--icon-button-surface)] forced-colors:border-[ButtonBorder] forced-colors:bg-[ButtonFace]"
          data-slot="icon-button-motion-surface"
          variants={surfaceVariants}
        />
      </span>
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center">
        <motion.span
          className="inline-grid size-[var(--icon-button-visual-size)] place-items-center"
          data-slot="icon-button-motion-content"
          variants={contentVariants}
        >
          <motion.span
            animate={loading ? "loading" : "idle"}
            className="inline-grid place-items-center"
            data-slot="icon-button-icon"
            initial={false}
            variants={iconVariants}
          >
            <motion.span
              animate={isUnavailable ? "rest" : interaction.visualPhase}
              className="inline-grid place-items-center"
              data-slot="icon-button-semantic-icon"
              initial={false}
              variants={semanticIconVariants}
            >
              {children}
            </motion.span>
          </motion.span>
        </motion.span>
      </span>
      <AnimatePresence initial={false}>
        {loading ? (
          <motion.span
            animate="loading"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 grid place-items-center"
            data-slot="icon-button-loader"
            exit="idle"
            initial="idle"
            key="icon-button-loader"
            variants={loaderVariants}
          >
            <IconLoader2 className="animate-spin motion-reduce:animate-none" />
          </motion.span>
        ) : null}
      </AnimatePresence>
    </ButtonPrimitive>
  )
}

function IconButton(props: IconButtonProps) {
  return <IconButtonRoot {...props} />
}

export { IconButton, IconButtonRoot }
