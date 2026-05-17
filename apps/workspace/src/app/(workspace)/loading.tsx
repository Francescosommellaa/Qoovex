"use client";

import { usePathname } from "next/navigation";
import { WorkspaceRouteSkeleton } from "@shared/ui";

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

  return <WorkspaceRouteSkeleton variant={getSkeletonVariant(pathname)} />;
}
