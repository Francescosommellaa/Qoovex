import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import {
  Timeline,
  TimelineEntry,
  TimelineMarker,
  TimelineContent,
  TimelineActor,
  TimelineDateSeparator,
  TimelineTransition,
  TimelineArtifactReference,
} from "@qoovex/ui/components/timeline";
import { Badge } from "@qoovex/ui/components/badge";
import {
  IconCheck,
  IconClock,
  IconFileText,
  IconBuildingStore,
  IconPaperclip,
  IconAlertTriangle,
} from "@tabler/icons-react";

export default function TimelineCatalogPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Timeline"
        description="Cronologia append-only degli eventi di cantiere con tracciamento temporale, attori, transizioni di stato e allegati contestuali."
        importPath="import { Timeline, TimelineEntry, TimelineMarker, TimelineContent, ... } from '@qoovex/ui/components/timeline'"
      />

      <div className="flex flex-col gap-12">
        {/* ── Sezione 1: Flusso Cantiere Realistico ────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Flusso Eventi Cantiere</h2>
          <SpecimenGrid cols={1}>
            <Specimen title="Cronologia Attività e Transizioni">
              <div className="w-full max-w-2xl py-2">
                <Timeline>
                  <TimelineDateSeparator>10 Agosto 2026</TimelineDateSeparator>

                  <TimelineEntry>
                    <TimelineMarker variant="success">
                      <IconBuildingStore />
                    </TimelineMarker>
                    <TimelineContent>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">Creazione del Cantiere</span>
                          <Badge variant="secondary" className="font-accent text-[0.6875rem]">INTERNO</Badge>
                        </div>
                        <span className="font-accent text-xs text-muted-foreground">09:30</span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                        Cantiere registrato nell'area riservata dall'impresa. Configurate le proprietà iniziali e gli ambienti di lavoro.
                      </p>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40">
                        <TimelineActor>Marco Rossi (Responsabile Azienda)</TimelineActor>
                        <TimelineArtifactReference href="#">
                          <IconPaperclip />
                          <span>scheda_tecnica_infrastruttura.pdf</span>
                        </TimelineArtifactReference>
                      </div>
                    </TimelineContent>
                  </TimelineEntry>

                  <TimelineDateSeparator>11 Agosto 2026</TimelineDateSeparator>

                  <TimelineEntry>
                    <TimelineMarker variant="success">
                      <IconCheck />
                    </TimelineMarker>
                    <TimelineContent>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">Conferma Accordo Iniziale</span>
                          <Badge variant="default" className="font-accent text-[0.6875rem]">CONDIVISO</Badge>
                        </div>
                        <span className="font-accent text-xs text-muted-foreground">14:15</span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                        Il cliente ha confermato i termini del cantiere, lo stimato iniziale e la suddivisione degli step opzionali.
                      </p>
                      <TimelineTransition from="PENDING_INITIAL_CONFIRMATION" to="ACTIVE" />
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40">
                        <TimelineActor>Giuseppe Bianchi (Committente Primario)</TimelineActor>
                      </div>
                    </TimelineContent>
                  </TimelineEntry>

                  <TimelineDateSeparator>Oggi</TimelineDateSeparator>

                  <TimelineEntry>
                    <TimelineMarker variant="warning">
                      <IconFileText />
                    </TimelineMarker>
                    <TimelineContent>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">Proposta di Variante #02</span>
                          <Badge variant="outline" className="font-accent text-[0.6875rem] border-warning/50 text-warning-emphasis">IN ATTESA</Badge>
                        </div>
                        <span className="font-accent text-xs text-muted-foreground">16:45</span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                        Inviata proposta di variazione finiture per il bagno padronale con importo integrativo stimato.
                      </p>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40">
                        <TimelineActor>Marco Rossi (Azienda)</TimelineActor>
                        <TimelineArtifactReference href="#">
                          <IconPaperclip />
                          <span>preventivo_variante_02.pdf</span>
                        </TimelineArtifactReference>
                      </div>
                    </TimelineContent>
                  </TimelineEntry>
                </Timeline>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── Sezione 2: Varianti Marcatori ────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Marcatori di Stato</h2>
          <SpecimenGrid cols={3}>
            <Specimen title="Default">
              <div className="flex flex-col items-center gap-2">
                <TimelineMarker variant="default">
                  <IconClock />
                </TimelineMarker>
                <span className="text-xs text-muted-foreground">Neutral</span>
              </div>
            </Specimen>

            <Specimen title="Active">
              <div className="flex flex-col items-center gap-2">
                <TimelineMarker variant="active">
                  <IconClock />
                </TimelineMarker>
                <span className="text-xs text-primary font-medium">In corso</span>
              </div>
            </Specimen>

            <Specimen title="Success">
              <div className="flex flex-col items-center gap-2">
                <TimelineMarker variant="success">
                  <IconCheck />
                </TimelineMarker>
                <span className="text-xs text-success font-medium">Completato</span>
              </div>
            </Specimen>

            <Specimen title="Warning">
              <div className="flex flex-col items-center gap-2">
                <TimelineMarker variant="warning">
                  <IconAlertTriangle />
                </TimelineMarker>
                <span className="text-xs text-warning-emphasis font-medium">In Attesa</span>
              </div>
            </Specimen>

            <Specimen title="Destructive">
              <div className="flex flex-col items-center gap-2">
                <TimelineMarker variant="destructive">
                  <IconAlertTriangle />
                </TimelineMarker>
                <span className="text-xs text-destructive font-medium">Disputa</span>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
