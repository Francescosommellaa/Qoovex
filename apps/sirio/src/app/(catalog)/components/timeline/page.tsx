import Link from "next/link";
import { IconCheck, IconClock, IconTool } from "@tabler/icons-react";
import {
  Timeline,
  TimelineActor,
  TimelineContent,
  TimelineEntry,
  TimelineMarker,
} from "@qoovex/ui/components/timeline";
import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";

export default function TimelineCatalogPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Timeline"
        description="Primitive presentazionali per comporre cronologie ordinate, marcatori, contenuti e attori. Il significato degli eventi appartiene al presentation layer del consumer."
        importPath="import { Timeline, TimelineEntry, TimelineMarker, TimelineContent, TimelineActor } from '@qoovex/ui/components/timeline'"
      />

      <div className="flex flex-col gap-12">
        <section aria-labelledby="timeline-composition-title">
          <div className="max-w-3xl">
            <h2 id="timeline-composition-title" className="text-2xl font-semibold tracking-tight">Composizione base</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              Questo specimen verifica le primitive condivise. Per gerarchia, copy, fallback e dettagli degli eventi usa il pattern{" "}
              <Link className="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground" href="/patterns/timeline-event">
                Timeline Event
              </Link>.
            </p>
          </div>
          <SpecimenGrid cols={1}>
            <Specimen title="Cronologia leggibile">
              <div className="w-full max-w-2xl py-2">
                <Timeline aria-label="Esempio di cronologia">
                  <TimelineEntry>
                    <TimelineMarker variant="active"><IconTool /></TimelineMarker>
                    <TimelineContent>
                      <h3 className="text-sm font-semibold">Aggiornamento lavori</h3>
                      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">Completata la posa sul lato nord.</p>
                      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border/40 pt-2">
                        <TimelineActor>Marco Rossi</TimelineActor>
                        <span aria-hidden="true" className="text-xs text-muted-foreground">·</span>
                        <time className="text-xs text-muted-foreground" dateTime="2026-08-12T10:30:00+02:00">12 ago 2026, 10:30</time>
                      </div>
                    </TimelineContent>
                  </TimelineEntry>
                </Timeline>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>

        <section aria-labelledby="timeline-markers-title">
          <h2 id="timeline-markers-title" className="mb-4 text-2xl font-semibold tracking-tight">Marcatori</h2>
          <SpecimenGrid cols={3}>
            <Specimen title="Neutro">
              <div className="flex flex-col items-center gap-2">
                <TimelineMarker variant="default"><IconClock /></TimelineMarker>
                <span className="text-xs text-muted-foreground">Evento registrato</span>
              </div>
            </Specimen>
            <Specimen title="Informativo">
              <div className="flex flex-col items-center gap-2">
                <TimelineMarker variant="active"><IconTool /></TimelineMarker>
                <span className="text-xs font-medium text-primary">Aggiornamento</span>
              </div>
            </Specimen>
            <Specimen title="Completato">
              <div className="flex flex-col items-center gap-2">
                <TimelineMarker variant="success"><IconCheck /></TimelineMarker>
                <span className="text-xs font-medium text-success">Confermato</span>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
