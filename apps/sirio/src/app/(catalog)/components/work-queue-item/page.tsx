"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import {
  WorkQueueItem,
  WorkQueueItemContent,
  WorkQueueItemTitle,
  WorkQueueItemDescription,
  WorkQueueItemActions,
} from "@qoovex/ui/components/work-queue-item";
import { Badge } from "@qoovex/ui/components/badge";
import { Button } from "@qoovex/ui/components/button";
import {
  IconClock,
  IconAlertTriangle,
  IconCheck,
  IconArrowRight,
  IconBuildingStore,
  IconFileCertificate,
} from "@tabler/icons-react";

export default function WorkQueueItemCatalogPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Work Queue Item"
        description="Scheda operativa glassmorphic per code di lavoro, approvazioni e task pendenti con livelli di priorità cromatici OKLCH."
        importPath="import { WorkQueueItem, WorkQueueItemContent, WorkQueueItemTitle, WorkQueueItemDescription, WorkQueueItemActions } from '@qoovex/ui/components/work-queue-item'"
      />

      <div className="flex flex-col gap-12">
        {/* ── Livelli di Priorità ──────────────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Livelli di Priorità & Superfici Glassmorphic</h2>
          <div className="space-y-4">
            <Specimen title="Priority: Default (Sfondo Glassmorphic Neutro)">
              <WorkQueueItem priority="default">
                <WorkQueueItemContent>
                  <div className="flex items-center gap-2">
                    <IconCheck className="size-4 text-success" />
                    <WorkQueueItemTitle>Fotografie di avanzamento caricate</WorkQueueItemTitle>
                  </div>
                  <WorkQueueItemDescription>
                    Cantiere Via Roma 42 · Inviate dal Direttore Lavori con nota allegata
                  </WorkQueueItemDescription>
                </WorkQueueItemContent>
                <WorkQueueItemActions>
                  <Badge variant="success">Condiviso</Badge>
                  <Button size="sm" variant="ghost" className="h-8 text-xs">
                    Dettagli
                  </Button>
                </WorkQueueItemActions>
              </WorkQueueItem>
            </Specimen>

            <Specimen title="Priority: Attention (Superficie Warning OKLCH)">
              <WorkQueueItem priority="attention">
                <WorkQueueItemContent>
                  <div className="flex items-center gap-2">
                    <IconClock className="size-4 text-warning-emphasis" />
                    <WorkQueueItemTitle>La variante punti luce richiede risposta</WorkQueueItemTitle>
                  </div>
                  <WorkQueueItemDescription>
                    In attesa di conferma del cliente entro 24 ore per approvazione preventivo
                  </WorkQueueItemDescription>
                </WorkQueueItemContent>
                <WorkQueueItemActions>
                  <Badge variant="warning">In attesa</Badge>
                  <Button size="sm" variant="outline" className="h-8 gap-1 text-xs">
                    Rispondi <IconArrowRight className="size-3" />
                  </Button>
                </WorkQueueItemActions>
              </WorkQueueItem>
            </Specimen>

            <Specimen title="Priority: Blocking (Superficie Destructive OKLCH)">
              <WorkQueueItem priority="blocking">
                <WorkQueueItemContent>
                  <div className="flex items-center gap-2">
                    <IconAlertTriangle className="size-4 text-destructive" />
                    <WorkQueueItemTitle>Certificato DURC in scadenza bloccante</WorkQueueItemTitle>
                  </div>
                  <WorkQueueItemDescription className="text-destructive/90 font-medium">
                    Sospensione automatica accessi cantiere tra 3 giorni per irreperibilità documento
                  </WorkQueueItemDescription>
                </WorkQueueItemContent>
                <WorkQueueItemActions>
                  <Badge variant="destructive">Bloccante</Badge>
                  <Button size="sm" variant="destructive" className="h-8 text-xs">
                    Rinnova Ora
                  </Button>
                </WorkQueueItemActions>
              </WorkQueueItem>
            </Specimen>
          </div>
        </section>

        {/* ── Casi d'Uso Dashboard ──────────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Casi d'Uso in Dashboard Operativa</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Approvazione Delega di Spesa">
              <WorkQueueItem priority="attention" className="w-full">
                <WorkQueueItemContent>
                  <div className="flex items-center gap-2">
                    <IconBuildingStore className="size-4 text-warning-emphasis" />
                    <WorkQueueItemTitle>Delega Spesa € 12.500</WorkQueueItemTitle>
                  </div>
                  <WorkQueueItemDescription>
                    Fornitura materiale isolante termico Cantiere Parco Sud
                  </WorkQueueItemDescription>
                </WorkQueueItemContent>
                <WorkQueueItemActions>
                  <Button size="sm" variant="default" className="h-7 text-xs">
                    Approva
                  </Button>
                </WorkQueueItemActions>
              </WorkQueueItem>
            </Specimen>

            <Specimen title="Verifica Subappalto Pendente">
              <WorkQueueItem priority="default" className="w-full">
                <WorkQueueItemContent>
                  <div className="flex items-center gap-2">
                    <IconFileCertificate className="size-4 text-info" />
                    <WorkQueueItemTitle>Verifica POS Impresa Edile</WorkQueueItemTitle>
                  </div>
                  <WorkQueueItemDescription>
                    Documentazione caricata da Rossi Impianti srl
                  </WorkQueueItemDescription>
                </WorkQueueItemContent>
                <WorkQueueItemActions>
                  <Badge variant="info">In Revisione</Badge>
                </WorkQueueItemActions>
              </WorkQueueItem>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
