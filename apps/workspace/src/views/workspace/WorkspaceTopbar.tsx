"use client";
import { IconShieldLock } from "@tabler/icons-react";
import type { DevWorkspaceView, PlatformRole } from "@qoovex/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@qoovex/ui/components/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from "@qoovex/ui/components/breadcrumb";
import { Separator } from "@qoovex/ui/components/separator";
import { SidebarCollapseButton, SidebarTrigger } from "@qoovex/ui/components/sidebar";
import { ThemeToggle } from "@qoovex/ui/components/theme-toggle";
import { WorkspaceNotificationsPanel } from "./WorkspaceNotificationsPanel";
import type { WorkspaceNavigationItem } from "./workspace-navigation-policy";
import { useWorkspacePageIdentity } from "./WorkspacePageIdentity";
import { DevViewSwitcher } from "./DevViewSwitcher";

export function WorkspaceTopbar({ fallbackLabel, platformRole, devView, navigation, showNotifications, unreadNotificationCount }: { fallbackLabel: string; platformRole: PlatformRole; devView: DevWorkspaceView | null; navigation: readonly WorkspaceNavigationItem[]; showNotifications: boolean; unreadNotificationCount: number }) {
  const pathname = usePathname() ?? "";
  const configured = navigation.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const pageLabel = useWorkspacePageIdentity(pathname) ?? configured?.label ?? fallbackLabel;
  return <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/90 px-3 backdrop-blur-xl sm:px-4">
    <SidebarTrigger aria-label="Apri navigazione" className="md:hidden" /><SidebarCollapseButton className="hidden md:flex" iconOnly /><Separator className="hidden h-4 md:block" orientation="vertical" />
    <Breadcrumb className="min-w-0 flex-1"><BreadcrumbList><BreadcrumbItem>{pathname === "/contexts" ? <BreadcrumbPage>{pageLabel}</BreadcrumbPage> : <BreadcrumbLink render={<Link href="/contexts" />}>Contesti</BreadcrumbLink>}</BreadcrumbItem>{pathname !== "/contexts" ? <BreadcrumbItem><BreadcrumbPage>{pageLabel}</BreadcrumbPage></BreadcrumbItem> : null}</BreadcrumbList></Breadcrumb>
    <div className="ml-auto flex items-center gap-1">{showNotifications ? <WorkspaceNotificationsPanel unreadNotificationCount={unreadNotificationCount} /> : null}{platformRole !== "USER" ? <Badge variant="outline"><IconShieldLock className="size-3" />{platformRole === "PLATFORM_ADMIN" ? "Admin" : "Supporto"}</Badge> : null}{devView ? <DevViewSwitcher view={devView} /> : null}<ThemeToggle /></div>
  </header>;
}
