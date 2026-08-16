"use client";
import { IconChevronLeft, IconShieldLock } from "@tabler/icons-react";
import type { DevWorkspaceView, PlatformRole } from "@qoovex/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@qoovex/ui/components/badge";
import { Breadcrumb, type BreadcrumbItemSpec } from "@qoovex/ui/components/breadcrumb";
import { Separator } from "@qoovex/ui/components/separator";
import { SidebarCollapseButton, SidebarTrigger } from "@qoovex/ui/components/sidebar";
import { Topbar, TopbarEnd } from "@qoovex/ui/components/topbar";
import { ThemeToggle } from "@qoovex/ui/components/theme-toggle";
import { WorkspaceNotificationsPanel } from "./WorkspaceNotificationsPanel";
import type { WorkspaceNavigationItem } from "./workspace-navigation-policy";
import { useWorkspacePageIdentity } from "./WorkspacePageIdentity";
import { buildWorkspaceBreadcrumb } from "./workspace-breadcrumb-policy";
import { DevViewSwitcher } from "./DevViewSwitcher";
import * as React from "react";

export function WorkspaceTopbar({ fallbackLabel, platformRole, devView, navigation, showNotifications, unreadNotificationCount }: { fallbackLabel: string; platformRole: PlatformRole; devView: DevWorkspaceView | null; navigation: readonly WorkspaceNavigationItem[]; showNotifications: boolean; unreadNotificationCount: number }) {
  const pathname = usePathname() ?? "";
  const configured = navigation.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const identity = useWorkspacePageIdentity(pathname);
  const pageLabel = identity.label ?? configured?.label ?? null;

  const breadcrumbItems: BreadcrumbItemSpec[] = React.useMemo(() => {
    return buildWorkspaceBreadcrumb({ fallbackLabel, pageLabel, pathname, sectionLabel: identity.sectionLabel }).map((item) => {
      const responsiveLabel = item.mobileLabel ? <><span className="hidden sm:inline">{item.label}</span><span className="sm:hidden">{item.mobileLabel}</span></> : item.mobileBehavior === "back" ? <span className="max-sm:sr-only">{item.label}</span> : item.label;
      return {
        ...item,
        className: [item.className, item.mobileBehavior === "hidden" ? "max-sm:hidden" : null].filter(Boolean).join(" "),
        icon: item.mobileBehavior === "back" ? <IconChevronLeft aria-hidden="true" className="sm:hidden" /> : undefined,
        label: responsiveLabel,
        render: item.href ? <Link href={item.href} /> : undefined,
      };
    });
  }, [fallbackLabel, identity.sectionLabel, pageLabel, pathname]);

  return (
    <Topbar>
      <SidebarTrigger aria-label="Apri navigazione" className="md:hidden" />
      <SidebarCollapseButton className="hidden md:flex" iconOnly />
      <Separator className="hidden h-4 md:block" orientation="vertical" />
      <Breadcrumb aria-label="Percorso di navigazione" items={breadcrumbItems} className="min-w-0 flex-1" />
      <TopbarEnd>
        {showNotifications ? <WorkspaceNotificationsPanel unreadNotificationCount={unreadNotificationCount} /> : null}
        {platformRole !== "USER" ? (
          <Badge variant="outline">
            <IconShieldLock className="size-3" />
            {platformRole === "PLATFORM_ADMIN" ? "Admin" : "Supporto"}
          </Badge>
        ) : null}
        {devView ? <DevViewSwitcher view={devView} /> : null}
        <ThemeToggle />
      </TopbarEnd>
    </Topbar>
  );
}
