"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import { Topbar, TopbarStart, TopbarCenter, TopbarEnd } from "@qoovex/ui/components/topbar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@qoovex/ui/components/breadcrumb";
import { Badge } from "@qoovex/ui/components/badge";
import { Button } from "@qoovex/ui/components/button";
import { IconButton } from "@qoovex/ui/components/icon-button";
import { Separator } from "@qoovex/ui/components/separator";
import {
  IconBell,
  IconShieldLock,
  IconSearch,
  IconLayoutSidebarLeftCollapse,
} from "@tabler/icons-react";

import { KbdShortcut } from "@qoovex/ui/components/kbd-shortcut";

export default function TopbarCatalogPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Topbar"
        description="Barra di intestazione superiore sticky per l'applicazione workspace con supporto per breadcrumb, trigger sidebar, notifiche e badge di ruolo condizionale."
        importPath="import { Topbar, TopbarStart, TopbarCenter, TopbarEnd } from '@qoovex/ui/components/topbar'"
      />

      <div className="flex flex-col gap-12">
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Varianti di Ruolo della Topbar</h2>
          <SpecimenGrid cols={1}>
            <Specimen title="Vista Platform Admin (Badge Ruolo Visibile)">
              <div className="w-full rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
                <Topbar className="static">
                  <TopbarStart>
                    <IconButton variant="ghost" size="sm" aria-label="Riduci navigazione laterale">
                      <IconLayoutSidebarLeftCollapse aria-hidden="true" className="size-4" />
                    </IconButton>
                    <Separator orientation="vertical" className="h-4" />
                  </TopbarStart>

                  <TopbarCenter>
                    <Breadcrumb items={[{ label: "Workspace", href: "#" }, { label: "Gestione Cantieri" }]} />
                  </TopbarCenter>

                  <TopbarEnd>
                    <IconButton variant="ghost" size="sm" className="relative" aria-label="Apri notifiche, 3 non lette">
                      <IconBell aria-hidden="true" className="size-4" />
                      <span aria-hidden="true" className="absolute top-1 right-1 size-2 rounded-full bg-destructive ring-2 ring-background" />
                    </IconButton>
                    <Badge variant="outline" size="sm" className="gap-1 font-mono">
                      <IconShieldLock className="size-3 text-primary" />
                      Admin
                    </Badge>
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                      <IconSearch className="size-3.5" />
                      <span className="hidden sm:inline">Cerca...</span>
                      <KbdShortcut value="⌘K" className="text-[0.6rem] opacity-60" />
                    </Button>
                  </TopbarEnd>
                </Topbar>
              </div>
            </Specimen>

            <Specimen title="Vista Standard / Owner / Client / Collaboratore (Badge Ruolo Invisibile)">
              <div className="w-full rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
                <Topbar className="static">
                  <TopbarStart>
                    <IconButton variant="ghost" size="sm" aria-label="Riduci navigazione laterale">
                      <IconLayoutSidebarLeftCollapse aria-hidden="true" className="size-4" />
                    </IconButton>
                    <Separator orientation="vertical" className="h-4" />
                  </TopbarStart>

                  <TopbarCenter>
                    <Breadcrumb items={[{ label: "Workspace", href: "#" }, { label: "Gestione Cantieri" }]} />
                  </TopbarCenter>

                  <TopbarEnd>
                    <IconButton variant="ghost" size="sm" className="relative" aria-label="Apri notifiche">
                      <IconBell aria-hidden="true" className="size-4" />
                    </IconButton>
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                      <IconSearch className="size-3.5" />
                      <span className="hidden sm:inline">Cerca...</span>
                      <KbdShortcut value="⌘K" className="text-[0.6rem] opacity-60" />
                    </Button>
                  </TopbarEnd>
                </Topbar>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
