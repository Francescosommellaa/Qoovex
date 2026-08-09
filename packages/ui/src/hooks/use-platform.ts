"use client"

import * as React from "react"

export type PlatformType = "mac" | "windows" | "mobile"

export function usePlatform(): PlatformType {
  const [platform, setPlatform] = React.useState<PlatformType>("windows")

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const ua = navigator.userAgent || ""
    const isTouchOrSmall =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
      window.innerWidth < 768

    if (isTouchOrSmall) {
      setPlatform("mobile")
      return
    }

    const platformString = (navigator as unknown as { userAgentData?: { platform?: string } }).userAgentData?.platform || navigator.platform || ua
    const isMac = /Mac|iPod|iPhone|iPad/i.test(platformString)

    setPlatform(isMac ? "mac" : "windows")
  }, [])

  return platform
}
