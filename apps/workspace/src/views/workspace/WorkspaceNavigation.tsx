"use client";

import {
  IconActivity,
  IconBuilding,
  IconBuildingPlus,
  IconCalendar,
  IconChevronRight,
  IconClipboardCheck,
  IconFile,
  IconFilePlus,
  IconHome,
  IconPackageExport,
  IconPhotoPlus,
  IconSearch,
  IconSettings,
  IconShieldLock,
  IconUserPlus,
  IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { SupportContext } from "@qoovex/types";
import { Badge } from "@qoovex/ui/components/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@qoovex/ui/components/collapsible";
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@qoovex/ui/components/sidebar";
import { WorkspaceLogoutButton } from "./WorkspaceSessionControls";
import { WorkspaceFavorites } from "./WorkspaceFavorites";
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
  "/calendar": IconCalendar,
  "/job-sites": IconBuilding,
  "/workers": IconUsers,
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

function NavigationLink({
  current,
  item,
}: {
  current: (href: string) => boolean;
  item: WorkspaceNavigationItem;
}) {
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

function GroupNavigation({
  current,
  items,
  label,
  icon: GroupIcon,
}: {
  current: (href: string) => boolean;
  items: readonly WorkspaceNavigationItem[];
  label: string;
  icon: typeof IconUsers;
}) {
  const { isMobile, setOpenMobile, state } = useSidebar();
  const pathname = usePathname();
  const active = items.some((item) => current(item.href)) || (label === "Documenti" && (pathname.startsWith("/documents") || pathname.startsWith("/document-packages")));
  const [open, setOpen] = useState(active);

  useEffect(() => {
    if (active) setOpen(true);
  }, [active]);

  if (!items.length) return null;
  const firstItem = items[0]!;

  if (items.length === 1) return <NavigationLink current={current} item={firstItem} />;

  if (state === "collapsed" && !isMobile) {
    return <NavigationLink current={current} item={firstItem} />;
  }

  return (
    <SidebarMenuItem>
      <Collapsible onOpenChange={setOpen} open={open}>
        <CollapsibleTrigger
          render={<SidebarMenuButton isActive={active} tooltip={label} />}
        >
          <GroupIcon /><span>{label}</span>
          <IconChevronRight className="ml-auto transition-transform duration-200 group-data-panel-open/menu-button:rotate-90 motion-reduce:transition-none" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items.map((item) => (
              <SidebarMenuSubItem key={item.href}>
                <SidebarMenuSubButton
                  isActive={current(item.href)}
                  render={<Link href={item.href} onClick={() => { if (isMobile) setOpenMobile(false); }} />}
                >
                  <span>{item.label}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}

function CreationActions({ items }: { items: readonly WorkspaceNavigationItem[] }) {
  const { isMobile, setOpenMobile, state } = useSidebar();
  if (!items.length) return null;

  function actionIcon(item: WorkspaceNavigationItem) {
    if (item.href.startsWith("/documents")) return IconFilePlus;
    if (item.href.startsWith("/job-sites")) return IconBuildingPlus;
    if (item.href.startsWith("/workers")) return IconUserPlus;
    if (item.href.startsWith("/evidence")) return IconPhotoPlus;
    if (item.href.startsWith("/document-packages")) return IconPackageExport;
    return IconClipboardCheck;
  }

  function actionLabel(item: WorkspaceNavigationItem) {
    if (item.href.includes("intent=upload")) return "Aggiungi file a un documento";
    if (item.label === "Documento") return "Aggiungi documento";
    if (item.label === "Cantiere") return "Crea cantiere";
    if (item.label === "Lavoratore") return "Aggiungi lavoratore";
    if (item.label === "Prova") return "Aggiungi prova";
    if (item.label === "Checklist") return "Crea checklist";
    if (item.label === "Condivisione") return "Prepara condivisione";
    return `Crea ${item.label.toLowerCase()}`;
  }

  return (
    <div
      aria-label="Azioni rapide"
      className="rounded-lg bg-sidebar-accent/55 p-1.5 ring-1 ring-sidebar-border/70 transition-[padding,background-color] duration-200 ease-[var(--ease-standard)] group-data-[collapsible=icon]:p-1 motion-reduce:transition-none"
      data-slot="workspace-quick-actions"
      role="group"
    >
      <div className="flex h-6 items-center px-1 text-xs font-medium text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
        Azioni rapide
      </div>
      <SidebarMenu
        aria-label="Crea un nuovo elemento"
        className={isMobile ? "grid grid-cols-2 gap-1" : "grid grid-cols-4 gap-1 group-data-[collapsible=icon]:grid-cols-1"}
      >
        {items.map((item) => {
          const Icon = actionIcon(item);
          const label = actionLabel(item);
          return (
            <SidebarMenuItem key={`${item.href}-${item.label}`}>
              <SidebarMenuButton
                aria-label={label}
                className={isMobile ? "bg-sidebar/45" : "justify-center bg-sidebar/45 px-0"}
                render={<Link href={item.href} onClick={() => { if (isMobile) setOpenMobile(false); }} />}
                tooltip={isMobile ? undefined : { children: label, hidden: false, side: state === "collapsed" ? "right" : "top" }}
              >
                <Icon /><span className={isMobile ? undefined : "sr-only"}>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
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
    const pathMatches = pathname === target.pathname
      || (!["/dashboard", "/documents", "/people", "/job-sites"].includes(target.pathname) && pathname.startsWith(`${target.pathname}/`));
    if (!pathMatches) return false;
    return [...target.searchParams].every(([key, value]) => searchParams.get(key) === value);
  };

  if (isPlatformConsole && platformRole === "SUPER_ADMIN") {
    return (
      <>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Console Qoovex</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{platformNavItems.map((item) => <NavigationLink current={current} item={item} key={item.href} />)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu><SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/dashboard" onClick={() => { if (isMobile) setOpenMobile(false); }} />} tooltip="Torna al workspace">
              <IconHome /><span>Torna al workspace</span>
            </SidebarMenuButton>
          </SidebarMenuItem></SidebarMenu>
          <SidebarMenu><SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger render={<SidebarMenuButton size="lg" />}>
                <IconSettings /><span className="min-w-0 flex-1 truncate text-left">Azienda e account</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="right" className="min-w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  {navigation.account.map((item) => <DropdownMenuItem key={item.href} render={<Link href={item.href} onClick={() => { if (isMobile) setOpenMobile(false); }} />}>{item.label}</DropdownMenuItem>)}
                  {support ? <DropdownMenuItem render={<Link href="/dashboard" onClick={() => { if (isMobile) setOpenMobile(false); }} />}>Azienda assistita</DropdownMenuItem> : null}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup><WorkspaceLogoutButton /></DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem></SidebarMenu>
        </SidebarFooter>
      </>
    );
  }

  const home = navigation.primary.find((item) => item.href === "/dashboard");
  const workspaceItems = navigation.primary.filter((item) => item.href !== "/dashboard");

  return (
    <>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton aria-label="Ricerca rapida, in preparazione" aria-disabled="true" tooltip="Ricerca rapida · in preparazione">
                  <IconSearch /><span>Ricerca</span>
                </SidebarMenuButton>
                <SidebarMenuBadge>Presto</SidebarMenuBadge>
              </SidebarMenuItem>
              {home ? <NavigationLink current={current} item={home} /> : null}
              {navigation.showAnalytics ? (
                <SidebarMenuItem>
                  <SidebarMenuButton aria-label="Analisi, in preparazione" aria-disabled="true" tooltip="Analisi · in preparazione">
                    <IconActivity /><span>Analisi</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>Presto</SidebarMenuBadge>
                </SidebarMenuItem>
              ) : null}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <GroupNavigation current={current} icon={IconFile} items={navigation.documents} label="Documenti" />
              <GroupNavigation current={current} icon={IconUsers} items={navigation.people} label="Persone" />
              <GroupNavigation current={current} icon={IconBuilding} items={navigation.jobSites} label={navigation.jobSitesLabel} />
              {workspaceItems.map((item) => <NavigationLink current={current} item={item} key={item.href} />)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <WorkspaceFavorites favorites={navigation.favorites} current={current} key={navigation.favorites.role ?? "public"} />
      </SidebarContent>

      <SidebarFooter className="gap-2">
        <CreationActions items={navigation.add} />
        {authenticated ? (
          <SidebarMenu><SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger render={<SidebarMenuButton size="lg" />}>
                <IconSettings /><span className="min-w-0 flex-1 truncate text-left">Azienda e account</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="right" className="min-w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  {navigation.account.map((item) => <DropdownMenuItem key={item.href} render={<Link href={item.href} onClick={() => { if (isMobile) setOpenMobile(false); }} />}>{item.label}</DropdownMenuItem>)}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup><WorkspaceLogoutButton /></DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem></SidebarMenu>
        ) : <Badge variant="outline">Sessione pubblica</Badge>}
      </SidebarFooter>
    </>
  );
}
