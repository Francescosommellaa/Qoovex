"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarCollapseButton,
} from "@qoovex/ui/components/sidebar";
import { Badge } from "@qoovex/ui/components/badge";
import { Button } from "@qoovex/ui/components/button";
import {
  IconBuildingStore,
  IconUsers,
  IconFileText,
  IconSettings,
  IconHome,
  IconChartBar,
  IconShieldLock,
} from "@tabler/icons-react";

import { KbdShortcut } from "@qoovex/ui/components/kbd-shortcut";

export default function SidebarCatalogPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Sidebar"
        description="Sistema di navigazione enterprise a scomparsa (collapsible) con supporto per tasti di scelta rapida, gruppi di risorse, badge e temi."
        importPath="import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@qoovex/ui/components/sidebar'"
      />

      <div className="flex flex-col gap-12">
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Anatomia e Struttura Navigazionale</h2>
          <SpecimenGrid cols={1}>
            <Specimen title="Anteprima Sidebar Operativa (Layout Workspace)">
              <div className="relative flex h-[28rem] w-full overflow-hidden rounded-xl border border-border/80 bg-background shadow-xs">
                <SidebarProvider defaultOpen={true} className="min-h-0 h-full w-full">
                  <div className="flex h-full w-full">
                    {/* Mock Sidebar inside container */}
                    <div className="flex h-full w-64 flex-col border-r border-border/80 bg-sidebar p-3 text-sidebar-foreground">
                      <div className="flex items-center justify-between px-2 py-1.5 border-b border-border/40 pb-3 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold font-accent text-xs">
                            Q
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold font-accent leading-tight">Qoovex Enterprise</span>
                            <span className="text-[0.65rem] text-muted-foreground">Workspace Cantieri</span>
                          </div>
                        </div>
                        <Badge variant="outline" size="sm" className="font-mono text-[0.6rem]">v2.4</Badge>
                      </div>

                      <div className="flex-1 space-y-4 overflow-y-auto pt-1">
                        <div className="space-y-1">
                          <span className="px-2 text-[0.65rem] font-accent uppercase tracking-wider text-muted-foreground">
                            Principale
                          </span>
                          <div className="space-y-0.5 pt-1 text-xs">
                            <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent px-2.5 py-1.5 font-medium text-sidebar-accent-foreground">
                              <IconHome className="size-4" />
                              <span>Panoramica</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg px-2.5 py-1.5 font-medium text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground">
                              <div className="flex items-center gap-2">
                                <IconBuildingStore className="size-4" />
                                <span>Cantieri Attivi</span>
                              </div>
                              <Badge variant="secondary" size="sm" className="h-4 text-[0.6rem]">12</Badge>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 font-medium text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground">
                              <IconChartBar className="size-4" />
                              <span>Analytics & SAL</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="px-2 text-[0.65rem] font-accent uppercase tracking-wider text-muted-foreground">
                            Gestione
                          </span>
                          <div className="space-y-0.5 pt-1 text-xs">
                            <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 font-medium text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground">
                              <IconUsers className="size-4" />
                              <span>Personale & Ruoli</span>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 font-medium text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground">
                              <IconFileText className="size-4" />
                              <span>Documenti POS/DURC</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-border/40 pt-3">
                        <div className="flex items-center justify-between rounded-lg p-2 hover:bg-sidebar-accent/50 text-xs">
                          <div className="flex items-center gap-2">
                            <IconSettings className="size-4 text-muted-foreground" />
                            <span className="font-medium">Impostazioni</span>
                          </div>
                          <KbdShortcut value="⌘S" className="rounded border border-border/80 px-1.5 py-0.5 text-[0.6rem]" />
                        </div>
                      </div>
                    </div>

                    {/* Content area preview */}
                    <div className="flex-1 bg-background p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-border/60 pb-3">
                        <h3 className="text-lg font-bold font-accent">Dashboard Cantieri</h3>
                        <Badge variant="glass">Stato Sincronizzato</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        La Sidebar si adatta automaticamente a schermi desktop e mobile, consentendo la contrazione a sole icone per massimizzare lo spazio di lavoro.
                      </p>
                    </div>
                  </div>
                </SidebarProvider>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
