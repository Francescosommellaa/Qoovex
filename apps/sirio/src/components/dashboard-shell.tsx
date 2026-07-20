"use client";

import {
  IconActivity,
  IconBell,
  IconBuilding,
  IconBuildingPlus,
  IconCalendar,
  IconCalendarDue,
  IconChevronDown,
  IconChevronRight,
  IconChecklist,
  IconFileDescription,
  IconFilePlus,
  IconHome,
  IconPhoto,
  IconPhotoPlus,
  IconPin,
  IconSearch,
  IconSettings,
  IconUserPlus,
  IconUsers,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback } from "@qoovex/ui/components/avatar";
import { Badge } from "@qoovex/ui/components/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@qoovex/ui/components/breadcrumb";
import { Button } from "@qoovex/ui/components/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@qoovex/ui/components/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@qoovex/ui/components/dropdown-menu";
import {
  Sidebar,
  SidebarCollapseButton,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@qoovex/ui/components/sidebar";
import { ThemeToggle } from "@qoovex/ui/components/theme-toggle";
import { BrandMark } from "@/components/brand-mark";
import { DashboardOverview } from "@/components/dashboard-overview";

const workspaceNavigation = [
  { label: "Documenti", icon: IconFileDescription, href: "/dashboard" },
  { label: "Calendario", icon: IconCalendar, href: "/calendar" },
  { label: "Cantieri", icon: IconBuilding, href: "/dashboard" },
];

const quickActions = [
  { label: "Documento", actionLabel: "Crea documento", icon: IconFilePlus },
  { label: "Cantiere", actionLabel: "Crea cantiere", icon: IconBuildingPlus },
  { label: "Lavoratore", actionLabel: "Crea lavoratore", icon: IconUserPlus },
  { label: "Prova", actionLabel: "Aggiungi prova", icon: IconPhotoPlus },
] as const;

function DemoQuickActions() {
  const { isMobile, state } = useSidebar();
  return (
    <div
      aria-label="Azioni rapide"
      className="rounded-lg bg-sidebar-accent/55 p-1.5 ring-1 ring-sidebar-border/70 transition-[padding,background-color] duration-200 ease-[var(--ease-standard)] group-data-[collapsible=icon]:p-1 motion-reduce:transition-none"
      data-slot="workspace-quick-actions"
      role="group"
    >
      <div className="flex h-6 items-center px-1 text-xs font-medium text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">Azioni rapide</div>
      <SidebarMenu aria-label="Crea un nuovo elemento" className={isMobile ? "grid grid-cols-2 gap-1" : "grid grid-cols-4 gap-1 group-data-[collapsible=icon]:grid-cols-1"}>
        {quickActions.map(({ actionLabel, icon: Icon, label }) => (
          <SidebarMenuItem key={label}>
            <SidebarMenuButton
              aria-label={actionLabel}
              className={isMobile ? "bg-sidebar/45" : "justify-center bg-sidebar/45 px-0"}
              tooltip={isMobile ? undefined : { children: actionLabel, hidden: false, side: state === "collapsed" ? "right" : "top" }}
            >
              <Icon /><span className={isMobile ? undefined : "sr-only"}>{label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </div>
  );
}

export function DashboardShell() {
  return (
    <SidebarProvider className="h-svh min-h-0! overflow-hidden">
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader>
          <SidebarMenu><SidebarMenuItem><SidebarMenuButton size="lg" tooltip="Qoovex" render={<a href="/dashboard" />}><BrandMark variant="workspace" /><span className="sr-only">Dashboard</span></SidebarMenuButton></SidebarMenuItem></SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem><SidebarMenuButton aria-disabled="true" tooltip="Ricerca rapida · in preparazione"><IconSearch /><span>Ricerca</span></SidebarMenuButton><SidebarMenuBadge>Presto</SidebarMenuBadge></SidebarMenuItem>
                <SidebarMenuItem><SidebarMenuButton isActive tooltip="Da fare"><IconHome /><span>Da fare</span></SidebarMenuButton></SidebarMenuItem>
                <SidebarMenuItem><SidebarMenuButton aria-disabled="true" tooltip="Analisi · in preparazione"><IconActivity /><span>Analisi</span></SidebarMenuButton><SidebarMenuBadge>Presto</SidebarMenuBadge></SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {workspaceNavigation.slice(0, 2).map(({ href, icon: Icon, label }) => <SidebarMenuItem key={label}><SidebarMenuButton render={<a href={href} />} tooltip={label}><Icon /><span>{label}</span></SidebarMenuButton></SidebarMenuItem>)}
                <SidebarMenuItem>
                  <Collapsible defaultOpen>
                    <CollapsibleTrigger render={<SidebarMenuButton tooltip="Persone" />}><IconUsers /><span>Persone</span><IconChevronRight className="ml-auto transition-transform duration-200 group-data-panel-open/menu-button:rotate-90 motion-reduce:transition-none" /></CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem><SidebarMenuSubButton><span>Lavoratori</span></SidebarMenuSubButton></SidebarMenuSubItem>
                        <SidebarMenuSubItem><SidebarMenuSubButton><span>Capicantiere e ruoli</span></SidebarMenuSubButton></SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarMenuItem>
                {workspaceNavigation.slice(2).map(({ href, icon: Icon, label }) => <SidebarMenuItem key={label}><SidebarMenuButton render={<a href={href} />} tooltip={label}><Icon /><span>{label}</span></SidebarMenuButton></SidebarMenuItem>)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Collegamenti rapidi</SidebarGroupLabel>
            <SidebarGroupAction aria-label="Personalizza collegamenti rapidi" title="Personalizza collegamenti rapidi"><IconPin /></SidebarGroupAction>
            <SidebarGroupContent><SidebarMenu>
              <SidebarMenuItem><SidebarMenuButton render={<a href="/calendar" />} tooltip="Scadenze"><IconCalendarDue /><span>Scadenze</span></SidebarMenuButton></SidebarMenuItem>
              <SidebarMenuItem><SidebarMenuButton tooltip="Prove"><IconPhoto /><span>Prove</span></SidebarMenuButton></SidebarMenuItem>
              <SidebarMenuItem><SidebarMenuButton tooltip="Checklist"><IconChecklist /><span>Checklist</span></SidebarMenuButton></SidebarMenuItem>
            </SidebarMenu></SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="gap-2">
          <DemoQuickActions />
          <SidebarMenu><SidebarMenuItem><SidebarMenuButton tooltip="Impostazioni"><IconSettings /><span>Impostazioni</span></SidebarMenuButton></SidebarMenuItem></SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="h-svh min-h-0 overflow-hidden">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-4">
          <SidebarTrigger aria-label="Apri navigazione" className="md:hidden" />
          <SidebarCollapseButton className="hidden md:flex" iconOnly />
          <Breadcrumb aria-label="Pagine recenti" className="hidden min-w-0 flex-1 md:block"><BreadcrumbList className="flex-nowrap"><BreadcrumbItem><BreadcrumbLink href="/dashboard" data-link="plain">Documenti</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink href="/dashboard" data-link="plain">Cantieri</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Da fare</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
          <Breadcrumb aria-label="Navigazione mobile" className="min-w-0 flex-1 md:hidden"><BreadcrumbList><BreadcrumbItem><BreadcrumbPage>Da fare</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
          <div className="ml-auto flex min-w-0 items-center gap-1.5">
            <Button aria-label="Notifiche" size="icon" variant="ghost"><IconBell /></Button>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button aria-label="Apri menu utente" className="gap-2 px-1.5" variant="ghost" />}><Avatar size="sm"><AvatarFallback>MR</AvatarFallback></Avatar><span className="hidden text-sm sm:inline">Mario Rossi</span><IconChevronDown className="hidden sm:block" /></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52"><DropdownMenuGroup><DropdownMenuLabel>Azienda dimostrativa</DropdownMenuLabel><DropdownMenuItem>Profilo</DropdownMenuItem><DropdownMenuItem>Preferenze</DropdownMenuItem></DropdownMenuGroup><DropdownMenuSeparator /><DropdownMenuItem>Esci dalla demo</DropdownMenuItem></DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto"><DashboardOverview /></div>
      </SidebarInset>
    </SidebarProvider>
  );
}
