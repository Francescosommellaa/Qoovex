"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { type VariantProps } from "class-variance-authority"
import { motion } from "motion/react"
import * as React from "react"

import { cn } from "#lib/utils"
import { PREFERS_REDUCED_MOTION_QUERY } from "#lib/motion"
import { useActionInteraction } from "../action-interaction"
import { IconActionInteractionProvider, readIconActionIntent } from "../icon-action/icon-action-client"
import { Spinner } from "../spinner"
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
    loading?: boolean
  }) {
  const [reducedMotion, setReducedMotion] = React.useState(false)
  React.useEffect(() => {
    const media = window.matchMedia(PREFERS_REDUCED_MOTION_QUERY)
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])
  const buttonMotion = React.useMemo(
    () => readButtonMotion(reducedMotion),
    [reducedMotion]
  )
  const resolvedVariant = (variant ?? "default") as ButtonVariant
  const iconIntent = readIconActionIntent(children)
  const isUnavailable = Boolean(disabled || loading)
  const magneticStyle = {
    translate: isUnavailable || reducedMotion ? "0px 0px" : "var(--action-magnetic-x, 0px) var(--action-magnetic-y, 0px)",
    transition: reducedMotion ? "none" : "translate var(--motion-duration-feedback) var(--ease-standard)",
  }
  const interaction = useActionInteraction(isUnavailable)
  const surfaceVariants = React.useMemo(
    () => getButtonSurfaceVariants(resolvedVariant, reducedMotion, buttonMotion, iconIntent),
    [buttonMotion, iconIntent, reducedMotion, resolvedVariant]
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
        style={magneticStyle}
        variants={surfaceVariants}
      />
      <motion.span
        className="inline-grid max-w-full min-w-0 origin-center items-center justify-items-center gap-[inherit]"
        data-slot="button-motion-content"
        style={magneticStyle}
        variants={contentVariants}
      >
        <motion.span
          animate={loading ? "loading" : "idle"}
          className="col-start-1 row-start-1 inline-flex max-w-full min-w-0 items-center justify-center gap-[inherit]"
          data-slot="button-label"
          initial={false}
          variants={labelVariants}
        >
          <IconActionInteractionProvider phase={isUnavailable || reducedMotion ? "rest" : interaction.visualPhase}>
            {children}
          </IconActionInteractionProvider>
        </motion.span>
        <motion.span
          animate={loading ? "loading" : "idle"}
          aria-hidden="true"
          className="pointer-events-none col-start-1 row-start-1 inline-grid place-items-center"
          data-slot="button-loader"
          initial={false}
          variants={loaderVariants}
        >
          {loading ? <Spinner aria-hidden="true" size="xs" variant="hexagon" /> : null}
        </motion.span>
      </motion.span>
    </ButtonPrimitive>
  )
}

export { Button }
