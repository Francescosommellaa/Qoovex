"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

const WORKSPACE_ROUTES = [
  "/dashboard",
  "/recipes",
  "/menus",
  "/shopping-list",
  "/work-plans",
  "/explore",
  "/notifications",
  "/settings",
] as const;

export function WorkspaceRoutePrefetcher() {
  const router = useRouter();

  React.useEffect(() => {
    function prefetchRoutes() {
      for (const route of WORKSPACE_ROUTES) {
        router.prefetch(route);
      }
    }

    if (typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(prefetchRoutes);
      return () => window.cancelIdleCallback?.(idleId);
    }

    const timeoutId = globalThis.setTimeout(prefetchRoutes, 1_000);
    return () => globalThis.clearTimeout(timeoutId);
  }, [router]);

  return null;
}
