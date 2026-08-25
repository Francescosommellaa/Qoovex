"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { IconLoader2 } from "@tabler/icons-react"
import { type VariantProps } from "class-variance-authority"
import { motion, useReducedMotion } from "motion/react"
import * as React from "react"

import { cn } from "#lib/utils"
import {
  getActionIconVariants,
  type ActionIconMotionIntent,
} from "../action-icon-motion"
import { useActionInteraction } from "../action-interaction"
import {
  getButtonContentVariants,
  getButtonSurfaceVariants,
  getLoadingContentVariants,
  readButtonMotion,
  type ButtonVariant,
} from "./button-motion"
import { buttonVariants } from "./button-variants"

function rendersNativeButton(render: ButtonPrimitive.Props["render"]) {
  return React.isValidElement(render) && render.type === "button"
}

function Button({
  className,
  variant = "default",
  size = "default",
  loading = false,
  iconMotion = "neutral",
  disabled,
  focusableWhenDisabled,
  "aria-busy": ariaBusy,
  "aria-expanded": expanded,
  children,
  nativeButton,
  render,
  ...props
}: ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    iconMotion?: ActionIconMotionIntent
    loading?: boolean
  }) {
  const systemReducedMotion = Boolean(useReducedMotion())
  const [reducedMotion, setReducedMotion] = React.useState(false)
  React.useEffect(() => setReducedMotion(systemReducedMotion), [systemReducedMotion])
  const buttonMotion = React.useMemo(
    () => readButtonMotion(reducedMotion),
    [reducedMotion]
  )
  const resolvedVariant = (variant ?? "default") as ButtonVariant
  const isUnavailable = Boolean(disabled || loading)
  const interaction = useActionInteraction(isUnavailable)
  const surfaceVariants = React.useMemo(
    () => getButtonSurfaceVariants(resolvedVariant, reducedMotion, buttonMotion),
    [buttonMotion, reducedMotion, resolvedVariant]
  )
  const contentVariants = React.useMemo(
    () => getButtonContentVariants(reducedMotion, buttonMotion),
    [buttonMotion, reducedMotion]
  )
  const labelVariants = React.useMemo(
    () => getLoadingContentVariants(reducedMotion, buttonMotion, "content"),
    [buttonMotion, reducedMotion]
  )
  const loaderVariants = React.useMemo(
    () => getLoadingContentVariants(reducedMotion, buttonMotion, "loader"),
    [buttonMotion, reducedMotion]
  )
  const iconVariants = React.useMemo(
    () => getActionIconVariants(iconMotion, expanded === true, reducedMotion, buttonMotion),
    [buttonMotion, expanded, iconMotion, reducedMotion]
  )

  const content = React.Children.map(children, (child) => {
    if (!React.isValidElement<Record<string, unknown>>(child) || !("data-icon" in child.props)) return child

    return (
      <motion.span
        animate={isUnavailable ? "rest" : interaction.visualPhase}
        className="inline-grid shrink-0 place-items-center"
        data-icon-motion={iconMotion}
        initial={false}
        variants={iconVariants}
      >
        {child}
      </motion.span>
    )
  })

  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={resolvedVariant}
      data-loading={loading ? "true" : undefined}
      data-availability={disabled ? "disabled" : loading ? "loading" : undefined}
      aria-busy={loading ? true : ariaBusy}
      aria-expanded={expanded}
      disabled={isUnavailable}
      focusableWhenDisabled={loading ? true : focusableWhenDisabled}
      className={cn(buttonVariants({ variant: resolvedVariant, size, className }))}
      nativeButton={nativeButton ?? (render ? rendersNativeButton(render) : true)}
      render={
        render ??
        ((rootProps, state) => {
          const motionRootProps = rootProps as React.ComponentProps<typeof motion.button>
          return (
            <motion.button
              {...motionRootProps}
              animate={state.disabled ? "rest" : interaction.visualPhase}
              initial={false}
              onTapStart={state.disabled ? undefined : interaction.beginPress}
              onTap={state.disabled ? undefined : interaction.settle}
              onTapCancel={state.disabled ? undefined : interaction.settle}
              onBlur={(event) => {
                motionRootProps.onBlur?.(event)
                interaction.reset()
              }}
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
              onPointerEnter={(event) => {
                motionRootProps.onPointerEnter?.(event)
                if (!state.disabled && event.pointerType !== "touch") {
                  interaction.beginHover(event.buttons)
                }
              }}
              onPointerLeave={(event) => {
                motionRootProps.onPointerLeave?.(event)
                if (!state.disabled) {
                  interaction.reset()
                }
              }}
              onPointerCancel={(event) => {
                motionRootProps.onPointerCancel?.(event)
                if (!state.disabled) {
                  interaction.reset()
                }
              }}
            />
          )
        })
      }
      {...props}
    >
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px -z-10 origin-center rounded-[inherit] border border-[var(--button-border)] bg-[var(--button-surface)] forced-colors:border-[ButtonBorder] forced-colors:bg-[ButtonFace]"
        data-slot="button-motion-surface"
        variants={surfaceVariants}
      />
      <motion.span
        className="inline-grid max-w-full min-w-0 origin-center items-center justify-items-center"
        data-slot="button-motion-content"
        variants={contentVariants}
      >
        <motion.span
          animate={loading ? "loading" : "idle"}
          className="col-start-1 row-start-1 inline-flex max-w-full min-w-0 items-center justify-center gap-[inherit]"
          data-slot="button-label"
          initial={false}
          variants={labelVariants}
        >
          {content}
        </motion.span>
        <motion.span
          animate={loading ? "loading" : "idle"}
          aria-hidden="true"
          className="pointer-events-none col-start-1 row-start-1 inline-grid place-items-center"
          data-slot="button-loader"
          initial={false}
          variants={loaderVariants}
        >
          <IconLoader2 className={cn(loading && "animate-spin", "motion-reduce:animate-none")} />
        </motion.span>
      </motion.span>
    </ButtonPrimitive>
  )
}

export { Button }
