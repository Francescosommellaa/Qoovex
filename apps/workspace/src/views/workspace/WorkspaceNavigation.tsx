"use client";

import {
  IconBuilding,
  IconClipboardCheck,
  IconFile,
  IconHome,
  IconPackageExport,
  IconSettings,
  IconShieldLock,
  IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
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
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
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
  "/documents": IconFile,
  "/job-sites": IconBuilding,
  "/workers": IconUsers,
  "/document-packages": IconPackageExport,
  "/settings": IconSettings,
  "/account/security": IconShieldLock,
  "/qoovex-admin": IconClipboardCheck,
} as const;

interface WorkspaceNavigationProps {
  authenticated: boolean;
  navigation: WorkspaceNavigationModel;
  platformRole: "USER" | "SUPER_ADMIN" | null;
  support: SupportContext | null;
}

function NavigationLink({ current, item }: { current: (href: string) => boolean; item: WorkspaceNavigationItem }) {
  const { isMobile, setOpenMobile } = useSidebar();
  const Icon = iconByHref[item.href as keyof typeof iconByHref] ?? IconFile;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={current(item.href)}
        render={<Link href={item.href} onClick={() => { if (isMobile) setOpenMobile(false); }} />}
        tooltip={item.label}
      >
        <Icon /><span>{item.label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function WorkspaceNavigation({ navigation, platformRole, support, authenticated }: WorkspaceNavigationProps) {
  const { isMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isPlatformConsole = pathname.startsWith("/qoovex-admin");
  const current = (href: string) => {
    const target = new URL(href, "https://workspace.qoovex.local");
    const pathMatches = pathname === target.pathname || (target.pathname !== "/dashboard" && pathname.startsWith(`${target.pathname}/`));
    return pathMatches && [...target.searchParams].every(([key, value]) => searchParams.get(key) === value);
  };

  if (isPlatformConsole && platformRole === "SUPER_ADMIN") {
    return (
      <>
        <SidebarContent><SidebarGroup><SidebarGroupLabel>Console Qoovex</SidebarGroupLabel><SidebarGroupContent>
          <SidebarMenu>{platformNavItems.map((item) => <NavigationLink current={current} item={item} key={item.href} />)}</SidebarMenu>
        </SidebarGroupContent></SidebarGroup></SidebarContent>
        <SidebarFooter>
          <SidebarMenu><SidebarMenuItem><SidebarMenuButton render={<Link href="/dashboard" onClick={() => { if (isMobile) setOpenMobile(false); }} />} tooltip="Torna al workspace"><IconHome /><span>Torna al workspace</span></SidebarMenuButton></SidebarMenuItem></SidebarMenu>
          <AccountMenu navigation={navigation} support={support} onNavigate={() => { if (isMobile) setOpenMobile(false); }} />
        </SidebarFooter>
      </>
    );
  }

  return (
    <>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent><SidebarMenu>{navigation.primary.map((item) => <NavigationLink current={current} item={item} key={item.href} />)}</SidebarMenu></SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {authenticated ? <AccountMenu navigation={navigation} support={support} onNavigate={() => { if (isMobile) setOpenMobile(false); }} /> : <Badge variant="outline">Sessione pubblica</Badge>}
      </SidebarFooter>
    </>
  );
}

function AccountMenu({ navigation, support, onNavigate }: { navigation: WorkspaceNavigationModel; support: SupportContext | null; onNavigate: () => void }) {
  return (
    <SidebarMenu><SidebarMenuItem><DropdownMenu>
      <DropdownMenuTrigger render={<SidebarMenuButton size="lg" />}><IconSettings /><span className="min-w-0 flex-1 truncate text-left">Azienda e account</span></DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="right" className="min-w-56">
        <DropdownMenuGroup><DropdownMenuLabel>Account</DropdownMenuLabel>
          {navigation.account.map((item) => <DropdownMenuItem key={item.href} render={<Link href={item.href} onClick={onNavigate} />}>{item.label}</DropdownMenuItem>)}
          {support ? <DropdownMenuItem render={<Link href="/dashboard" onClick={onNavigate} />}>Azienda assistita</DropdownMenuItem> : null}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup><WorkspaceLogoutButton /></DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu></SidebarMenuItem></SidebarMenu>
  );
}
