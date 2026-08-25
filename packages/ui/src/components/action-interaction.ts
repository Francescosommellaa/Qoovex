"use client"

import * as React from "react"

export type ActionVisualPhase = "rest" | "hover" | "pressed"

export function useActionInteraction(isUnavailable: boolean) {
  const [visualPhase, setVisualPhase] = React.useState<ActionVisualPhase>("rest")
  const isHoveringRef = React.useRef(false)

  React.useEffect(() => {
    if (isUnavailable) {
      isHoveringRef.current = false
      setVisualPhase("rest")
    }
  }, [isUnavailable])

  const beginHover = React.useCallback((buttons = 0) => {
    isHoveringRef.current = true
    setVisualPhase((buttons & 1) === 1 ? "pressed" : "hover")
  }, [])

  const beginPress = React.useCallback(() => setVisualPhase("pressed"), [])

  const settle = React.useCallback(() => {
    setVisualPhase(isHoveringRef.current ? "hover" : "rest")
  }, [])

  const reset = React.useCallback(() => {
    isHoveringRef.current = false
    setVisualPhase("rest")
  }, [])

  return { beginHover, beginPress, reset, settle, visualPhase }
}
