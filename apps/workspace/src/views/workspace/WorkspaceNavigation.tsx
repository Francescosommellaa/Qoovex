"use client";

import {
  IconBell,
  IconBuilding,
  IconClipboardCheck,
  IconFile,
  IconHome,
  IconPlus,
  IconSettings,
  IconShieldLock,
  IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SupportContext } from "@qoovex/types";
import { Badge } from "@qoovex/ui/components/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@qoovex/ui/components/dropdown-menu";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@qoovex/ui/components/sidebar";
import { WorkspaceLogoutButton } from "./WorkspaceSessionControls";
import type { WorkspaceNavigationModel, WorkspaceNavigationItem } from "./workspace-navigation-policy";

const platformNavItems = [
  { label: "Panoramica", href: "/qoovex-admin" },
  { label: "Utenti", href: "/qoovex-admin/users" },
  { label: "Aziende", href: "/qoovex-admin/organizations" },
  { label: "Errori", href: "/qoovex-admin/errors" },
  { label: "Sicurezza", href: "/account/security" },
] as const;

const iconByHref = {
  "/dashboard": IconHome,
  "/job-sites": IconBuilding,
  "/workers": IconUsers,
  "/documents": IconFile,
  "/settings": IconSettings,
  "/account/security": IconShieldLock,
  "/qoovex-admin": IconClipboardCheck,
} as const;

interface WorkspaceNavigationProps {
  authenticated: boolean;
  navigation: WorkspaceNavigationModel;
  unreadNotificationCount: number;
  platformRole: "USER" | "SUPER_ADMIN" | null;
  support: SupportContext | null;
}

export function WorkspaceNavigation({ navigation, unreadNotificationCount, platformRole, support, authenticated }: WorkspaceNavigationProps) {
  const pathname = usePathname();
  const isPlatformConsole = pathname.startsWith("/qoovex-admin");
  const current = (href: string) => pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
  const primary: readonly WorkspaceNavigationItem[] = isPlatformConsole && platformRole === "SUPER_ADMIN" ? platformNavItems : navigation.primary;

  return (
    <>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{isPlatformConsole ? "Console Qoovex" : "Operatività"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primary.map((item) => {
                const Icon = iconByHref[item.href as keyof typeof iconByHref] ?? IconFile;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton isActive={current(item.href)} render={<Link href={item.href} />} tooltip={item.label}>
                      <Icon /><span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              {!isPlatformConsole && navigation.account.some((item) => item.href === "/settings") ? (
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={current("/notifications")} render={<Link href="/notifications" />} tooltip="Notifiche">
                    <IconBell /><span>Notifiche</span>
                  </SidebarMenuButton>
                  {unreadNotificationCount > 0 ? <SidebarMenuBadge>{unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}</SidebarMenuBadge> : null}
                </SidebarMenuItem>
              ) : null}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isPlatformConsole && navigation.add.length > 0 ? (
          <SidebarGroup>
            <SidebarGroupLabel>Azioni</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu><SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<SidebarMenuButton tooltip="Aggiungi" />}><IconPlus /><span>Aggiungi</span></DropdownMenuTrigger>
                  <DropdownMenuContent align="start" side="right">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Nuovo elemento</DropdownMenuLabel>
                      {navigation.add.map((item) => <DropdownMenuItem key={`${item.href}-${item.label}`} render={<Link href={item.href} />}>{item.label}</DropdownMenuItem>)}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem></SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>

      <SidebarFooter>
        {authenticated ? (
          <SidebarMenu><SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger render={<SidebarMenuButton size="lg" />}>
                <IconSettings /><span className="min-w-0 flex-1 truncate text-left">Azienda e account</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="right" className="min-w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  {navigation.account.map((item) => <DropdownMenuItem key={item.href} render={<Link href={item.href} />}>{item.label}</DropdownMenuItem>)}
                  {isPlatformConsole && support ? <DropdownMenuItem render={<Link href="/dashboard" />}>Azienda assistita</DropdownMenuItem> : null}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <WorkspaceLogoutButton />
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem></SidebarMenu>
        ) : <Badge variant="outline">Sessione pubblica</Badge>}
      </SidebarFooter>
    </>
  );
}
