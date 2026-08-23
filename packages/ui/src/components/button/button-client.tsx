"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { IconLoader2 } from "@tabler/icons-react"
import { type VariantProps } from "class-variance-authority"
import { motion, useReducedMotion, type Transition, type Variants } from "motion/react"
import * as React from "react"

import { resolveMotionTransition } from "#lib/motion"
import { cn } from "#lib/utils"
import { buttonVariants } from "./button-variants"

type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>
type ButtonMotion = Readonly<{ feedback: Transition }>

const immediateButtonMotion: ButtonMotion = Object.freeze({
  feedback: { duration: 0 },
})
const buttonInteractionScale: Readonly<
  Record<ButtonVariant, Readonly<{ hover: number; pressed: number }>>
> = Object.freeze({
    default: { hover: 1.01, pressed: 0.98 },
    outline: { hover: 1.01, pressed: 0.98 },
    secondary: { hover: 1.01, pressed: 0.98 },
    ghost: { hover: 1, pressed: 0.985 },
    destructive: { hover: 1, pressed: 0.985 },
    link: { hover: 1, pressed: 1 },
  })

function readButtonMotion(): ButtonMotion {
  if (typeof window === "undefined") return immediateButtonMotion
  return {
    feedback: resolveMotionTransition(
      window.getComputedStyle(document.documentElement),
      "feedback"
    ),
  }
}

function getButtonMotionVariants(
  variant: ButtonVariant,
  reducedMotion: boolean,
  buttonMotion: ButtonMotion
): Variants {
  const scale = buttonInteractionScale[variant]
  const transition = reducedMotion ? immediateButtonMotion.feedback : buttonMotion.feedback
  return {
    rest: { scale: 1, transition },
    hover: { scale: reducedMotion ? 1 : scale.hover, transition },
    pressed: { scale: reducedMotion ? 1 : scale.pressed, transition },
  }
}

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
  children,
  nativeButton,
  render,
  ...props
}: ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean
  }) {
  const reducedMotion = useReducedMotion()
  const [interactionPhase, setInteractionPhase] = React.useState<
    "rest" | "hover" | "pressed"
  >("rest")
  const [resolvedButtonMotion] = React.useState(readButtonMotion)
  const resolvedVariant = variant ?? "default"
  const buttonMotion = reducedMotion ? immediateButtonMotion : resolvedButtonMotion
  const motionVariants = React.useMemo(
    () => getButtonMotionVariants(resolvedVariant, Boolean(reducedMotion), buttonMotion),
    [buttonMotion, reducedMotion, resolvedVariant]
  )
  const isUnavailable = Boolean(disabled || loading)
  const resolvedInteractionPhase = isUnavailable || reducedMotion ? "rest" : interactionPhase

  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={resolvedVariant}
      data-loading={loading ? "true" : undefined}
      aria-busy={loading ? true : ariaBusy}
      disabled={isUnavailable}
      focusableWhenDisabled={loading ? true : focusableWhenDisabled}
      className={cn(buttonVariants({ variant: resolvedVariant, size, className }))}
      nativeButton={nativeButton ?? (render ? rendersNativeButton(render) : true)}
      render={
        render ??
        ((rootProps, state) => {
          const motionRootProps = rootProps as React.ComponentProps<
            typeof motion.button
          >
          return (
            <motion.button
              {...motionRootProps}
              animate={resolvedInteractionPhase}
              initial={false}
              onHoverStart={
                state.disabled ? undefined : () => setInteractionPhase("hover")
              }
              onHoverEnd={
                state.disabled ? undefined : () => setInteractionPhase("rest")
              }
              onTapStart={
                state.disabled ? undefined : () => setInteractionPhase("pressed")
              }
              onTap={
                state.disabled ? undefined : () => setInteractionPhase("rest")
              }
              onTapCancel={
                state.disabled ? undefined : () => setInteractionPhase("rest")
              }
              onPointerLeave={(event) => {
                motionRootProps.onPointerLeave?.(event)
                if (!state.disabled) setInteractionPhase("rest")
              }}
              onPointerCancel={(event) => {
                motionRootProps.onPointerCancel?.(event)
                if (!state.disabled) setInteractionPhase("rest")
              }}
              onPointerMove={(event) => {
                motionRootProps.onPointerMove?.(event)
                if (state.disabled || event.buttons === 0) return

                const bounds = event.currentTarget.getBoundingClientRect()
                const isInside =
                  event.clientX >= bounds.left &&
                  event.clientX <= bounds.right &&
                  event.clientY >= bounds.top &&
                  event.clientY <= bounds.bottom
                setInteractionPhase(isInside ? "pressed" : "rest")
              }}
            />
          )
        })
      }
      {...props}
    >
      <motion.span
        data-slot="button-motion-content"
        className={cn(
          "inline-flex max-w-full min-w-0 origin-center items-center justify-center gap-[inherit]",
          loading && "opacity-0"
        )}
        variants={motionVariants}
      >
        {children}
      </motion.span>
      {loading ? (
        <IconLoader2
          data-slot="button-loader"
          aria-hidden="true"
          className="absolute animate-spin motion-reduce:animate-none"
        />
      ) : null}
    </ButtonPrimitive>
  )
}

export { Button }
