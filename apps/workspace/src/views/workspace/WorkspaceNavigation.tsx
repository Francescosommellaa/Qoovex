"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { PlatformRole, SupportContext } from "@qoovex/types";
import { Badge } from "@qoovex/ui/components/badge";
import {
  SidebarCollapseButton,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@qoovex/ui/components/sidebar";
import {
  IconBuildingEstate,
  IconBriefcase,
  IconCrane,
  IconDashboard,
  IconShieldLock,
  IconTerminal2,
  IconUserCircle,
  IconUsers,
  IconAlertTriangle,
  IconBuilding,
  IconGavel,
} from "@tabler/icons-react";
import { WorkspaceLogoutButton } from "./WorkspaceSessionControls";
import { isWorkspaceNavigationItemCurrent, organizationPrimaryNavigation, type WorkspaceNavigationItem, type WorkspaceNavigationModel } from "./workspace-navigation-policy";

/* ─── Icon map ─────────────────────────────────────────────────── */

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  /* Platform admin */
  "/qoovex-admin": IconTerminal2,
  "/qoovex-admin/users": IconUsers,
  "/qoovex-admin/organizations": IconBuilding,
  "/qoovex-admin/errors": IconAlertTriangle,
  /* Organization */
  "Panoramica": IconDashboard,
  "Cantieri": IconCrane,
  /* Client */
  "I tuoi lavori": IconBriefcase,
  "Account e dati": IconUserCircle,
  /* Account footer */
  "Console supporto": IconShieldLock,
  "Console Qoovex": IconTerminal2,
  "Azienda e impostazioni": IconBuildingEstate,
  "Account e sicurezza": IconUserCircle,
};

const platformItems: readonly WorkspaceNavigationItem[] = [
  { label: "Panoramica", href: "/qoovex-admin" },
  { label: "Utenti", href: "/qoovex-admin/users" },
  { label: "Aziende", href: "/qoovex-admin/organizations" },
  { label: "Errori", href: "/qoovex-admin/errors" },
];

const platformIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "Panoramica": IconDashboard,
  "Utenti": IconUsers,
  "Aziende": IconBuilding,
  "Errori": IconAlertTriangle,
};

function resolveIcon(item: { label: string; href: string }): React.ComponentType<{ className?: string }> {
  return iconMap[item.label] ?? iconMap[item.href] ?? platformIconMap[item.label] ?? IconGavel;
}

export interface WorkspaceNavigationProps {
  account: { email: string | null; organizationName: string | null };
  authenticated: boolean;
  navigation: WorkspaceNavigationModel;
  platformRole: PlatformRole | null;
  support: SupportContext | null;
}

export function WorkspaceNavigation({ account, authenticated, navigation, platformRole, support }: WorkspaceNavigationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const platformOnly = (platformRole === "SUPPORT_AGENT" || platformRole === "PLATFORM_ADMIN") && !support;
  const hasOrganizationContext = Boolean(account.organizationName) && !pathname.startsWith("/client");
  const accountItems: readonly WorkspaceNavigationItem[] = pathname.startsWith("/client") ? [{ label: "Account e dati", href: "/account/security" }] : navigation.account;
  const contextItems: readonly WorkspaceNavigationItem[] = hasOrganizationContext ? organizationPrimaryNavigation : pathname.startsWith("/client") ? [
    { label: "I tuoi lavori", href: "/client" },
  ] : navigation.primary;
  const primary = platformOnly ? platformItems : contextItems;

  return (
    <>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{platformOnly ? "Piattaforma" : hasOrganizationContext ? "Azienda" : pathname.startsWith("/client") ? "Cliente" : "Qoovex"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primary.map((item) => {
                const Icon = resolveIcon(item);
                const isActive = isWorkspaceNavigationItemCurrent(pathname, searchParams, item.href, item.activePaths);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton render={<Link aria-current={isActive ? "page" : undefined} href={item.href} />} isActive={isActive} tooltip={item.label}>
                      <Icon className="size-4 shrink-0" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {!platformOnly && navigation.actions.length ? (
          <SidebarGroup>
            <SidebarGroupLabel>Azioni</SidebarGroupLabel>
            <SidebarGroupContent><SidebarMenu>{navigation.actions.map((item) => {
              const Icon = resolveIcon(item);
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton render={<Link href={item.href} />} tooltip={item.label}>
                    <Icon className="size-4 shrink-0" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}</SidebarMenu></SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>

      <SidebarFooter>
        {!platformOnly && accountItems.length ? (
          <>
            <SidebarSeparator />
            <SidebarMenu>
              {accountItems.map((item) => {
                const Icon = resolveIcon(item);
                const isActive = isWorkspaceNavigationItemCurrent(pathname, searchParams, item.href, item.activePaths);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton render={<Link aria-current={isActive ? "page" : undefined} href={item.href} />} isActive={isActive} size="sm" tooltip={item.label}>
                      <Icon className="size-4 shrink-0" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </>
        ) : null}
        <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/30 p-2.5 text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
          <div className="truncate font-semibold text-sidebar-foreground">{account.organizationName ?? "Qoovex"}</div>
          <div className="truncate mt-0.5">{account.email}</div>
          {support ? <Badge variant="outline" className="mt-1.5">Supporto attivo</Badge> : null}
        </div>
        {authenticated ? <WorkspaceLogoutButton /> : null}
      </SidebarFooter>
    </>
  );
}
