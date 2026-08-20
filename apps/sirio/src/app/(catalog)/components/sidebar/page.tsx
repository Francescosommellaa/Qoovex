"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import {
  SidebarProvider,
  AdaptiveSidebar,
  SidebarInset,
} from "@qoovex/ui/components/sidebar";
import { Badge } from "@qoovex/ui/components/badge";
import {
  IconBuildingStore,
  IconUsers,
  IconFileText,
  IconHome,
  IconChartBar,
} from "@tabler/icons-react";

const previewGroups = [
  {
    label: "Principale",
    items: [
      { name: "Panoramica", href: "#", icon: IconHome, isActive: true },
      { name: "Lavori", href: "#", icon: IconBuildingStore, badge: "12" },
      { name: "Attività recenti", href: "#", icon: IconChartBar },
    ],
  },
  {
    label: "Gestione",
    items: [
      { name: "Persone", href: "#", icon: IconUsers },
      { name: "Documenti", href: "#", icon: IconFileText },
    ],
  },
];

export default function SidebarCatalogPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Sidebar"
        description="Sistema di navigazione enterprise a scomparsa (collapsible) con supporto per tasti di scelta rapida, gruppi di risorse, badge, temi e contrazione fluida."
        importPath="import { SidebarProvider, AdaptiveSidebar, AppSidebar, SidebarInset } from '@qoovex/ui/components/sidebar'"
      />

      <div className="flex flex-col gap-12">
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Anatomia e Componente Reale (`AdaptiveSidebar`)</h2>
          <SpecimenGrid cols={1}>
            <Specimen title="Specimen Reale Operativo (AdaptiveSidebar in Modalità Contenitore Specimen)">
              <div className="relative flex h-[32rem] w-full overflow-hidden rounded-xl border border-border/80 bg-background shadow-xs">
                <SidebarProvider defaultOpen={true} inline className="h-full w-full">
                  <AdaptiveSidebar
                    inline
                    brand={{
                      title: "Qoovex",
                      logo: (
                        <span className="inline-flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold font-accent text-xs">
                          Q
                        </span>
                      ),
                    }}
                    search={{
                      placeholder: "Cerca nel workspace...",
                      onClick: () => {},
                    }}
                    groups={previewGroups}
                    footer={{
                      account: {
                        name: "Mario Rossi",
                        email: "m.rossi@qoovex.it",
                        role: "Titolare azienda",
                      },
                    }}
                    resizable
                    variant="inset"
                    collapsible="icon"
                  />
                  <SidebarInset className="p-6">
                    <div className="flex items-center justify-between border-b border-border/60 pb-3">
                      <h3 className="text-lg font-bold font-accent">Dashboard Cantieri</h3>
                      <Badge variant="glass">Componente Reale Attivo</Badge>
                    </div>
                    <div className="mt-4 space-y-3 text-xs text-muted-foreground leading-relaxed">
                      <p>
                        Questo specimene renderizza l'effettivo componente <code>AdaptiveSidebar</code> di <code>@qoovex/ui</code>.
                      </p>
                      <p>
                        Puoi testare direttamente il ridimensionamento della sidebar (trascinando la maniglia destra), la contrazione a icona tramite il pulsante in basso e l'effetto animato di scorrimento <code>SlidingIndicator</code> sulle voci di menu.
                      </p>
                    </div>
                  </SidebarInset>
                </SidebarProvider>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
