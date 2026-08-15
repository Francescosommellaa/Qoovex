"use client"

import * as React from "react"

export type PlatformType = "mac" | "windows" | "mobile"

export function usePlatform(): PlatformType {
  const [platform, setPlatform] = React.useState<PlatformType>("windows")

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const touchPrimary = window.matchMedia("(hover: none) and (pointer: coarse)")
    const updatePlatform = () => {
      if (touchPrimary.matches) {
        setPlatform("mobile")
        return
      }
      const platformString =
        (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ||
        navigator.platform ||
        ""
      setPlatform(/Mac|iPod|iPhone|iPad/i.test(platformString) ? "mac" : "windows")
    }

    touchPrimary.addEventListener("change", updatePlatform)
    updatePlatform()
    return () => touchPrimary.removeEventListener("change", updatePlatform)
  }, [])

  return platform
}
