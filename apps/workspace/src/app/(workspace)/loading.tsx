"use client";

import { usePathname } from "next/navigation";
import { WorkspaceBrandLoader, WorkspaceRouteSkeleton } from "@shared/ui";

function getSkeletonVariant(pathname: string) {
  if (pathname === "/dashboard") return "dashboard";
  if (pathname.endsWith("/new") || pathname.endsWith("/edit")) return "form";
  if (/\/(recipes|menus|shopping-list|work-plans)\/[^/]+$/.test(pathname)) {
    return "detail";
  }

  return "collection";
}

export default function WorkspaceLoading() {
  const pathname = usePathname();

  return (
    <>
      <WorkspaceRouteSkeleton variant={getSkeletonVariant(pathname)} />
      <WorkspaceBrandLoader
        fullscreen
        delayedMs={600}
        label="Caricamento workspace..."
      />
    </>
  );
}
