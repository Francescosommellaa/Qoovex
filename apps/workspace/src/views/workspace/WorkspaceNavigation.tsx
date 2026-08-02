"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { PlatformRole, SupportContext } from "@qoovex/types";
import { Badge } from "@qoovex/ui/components/badge";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@qoovex/ui/components/sidebar";
import { WorkspaceLogoutButton } from "./WorkspaceSessionControls";
import { isWorkspaceNavigationItemCurrent, type WorkspaceNavigationModel } from "./workspace-navigation-policy";

const platformItems = [
  { label: "Panoramica", href: "/qoovex-admin" },
  { label: "Utenti", href: "/qoovex-admin/users" },
  { label: "Aziende", href: "/qoovex-admin/organizations" },
  { label: "Errori", href: "/qoovex-admin/errors" },
] as const;

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
  const primary = platformOnly ? platformItems : navigation.primary;

  return (
    <>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{platformOnly ? "Piattaforma" : "Foundation"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primary.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton render={<Link href={item.href} />} isActive={isWorkspaceNavigationItemCurrent(pathname, searchParams, item.href)}>
                    {item.label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {!platformOnly && navigation.actions.length ? (
          <SidebarGroup>
            <SidebarGroupLabel>Azioni</SidebarGroupLabel>
            <SidebarGroupContent><SidebarMenu>{navigation.actions.map((item) => (
              <SidebarMenuItem key={item.href}><SidebarMenuButton render={<Link href={item.href} />}>{item.label}</SidebarMenuButton></SidebarMenuItem>
            ))}</SidebarMenu></SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>
      <SidebarFooter>
        {!platformOnly && navigation.account.length ? <SidebarMenu>{navigation.account.map((item) => <SidebarMenuItem key={item.href}><SidebarMenuButton render={<Link href={item.href} />}>{item.label}</SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu> : null}
        <div className="space-y-2 rounded-lg border border-sidebar-border p-2 text-xs text-sidebar-foreground/70">
          <div className="truncate font-medium text-sidebar-foreground">{account.organizationName ?? "Qoovex"}</div>
          <div className="truncate">{account.email}</div>
          {support ? <Badge variant="outline">Supporto attivo</Badge> : null}
        </div>
        {authenticated ? <WorkspaceLogoutButton /> : null}
      </SidebarFooter>
    </>
  );
}
