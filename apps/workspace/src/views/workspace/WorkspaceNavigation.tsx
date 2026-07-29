"use client";

import {
  IconActivity,
  IconBuilding,
  IconBuildingCog,
  IconCalendar,
  IconChevronDown,
  IconChevronRight,
  IconChevronUp,
  IconClipboardCheck,
  IconFile,
  IconFilePlus,
  IconHome,
  IconMessageCircle,
  IconPhotoPlus,
  IconPlus,
  IconSettings,
  IconShieldLock,
  IconUserCog,
  IconUserPlus,
  IconUsers,
  IconUsersGroup,
} from "@tabler/icons-react";
import { jobSiteOperationalPhaseLabels, type ContextTimelineEventResponse, type PlatformRole, type SupportContext } from "@qoovex/types";
import type { WorkspaceJobSiteNavigationItem } from "@shared/lib/workspace-job-site-navigation";
import { jobSiteDetailsHref, jobSiteRouteId } from "@shared/lib/job-site-routes";
import type { WorkspaceJobSiteRecord } from "./workspace-records";
import { Avatar, AvatarFallback } from "@qoovex/ui/components/avatar";
import { Badge } from "@qoovex/ui/components/badge";
import { cn } from "@qoovex/ui/lib/utils";
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
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { WorkspaceLogoutButton } from "./WorkspaceSessionControls";
import { useWorkspaceSidebarWidth } from "./WorkspaceSidebarFrame";
import { WorkspaceJobSitePhaseIcon } from "./WorkspacePrimitives";
import { ensureExpandedJobSiteId, normalizeExpandedJobSiteIds, toggleExpandedJobSiteIds } from "./workspace-navigation-expansion";
import {
  isJobSiteCollectionPathCurrent,
  isWorkspaceNavigationItemCurrent,
  type WorkspaceNavigationItem,
  type WorkspaceNavigationModel,
} from "./workspace-navigation-policy";

const platformNavItems = [
  { label: "Panoramica", href: "/qoovex-admin" },
  { label: "Utenti", href: "/qoovex-admin/users" },
  { label: "Aziende", href: "/qoovex-admin/organizations" },
  { label: "Errori", href: "/qoovex-admin/errors" },
  { label: "Sicurezza", href: "/account/security" },
] as const;

const MULTI_EXPAND_SIDEBAR_MIN_WIDTH = 280;

const iconByHref = {
  "/dashboard": IconHome,
  "/job-sites": IconBuilding,
  "/job-sites/all": IconBuilding,
  "/workers": IconUsers,
  "/settings/organization-profile": IconBuildingCog,
  "/settings": IconSettings,
  "/people/access": IconUsersGroup,
  "/account/security": IconUserCog,
  "/qoovex-admin": IconClipboardCheck,
} as const;

interface WorkspaceNavigationProps {
  account: {
    email: string | null;
    organizationName: string | null;
  };
  authenticated: boolean;
  jobSites: WorkspaceJobSiteNavigationItem[];
  navigation: WorkspaceNavigationModel;
  platformRole: PlatformRole | null;
  support: SupportContext | null;
}

const jobSiteCollectionSegments = new Set(["all", "archive", "new"]);
const sidebarUpdateDateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  month: "short",
});

function formatSidebarUpdateDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : sidebarUpdateDateFormatter.format(date);
}

function sidebarVisibleJobSites(items: WorkspaceJobSiteNavigationItem[]) {
  return items.filter((item) => item.operationalPhase !== "COMPLETED");
}

function getCurrentJobSiteId(pathname: string) {
  const segment = pathname.split("/")[2];
  if (!segment || jobSiteCollectionSegments.has(segment)) return null;
  try {
    return jobSiteRouteId(decodeURIComponent(segment));
  } catch {
    return null;
  }
}

function JobSiteNavigation({ initialItems, allItem, canCreate }: {
  initialItems: WorkspaceJobSiteNavigationItem[];
  allItem: WorkspaceNavigationItem | undefined;
  canCreate: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isMobile, setOpenMobile, state } = useSidebar();
  const sidebarWidth = useWorkspaceSidebarWidth();
  const currentId = getCurrentJobSiteId(pathname);
  const exclusiveExpansion = isMobile || state === "collapsed" || sidebarWidth < MULTI_EXPAND_SIDEBAR_MIN_WIDTH;
  const [items, setItems] = useState(() => sidebarVisibleJobSites(initialItems));
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(currentId ? [currentId] : []));
  const [currentHash, setCurrentHash] = useState("");

  useEffect(() => setItems(sidebarVisibleJobSites(initialItems)), [initialItems]);
  useEffect(() => {
    const syncHash = () => setCurrentHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);
  useEffect(() => {
    if (!currentId) return;
    setExpandedIds((current) => ensureExpandedJobSiteId(current, currentId, exclusiveExpansion));
    if (items.some((item) => item.id === currentId)) return;
    const controller = new AbortController();
    void Promise.all([
      fetch(`/api/job-sites/${encodeURIComponent(currentId)}`, { signal: controller.signal }).then(async (response) => response.ok ? response.json() as Promise<WorkspaceJobSiteRecord> : null),
      fetch(`/api/context-timeline?targetType=JOB_SITE&targetId=${encodeURIComponent(currentId)}&take=3`, { signal: controller.signal }).then(async (response) => response.ok ? response.json() as Promise<ContextTimelineEventResponse[]> : []),
    ]).then(([jobSite, updates]) => {
      if (!jobSite || jobSite.operationalPhase === "COMPLETED") return;
      setItems((current) => current.some((item) => item.id === jobSite.id) ? current : [{
        id: jobSite.id,
        name: jobSite.name,
        operationalPhase: jobSite.operationalPhase ?? null,
        updatedAt: jobSite.updatedAt ?? new Date(0).toISOString(),
        updates: updates.slice(0, 3).map((update) => ({
          id: update.id,
          title: update.title,
          summary: update.summary ?? null,
          eventType: update.eventType,
          occurredAt: update.occurredAt,
        })),
      }, ...current]);
    }).catch((error: unknown) => {
      if (!(error instanceof DOMException && error.name === "AbortError")) console.error("Impossibile caricare il cantiere attivo nella navigazione.", error);
    });
    return () => controller.abort();
  }, [currentId, exclusiveExpansion, items]);

  useEffect(() => {
    if (!exclusiveExpansion) return;
    setExpandedIds((current) => normalizeExpandedJobSiteIds(current, currentId));
  }, [currentId, exclusiveExpansion]);

  const orderedItems = currentId
    ? [...items].sort((left, right) => left.id === currentId ? -1 : right.id === currentId ? 1 : 0)
    : items;
  const closeMobile = () => { if (isMobile) setOpenMobile(false); };
  const allItemActive = allItem ? isJobSiteCollectionPathCurrent(pathname) : false;

  return (
    <SidebarMenu aria-label="Cantieri recenti">
      <SidebarMenuItem className="flex min-w-0 items-center gap-1 px-2 pb-1 group-data-[collapsible=icon]:hidden">
        <span className="min-w-0 flex-1 truncate text-xs font-medium text-sidebar-foreground/70">Cantieri</span>
        {allItem ? (
          <SidebarMenuButton
            aria-current={allItemActive ? "page" : undefined}
            aria-label={allItem.label}
            className="h-7! w-auto shrink-0 px-2! py-1! text-xs font-medium"
            isActive={allItemActive}
            render={<Link data-link="plain" href={allItem.href} onClick={closeMobile} />}
          >
            <span>Tutti</span>
          </SidebarMenuButton>
        ) : null}
        {canCreate ? (
          <Link
            aria-label="Crea cantiere"
            className="grid size-8 shrink-0 place-items-center rounded-md text-sidebar-foreground/70 outline-none hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            href="/job-sites/new"
            onClick={closeMobile}
          >
            <IconPlus aria-hidden="true" className="size-4" />
          </Link>
        ) : null}
      </SidebarMenuItem>
      {orderedItems.map((item) => {
        const active = item.id === currentId;
        const expanded = expandedIds.has(item.id);
        const panelId = `workspace-job-site-${item.id}`;
        return (
          <SidebarMenuItem key={item.id}>
            <div className="group/job-site-row flex min-w-0 items-center gap-1">
              <div className="min-w-0 flex-1">
                <SidebarMenuButton
                  className="min-w-0 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:p-1.5!"
                  isActive={active}
                  render={<Link aria-current={active ? "page" : undefined} data-link="plain" href={jobSiteDetailsHref(item)} onClick={closeMobile} />}
                  tooltip={item.name}
                >
                  <WorkspaceJobSitePhaseIcon phase={item.operationalPhase} />
                  <span className="flex min-w-0 flex-1 items-center">
                    <span className="min-w-0 flex-1 truncate">{item.name}</span>
                    <span className={cn(
                      "shrink-0 overflow-hidden whitespace-nowrap text-[0.625rem] font-medium text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden",
                      isMobile
                        ? "ml-1.5 max-w-24 opacity-100"
                        : "ml-0 max-w-0 opacity-0 transition-[max-width,margin,opacity] duration-100 group-hover/job-site-row:ml-1.5 group-hover/job-site-row:max-w-24 group-hover/job-site-row:opacity-100 group-focus-within/job-site-row:ml-1.5 group-focus-within/job-site-row:max-w-24 group-focus-within/job-site-row:opacity-100 motion-reduce:transition-none",
                    )}>
                      {item.operationalPhase ? jobSiteOperationalPhaseLabels[item.operationalPhase] : "Fase non impostata"}
                    </span>
                  </span>
                </SidebarMenuButton>
              </div>
              <SidebarMenuButton
                aria-controls={panelId}
                aria-expanded={expanded}
                aria-label={`${expanded ? "Nascondi" : "Mostra"} aggiornamenti di ${item.name}`}
                className="size-8! w-8! shrink-0 p-2! group-data-[collapsible=icon]:hidden"
                onClick={() => setExpandedIds((current) => toggleExpandedJobSiteIds(current, item.id, exclusiveExpansion))}
                tooltip={{ children: `${expanded ? "Nascondi" : "Mostra"} aggiornamenti`, hidden: false, side: "right" }}
                type="button"
              >
                {expanded ? <IconChevronDown aria-hidden="true" /> : <IconChevronRight aria-hidden="true" />}
              </SidebarMenuButton>
            </div>
            <div aria-hidden={!expanded} className="grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-100 data-[expanded=true]:grid-rows-[1fr] data-[expanded=true]:opacity-100 motion-reduce:transition-none" data-expanded={expanded} inert={!expanded}>
              <div className="min-h-0 overflow-hidden">
                <SidebarMenuSub
                  className={item.updates.length
                    ? "relative mx-0 ml-7 translate-x-0 gap-1 border-l-0 px-0 py-1 pl-3 before:absolute before:inset-y-2 before:left-0 before:w-px before:rounded-full before:bg-sidebar-border"
                    : "mx-0 ml-7 translate-x-0 border-l-0 px-0 py-1 pl-3"}
                  id={panelId}
                >
                  {item.updates.length ? item.updates.slice(0, 3).map((update) => {
                    const updateHash = `#timeline-${encodeURIComponent(update.id)}`;
                    const updateActive = active && searchParams.get("section") === "updates" && currentHash === updateHash;
                    const formattedDate = formatSidebarUpdateDate(update.occurredAt);
                    return (
                      <SidebarMenuSubItem key={update.id}>
                        <SidebarMenuSubButton
                          className="h-auto min-h-10 items-start gap-2 py-1.5 pr-1.5"
                          isActive={updateActive}
                          render={(
                            <Link
                              aria-current={updateActive ? "location" : undefined}
                              aria-label={`Vai all'aggiornamento: ${update.title}`}
                              data-link="plain"
                              href={`${jobSiteDetailsHref(item)}?section=updates${updateHash}`}
                              onClick={() => {
                                setCurrentHash(updateHash);
                                closeMobile();
                              }}
                            />
                          )}
                        >
                          <span aria-hidden="true" className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md bg-sidebar-accent text-sidebar-foreground/65">
                            <IconMessageCircle className="size-3.5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-medium leading-4">{update.title}</span>
                            {formattedDate ? <time className="block text-[0.6875rem] leading-4 text-sidebar-foreground/55" dateTime={update.occurredAt}>{formattedDate}</time> : null}
                          </span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    );
                  }) : (
                    <SidebarMenuSubItem><span className="block px-2 py-1 text-xs text-sidebar-foreground/55">Nessun aggiornamento</span></SidebarMenuSubItem>
                  )}
                </SidebarMenuSub>
              </div>
            </div>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

function NavigationLink({ current, item }: { current: (item: WorkspaceNavigationItem) => boolean; item: WorkspaceNavigationItem }) {
  const { isMobile, setOpenMobile } = useSidebar();
  const Icon = iconByHref[item.href as keyof typeof iconByHref] ?? IconFile;
  const active = current(item);
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={active}
        render={(
          <Link
            aria-current={active ? "page" : undefined}
            data-link="plain"
            href={item.href}
            onClick={() => { if (isMobile) setOpenMobile(false); }}
          />
        )}
        tooltip={item.label}
      >
        <Icon aria-hidden="true" /><span>{item.label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function CreationActions({ items }: { items: readonly WorkspaceNavigationItem[] }) {
  const { isMobile, setOpenMobile } = useSidebar();
  const visibleItems = items.filter((item) => item.href !== "/job-sites/new");
  if (!visibleItems.length) return null;
  const gridColumns = visibleItems.length === 1 ? "grid-cols-1" : visibleItems.length === 2 ? "grid-cols-2" : "grid-cols-3";
  const iconFor = (item: WorkspaceNavigationItem) => item.href.startsWith("/documents")
    ? IconFilePlus
    : item.href.startsWith("/people")
      ? IconUserPlus
      : IconPhotoPlus;
  return (
    <div
      aria-label="Azioni rapide"
      className="rounded-lg bg-transparent p-1.5 ring-1 ring-sidebar-border/65 group-data-[collapsible=icon]:p-0.5"
      data-slot="workspace-quick-actions"
      role="group"
    >
      <div className="flex h-6 items-center px-1 text-xs font-medium text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">Azioni rapide</div>
      <SidebarMenu aria-label="Azioni manuali principali" className={`grid auto-rows-fr ${gridColumns} items-stretch gap-1 group-data-[collapsible=icon]:grid-cols-1 group-data-[collapsible=icon]:place-items-center`}>
        {visibleItems.map((item) => {
          const Icon = iconFor(item);
          return (
            <SidebarMenuItem className="h-full min-w-0" key={`${item.href}-${item.label}`}>
              <SidebarMenuButton
                aria-label={item.label}
                className="h-full min-h-14 flex-col justify-center gap-1 bg-sidebar-accent/30 px-0 py-1.5 hover:bg-sidebar-accent group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-7! group-data-[collapsible=icon]:min-h-0 group-data-[collapsible=icon]:p-1.5!"
                render={<Link data-link="plain" href={item.href} onClick={() => { if (isMobile) setOpenMobile(false); }} />}
                tooltip={{ children: item.label, hidden: isMobile, side: "top" }}
              >
                <Icon aria-hidden="true" />
                <div className="mx-auto line-clamp-2 min-h-6 w-full max-w-16 text-center text-[0.625rem] leading-3 group-data-[collapsible=icon]:hidden">{item.label}</div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </div>
  );
}

export function WorkspaceNavigation({ account, jobSites, navigation, platformRole, support, authenticated }: WorkspaceNavigationProps) {
  const { isMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const location = `${pathname}?${search}`;
  const previousLocation = useRef(location);
  const isPlatformConsole = pathname.startsWith("/qoovex-admin");
  const current = (item: WorkspaceNavigationItem) => isWorkspaceNavigationItemCurrent(pathname, searchParams, item.href, item.activePath);

  useEffect(() => {
    if (previousLocation.current !== location && isMobile) setOpenMobile(false);
    previousLocation.current = location;
  }, [isMobile, location, setOpenMobile]);

  if (isPlatformConsole && (platformRole === "SUPPORT_AGENT" || platformRole === "PLATFORM_ADMIN")) {
    const visiblePlatformItems = platformRole === "PLATFORM_ADMIN"
      ? platformNavItems
      : platformNavItems.filter((item) => item.href === "/qoovex-admin" || item.href === "/account/security");
    return (
      <>
        <SidebarContent><SidebarGroup><SidebarGroupLabel>Console Qoovex</SidebarGroupLabel><SidebarGroupContent>
          <SidebarMenu>{visiblePlatformItems.map((item) => <NavigationLink current={current} item={item} key={item.href} />)}</SidebarMenu>
        </SidebarGroupContent></SidebarGroup></SidebarContent>
        <SidebarFooter className="pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {support ? <SidebarMenu><SidebarMenuItem><SidebarMenuButton render={<Link href="/dashboard" onClick={() => { if (isMobile) setOpenMobile(false); }} />} tooltip="Torna al workspace"><IconHome /><span>Azienda assistita</span></SidebarMenuButton></SidebarMenuItem></SidebarMenu> : null}
          <AccountMenu account={account} navigation={navigation} support={support} onNavigate={() => { if (isMobile) setOpenMobile(false); }} />
        </SidebarFooter>
      </>
    );
  }

  return (
    <>
      {navigation.searchEnabled ? (
        <SidebarGroup aria-label="Orientamento e controllo" className="shrink-0 pb-1" role="group">
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.primary.map((item) => item.href === "/dashboard" ? <NavigationLink current={current} item={item} key={item.href} /> : null)}
              <SidebarMenuItem>
                <SidebarMenuButton aria-disabled="true" aria-label="Analytics, disponibile in futuro" disabled>
                  <IconActivity aria-hidden="true" /><span>Analytics</span>
                </SidebarMenuButton>
                <SidebarMenuBadge>Presto</SidebarMenuBadge>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton aria-disabled="true" aria-label="Calendario, disponibile in futuro" disabled>
                  <IconCalendar aria-hidden="true" /><span>Calendario</span>
                </SidebarMenuButton>
                <SidebarMenuBadge>Presto</SidebarMenuBadge>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ) : null}
      <SidebarContent>
        <SidebarGroup aria-label="Cantieri operativi" role="group">
          <SidebarGroupContent>
            <JobSiteNavigation
              allItem={navigation.primary.find((item) => item.href === "/job-sites/all")}
              canCreate={navigation.actions.some((item) => item.href === "/job-sites/new")}
              initialItems={jobSites}
            />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="gap-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <CreationActions items={navigation.actions} />
        {authenticated ? <AccountMenu account={account} navigation={navigation} support={support} onNavigate={() => { if (isMobile) setOpenMobile(false); }} /> : <Badge variant="outline">Sessione pubblica</Badge>}
      </SidebarFooter>
    </>
  );
}

function accountInitials(organizationName: string | null, email: string | null) {
  const source = organizationName?.trim() || email?.trim() || "A";
  return source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "A";
}

function AccountMenu({ account, navigation, support, onNavigate }: { account: WorkspaceNavigationProps["account"]; navigation: WorkspaceNavigationModel; support: SupportContext | null; onNavigate: () => void }) {
  const { isMobile, setOpen, state } = useSidebar();
  const [dismissed, setDismissed] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const suppressFocusExpansion = useRef(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const companyLabel = account.organizationName || "Account";
  const collapsed = state === "collapsed" && !isMobile;
  const expanded = !collapsed && !dismissed && (focused || hovered || pinned);

  useEffect(() => {
    if (!pinned) return;
    function closeOnOutsidePointer(event: PointerEvent) {
      if (containerRef.current?.contains(event.target as Node)) return;
      setDismissed(true);
      setHovered(false);
      setPinned(false);
    }
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [pinned]);

  function closePanel() {
    setFocused(false);
    setHovered(false);
    setPinned(false);
  }

  function togglePanel() {
    if (collapsed) {
      setOpen(true);
      setDismissed(false);
      setPinned(true);
      return;
    }
    if (pinned) {
      setDismissed(true);
      setFocused(false);
      setPinned(false);
      return;
    }
    setDismissed(false);
    setPinned(true);
  }

  function navigateFromPanel() {
    closePanel();
    onNavigate();
  }

  return (
    <SidebarMenu className="group-data-[collapsible=icon]:items-center">
      <SidebarMenuItem className="group-data-[collapsible=icon]:w-8">
        <div
          className="flex flex-col-reverse rounded-lg bg-sidebar-accent/45 ring-1 ring-sidebar-border/70 transition-colors duration-100 hover:bg-sidebar-accent/70 focus-within:bg-sidebar-accent/70 motion-reduce:transition-none group-data-[collapsible=icon]:ring-0"
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setDismissed(false);
              setFocused(false);
            }
          }}
          onFocusCapture={() => {
            if (suppressFocusExpansion.current) {
              suppressFocusExpansion.current = false;
              return;
            }
            setDismissed(false);
            setFocused(true);
          }}
          onKeyDown={(event) => {
            if (event.key !== "Escape") return;
            event.preventDefault();
            event.stopPropagation();
            if (document.activeElement !== triggerRef.current) suppressFocusExpansion.current = true;
            setDismissed(true);
            closePanel();
            triggerRef.current?.focus();
          }}
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse" && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
              setDismissed(false);
              setHovered(true);
            }
          }}
          onPointerLeave={() => setHovered(false)}
          ref={containerRef}
        >
          <SidebarMenuButton
            aria-controls={panelId}
            aria-expanded={expanded}
            aria-label="Azienda e account"
            className="h-auto min-h-14 rounded-lg px-2.5 py-2 hover:bg-transparent data-[expanded=true]:bg-transparent group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:min-h-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0!"
            data-expanded={expanded}
            onClick={togglePanel}
            ref={triggerRef}
            size="lg"
            tooltip={collapsed ? "Azienda e account" : undefined}
            type="button"
          >
            <Avatar size="sm"><AvatarFallback>{accountInitials(account.organizationName, account.email)}</AvatarFallback></Avatar>
            <span className="min-w-0 flex-1 text-left group-data-[collapsible=icon]:hidden">
              <span className="block truncate text-sm font-medium" title={account.organizationName ?? undefined}>{companyLabel}</span>
              {account.email ? <span className="block truncate text-xs text-sidebar-foreground/65" title={account.email}>{account.email}</span> : null}
            </span>
            <IconChevronUp aria-hidden="true" className="ml-auto transition-transform duration-100 group-data-[expanded=true]/menu-button:rotate-180 motion-reduce:transition-none group-data-[collapsible=icon]:hidden" />
            {collapsed ? <span className="sr-only">{companyLabel}{account.email ? `, ${account.email}` : ""}</span> : null}
          </SidebarMenuButton>
          <div
            aria-hidden={!expanded}
            aria-label="Azioni azienda e account"
            className="pointer-events-none grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-150 ease-out data-[expanded=true]:pointer-events-auto data-[expanded=true]:grid-rows-[1fr] data-[expanded=true]:opacity-100 motion-reduce:transition-none"
            data-expanded={expanded}
            id={panelId}
            inert={!expanded}
            role="group"
          >
            <div className="min-h-0 overflow-hidden">
              <SidebarMenu aria-label="Collegamenti azienda e account" className="gap-0.5 px-1.5 pt-1.5">
                {navigation.account.map((item) => {
                  const Icon = iconByHref[item.href as keyof typeof iconByHref] ?? IconShieldLock;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton render={<Link data-link="plain" href={item.href} onClick={navigateFromPanel} />} tooltip={item.label}>
                        <Icon aria-hidden="true" /><span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
                {support ? (
                  <SidebarMenuItem>
                    <SidebarMenuButton render={<Link data-link="plain" href="/dashboard" onClick={navigateFromPanel} />} tooltip="Azienda assistita">
                      <IconHome aria-hidden="true" /><span>Azienda assistita</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : null}
              </SidebarMenu>
              <div className="mx-1.5 mt-1 border-t border-sidebar-border/70 px-0.5 py-1">
                <WorkspaceLogoutButton />
              </div>
            </div>
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
