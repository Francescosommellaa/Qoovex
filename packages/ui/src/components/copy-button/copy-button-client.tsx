"use client"

import { IconAlertCircle, IconCheck, IconCopy } from "@tabler/icons-react"
import { motion, useReducedMotion } from "motion/react"
import * as React from "react"

import type { IconButtonProps } from "../icon-button"
import { IconButtonRoot } from "../icon-button/icon-button-client"
import { readIconButtonMotion } from "../icon-button/icon-button-motion"

const COPY_FEEDBACK_HOLD_MS = 1000

type CopyButtonState = "idle" | "copying" | "success" | "error"

type AccessibleName =
  | { "aria-label": string; "aria-labelledby"?: string }
  | { "aria-label"?: string; "aria-labelledby": string }

type CopyButtonBaseProps = Omit<
  IconButtonProps,
  | "aria-label"
  | "aria-labelledby"
  | "aria-busy"
  | "children"
  | "focusableWhenDisabled"
  | "loading"
  | "onClick"
  | "size"
  | "style"
  | "type"
  | "value"
  | "variant"
> & {
  value: string
}

export type CopyButtonProps = CopyButtonBaseProps & AccessibleName

function CopyButton({ disabled, value, ...props }: CopyButtonProps) {
  const systemReducedMotion = Boolean(useReducedMotion())
  const [reducedMotion, setReducedMotion] = React.useState(false)
  const [copyState, setCopyState] = React.useState<CopyButtonState>("idle")
  const mountedRef = React.useRef(true)
  const copyingRef = React.useRef(false)
  const requestIdRef = React.useRef(0)
  const resetTimerRef = React.useRef<number | undefined>(undefined)

  React.useEffect(() => setReducedMotion(systemReducedMotion), [systemReducedMotion])
  React.useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      requestIdRef.current += 1
      if (resetTimerRef.current !== undefined) window.clearTimeout(resetTimerRef.current)
    }
  }, [])

  const actionMotion = React.useMemo(() => readIconButtonMotion(reducedMotion), [reducedMotion])
  const isCopying = copyState === "copying"
  const visualState = copyState === "success" ? "success" : copyState === "error" ? "error" : "copy"
  const statusMessage = copyState === "success"
    ? "Copiato negli appunti"
    : copyState === "error"
      ? "Copia non riuscita. Riprova."
      : ""

  const copy = React.useCallback(async () => {
    if (disabled || copyingRef.current) return

    copyingRef.current = true
    const requestId = ++requestIdRef.current
    if (resetTimerRef.current !== undefined) window.clearTimeout(resetTimerRef.current)
    setCopyState("copying")

    try {
      const clipboard = typeof navigator === "undefined" ? undefined : navigator.clipboard
      if (!clipboard?.writeText) throw new Error("Clipboard API unavailable")
      await clipboard.writeText(value)
      if (!mountedRef.current || requestId !== requestIdRef.current) return
      copyingRef.current = false
      setCopyState("success")
    } catch {
      if (!mountedRef.current || requestId !== requestIdRef.current) return
      copyingRef.current = false
      setCopyState("error")
    }

    if (!mountedRef.current || requestId !== requestIdRef.current) return
    resetTimerRef.current = window.setTimeout(() => {
      if (!mountedRef.current || requestId !== requestIdRef.current) return
      setCopyState("idle")
      resetTimerRef.current = undefined
    }, COPY_FEEDBACK_HOLD_MS)
  }, [disabled, value])

  const iconTarget = (state: "copy" | "success" | "error") => {
    const visible = visualState === state
    return {
      opacity: visible ? (isCopying && state === "copy" ? 0.62 : 1) : 0,
      scale: reducedMotion ? 1 : visible ? 1 : state === "success" ? 0.72 : 0.82,
      transition: reducedMotion
        ? actionMotion.state
        : visible && state === "success"
          ? actionMotion.settle
          : actionMotion.state,
    }
  }

  return (
    <>
      <IconButtonRoot
        {...props}
        aria-busy={isCopying || undefined}
        data-copy-state={copyState}
        data-slot="copy-button"
        disabled={Boolean(disabled || isCopying)}
        focusableWhenDisabled={isCopying}
        onClick={copy}
        size="sm"
        type="button"
        variant="ghost"
      >
        <span
          className="relative inline-grid size-[var(--icon)] place-items-center"
          data-slot="copy-button-icon-stage"
        >
          <motion.span
            animate={iconTarget("copy")}
            className="absolute inset-0 inline-grid place-items-center"
            data-slot="copy-button-icon-copy"
            initial={false}
          >
            <IconCopy aria-hidden="true" />
          </motion.span>
          <motion.span
            animate={iconTarget("success")}
            className="absolute inset-0 inline-grid place-items-center"
            data-slot="copy-button-icon-success"
            initial={false}
          >
            <IconCheck aria-hidden="true" />
          </motion.span>
          <motion.span
            animate={iconTarget("error")}
            className="absolute inset-0 inline-grid place-items-center text-destructive"
            data-slot="copy-button-icon-error"
            initial={false}
          >
            <IconAlertCircle aria-hidden="true" />
          </motion.span>
        </span>
      </IconButtonRoot>
      <span aria-atomic="true" aria-live="polite" className="sr-only" data-slot="copy-button-status" role="status">
        {statusMessage}
      </span>
    </>
  )
}

export { COPY_FEEDBACK_HOLD_MS, CopyButton }
