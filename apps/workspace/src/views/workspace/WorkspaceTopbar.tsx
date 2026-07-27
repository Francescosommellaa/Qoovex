"use client";

import { IconShieldLock } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { Badge } from "@qoovex/ui/components/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@qoovex/ui/components/breadcrumb";
import { Separator } from "@qoovex/ui/components/separator";
import { SidebarCollapseButton, SidebarTrigger } from "@qoovex/ui/components/sidebar";
import { ThemeToggle } from "@qoovex/ui/components/theme-toggle";
import { WorkspaceNotificationsPanel } from "./WorkspaceNotificationsPanel";
import {
  parseRecentWorkspacePages,
  pushRecentWorkspacePage,
  RECENT_WORKSPACE_PAGES_STORAGE_KEY,
  resolveWorkspacePageLabel,
  type WorkspaceRecentPage,
} from "./workspace-navigation-history";
import type { WorkspaceNavigationItem } from "./workspace-navigation-policy";
import { useWorkspacePageIdentity } from "./WorkspacePageIdentity";

export function WorkspaceTopbar({
  fallbackLabel,
  isSuperAdmin,
  navigation,
  showNotifications,
  unreadNotificationCount,
}: {
  fallbackLabel: string;
  isSuperAdmin: boolean;
  navigation: readonly WorkspaceNavigationItem[];
  showNotifications: boolean;
  unreadNotificationCount: number;
}) {
  const pathname = usePathname() ?? "";
  const identityLabel = useWorkspacePageIdentity(pathname);
  const pageLabel = identityLabel ?? resolveWorkspacePageLabel(pathname, navigation, fallbackLabel);
  const currentPage = { href: pathname || "/dashboard", label: pageLabel };
  const [recentPages, setRecentPages] = useState<WorkspaceRecentPage[]>([currentPage]);
  const displayedPages = recentPages.at(-1)?.href === currentPage.href
    ? recentPages
    : pushRecentWorkspacePage(recentPages, currentPage);

  useEffect(() => {
    const stored = parseRecentWorkspacePages(window.sessionStorage.getItem(RECENT_WORKSPACE_PAGES_STORAGE_KEY));
    const next = pushRecentWorkspacePage(stored, { href: pathname || "/dashboard", label: pageLabel });
    setRecentPages(next);
    try {
      window.sessionStorage.setItem(RECENT_WORKSPACE_PAGES_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // The current breadcrumb remains available if session storage is disabled.
    }
  }, [pageLabel, pathname]);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/90 px-3 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75 sm:px-4">
      <SidebarTrigger aria-label="Apri navigazione" className="md:hidden" />
      <SidebarCollapseButton className="hidden md:flex" iconOnly />
      <Separator className="hidden h-4 md:block" orientation="vertical" />
      <Breadcrumb aria-label="Pagine recenti" className="hidden min-w-0 flex-1 md:block">
        <BreadcrumbList className="flex-nowrap overflow-hidden">
          {displayedPages.map((page, index) => {
            const current = index === displayedPages.length - 1;
            return (
              <Fragment key={page.href}>
                {index > 0 ? <BreadcrumbSeparator className="shrink-0" /> : null}
                <BreadcrumbItem className="min-w-0">
                  {current ? (
                    <BreadcrumbPage className="max-w-48 truncate">{page.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      className="max-w-40 truncate"
                      data-link="plain"
                      render={<Link href={page.href} />}
                    >
                      {page.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
      <Breadcrumb aria-label="Navigazione mobile" className="min-w-0 flex-1 md:hidden">
        <BreadcrumbList className="flex-nowrap">
          <BreadcrumbItem>
            {pathname === "/dashboard" ? (
              <BreadcrumbPage>Centro operativo</BreadcrumbPage>
            ) : (
              <BreadcrumbLink data-link="plain" render={<Link href="/dashboard" />}>Centro operativo</BreadcrumbLink>
            )}
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex shrink-0 items-center gap-1">
        {showNotifications ? (
          <WorkspaceNotificationsPanel unreadNotificationCount={unreadNotificationCount} />
        ) : null}
        {isSuperAdmin ? <Badge className="hidden sm:inline-flex" variant="outline">Operatore Qoovex</Badge> : null}
        {fallbackLabel === "Sicurezza account" ? <IconShieldLock aria-hidden="true" className="mx-1 size-4 text-muted-foreground" /> : null}
        <ThemeToggle />
      </div>
    </header>
  );
}
