"use client";

import { IconBell, IconBuilding, IconCalendarDue, IconChevronDown, IconClipboardCheck, IconFileDescription, IconLayoutDashboard, IconSearch, IconSettings, IconUsers } from "@tabler/icons-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarRail, SidebarTrigger } from "@/components/ui/sidebar";
import { BrandMark } from "@/components/brand-mark";
import { DashboardOverview } from "@/components/dashboard-overview";
import { ThemeToggle } from "@/components/theme-toggle";

const navigation = [
  { label: "Dashboard", icon: IconLayoutDashboard, active: true },
  { label: "Da fare", icon: IconClipboardCheck },
  { label: "Cantieri", icon: IconBuilding },
  { label: "Lavoratori", icon: IconUsers },
  { label: "Documenti", icon: IconFileDescription },
  { label: "Scadenze", icon: IconCalendarDue },
];

export function DashboardShell() {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu><SidebarMenuItem><SidebarMenuButton size="lg" tooltip="Qoovex" render={<a href="/dashboard" />}><BrandMark variant="workspace" /><span className="sr-only">Dashboard</span></SidebarMenuButton></SidebarMenuItem></SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Operatività</SidebarGroupLabel>
            <SidebarGroupContent><SidebarMenu>{navigation.map(({ active, icon: Icon, label }) => <SidebarMenuItem key={label}><SidebarMenuButton isActive={active} tooltip={label}><Icon /><span>{label}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu><SidebarMenuItem><SidebarMenuButton tooltip="Impostazioni"><IconSettings /><span>Impostazioni</span></SidebarMenuButton></SidebarMenuItem></SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-4">
          <SidebarTrigger />
          <a className="rounded-md" href="/dashboard"><BrandMark compact variant="workspace" /></a>
          <Breadcrumb className="hidden min-w-0 sm:block"><BreadcrumbList><BreadcrumbItem><BreadcrumbPage>Dashboard</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
          <div className="ml-auto flex min-w-0 items-center gap-1.5">
            <div className="relative hidden w-56 lg:block"><IconSearch className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Cerca nella dashboard" className="pl-8" placeholder="Cerca" /></div>
            <Button aria-label="Notifiche" size="icon" variant="ghost"><IconBell /></Button>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button aria-label="Apri menu utente" className="gap-2 px-1.5" variant="ghost" />}><Avatar size="sm"><AvatarFallback>MR</AvatarFallback></Avatar><span className="hidden text-sm sm:inline">Mario Rossi</span><IconChevronDown className="hidden size-3.5 sm:block" /></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52"><DropdownMenuGroup><DropdownMenuLabel>Azienda dimostrativa</DropdownMenuLabel><DropdownMenuItem>Profilo</DropdownMenuItem><DropdownMenuItem>Preferenze</DropdownMenuItem></DropdownMenuGroup><DropdownMenuSeparator /><DropdownMenuItem>Esci dalla demo</DropdownMenuItem></DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="min-w-0 flex-1"><DashboardOverview /></div>
      </SidebarInset>
    </SidebarProvider>
  );
}
