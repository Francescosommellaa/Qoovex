"use client";

import {
  IconBuilding,
  IconBuildingPlus,
  IconClipboardCheck,
  IconFile,
  IconFilePlus,
  IconHome,
  IconPackageExport,
  IconPhotoPlus,
  IconSettings,
  IconShieldLock,
  IconUsers,
  IconUserPlus,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { PlatformRole, SupportContext } from "@qoovex/types";
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
import { UniversalSearchDialog } from "@widgets/universal-search/ui/UniversalSearchDialog";
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
  platformRole: PlatformRole | null;
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

function CreationActions({ items }: { items: readonly WorkspaceNavigationItem[] }) {
  const { isMobile, setOpenMobile, state } = useSidebar();
  if (!items.length) return null;
  const iconFor = (item: WorkspaceNavigationItem) => item.href.startsWith("/documents") ? IconFilePlus : item.href.startsWith("/job-sites") ? IconBuildingPlus : item.href.startsWith("/workers") ? IconUserPlus : IconPhotoPlus;
  return (
    <div aria-label="Azioni rapide" className="rounded-lg bg-sidebar-accent/55 p-1.5 ring-1 ring-sidebar-border/70 group-data-[collapsible=icon]:p-1" data-slot="workspace-quick-actions" role="group">
      <div className="flex h-6 items-center px-1 text-xs font-medium text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">Azioni rapide</div>
      <SidebarMenu aria-label="Azioni manuali principali" className={isMobile ? "grid grid-cols-2 gap-1" : "grid grid-cols-4 gap-1 group-data-[collapsible=icon]:grid-cols-1"}>
        {items.map((item) => { const Icon = iconFor(item); return <SidebarMenuItem key={`${item.href}-${item.label}`}><SidebarMenuButton aria-label={`Avvia: ${item.label}`} className={isMobile ? "bg-sidebar/45" : "justify-center bg-sidebar/45 px-0"} render={<Link href={item.href} onClick={() => { if (isMobile) setOpenMobile(false); }} />} tooltip={isMobile ? undefined : { children: item.label, hidden: false, side: state === "collapsed" ? "right" : "top" }}><Icon aria-hidden /><span className={isMobile ? undefined : "sr-only"}>{item.label}</span></SidebarMenuButton></SidebarMenuItem>; })}
      </SidebarMenu>
    </div>
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

  if (isPlatformConsole && (platformRole === "SUPPORT_AGENT" || platformRole === "PLATFORM_ADMIN")) {
    const visiblePlatformItems = platformRole === "PLATFORM_ADMIN"
      ? platformNavItems
      : platformNavItems.filter((item) => item.href === "/qoovex-admin" || item.href === "/account/security");
    return (
      <>
        <SidebarContent><SidebarGroup><SidebarGroupLabel>Console Qoovex</SidebarGroupLabel><SidebarGroupContent>
          <SidebarMenu>{visiblePlatformItems.map((item) => <NavigationLink current={current} item={item} key={item.href} />)}</SidebarMenu>
        </SidebarGroupContent></SidebarGroup></SidebarContent>
        <SidebarFooter>
          {support ? <SidebarMenu><SidebarMenuItem><SidebarMenuButton render={<Link href="/dashboard" onClick={() => { if (isMobile) setOpenMobile(false); }} />} tooltip="Torna al workspace"><IconHome /><span>Azienda assistita</span></SidebarMenuButton></SidebarMenuItem></SidebarMenu> : null}
          <AccountMenu navigation={navigation} support={support} onNavigate={() => { if (isMobile) setOpenMobile(false); }} />
        </SidebarFooter>
      </>
    );
  }

  return (
    <>
      <SidebarContent>
        {navigation.searchEnabled ? <SidebarGroup><SidebarGroupContent><SidebarMenu><SidebarMenuItem><UniversalSearchDialog /></SidebarMenuItem></SidebarMenu></SidebarGroupContent></SidebarGroup> : null}
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent><SidebarMenu>{navigation.primary.map((item) => <NavigationLink current={current} item={item} key={item.href} />)}</SidebarMenu></SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="gap-2">
        <CreationActions items={navigation.actions} />
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
