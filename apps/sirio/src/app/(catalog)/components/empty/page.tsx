"use client";

import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
  EmptyActions,
} from "@qoovex/ui/components/empty";
import { Button } from "@qoovex/ui/components/button";
import {
  IconBuildingStore,
  IconSearchOff,
  IconBellOff,
  IconFileUpload,
  IconPlus,
  IconRotateClockwise,
} from "@tabler/icons-react";

export default function EmptyCatalogPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Empty State"
        description="Componente visivo per comunicare l'assenza di dati, guide per l'avvio e stati di ricerca vuoti con azioni di recupero chiare."
        importPath="import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia, EmptyActions } from '@qoovex/ui/components/empty'"
      />

      <div className="flex flex-col gap-12">
        {/* ── Sezione 1: Superfici & Casi d'Uso ────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Superfici e Casi d'Uso</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Superficie Tratteggiata (Creazione Cantiere)" visualId="empty-default">
              <Empty variant="dashed">
                <EmptyMedia variant="badge">
                  <IconBuildingStore />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>Nessun lavoro ancora creato</EmptyTitle>
                  <EmptyDescription>
                    Quando creerai un lavoro, lo troverai qui.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyActions>
                  <Button>
                    <IconPlus />
                    <span>Crea lavoro</span>
                  </Button>
                </EmptyActions>
              </Empty>
            </Specimen>

            <Specimen title="Superficie Card (Drag & Drop Documenti)">
              <Empty variant="card">
                <EmptyMedia variant="icon">
                  <IconFileUpload />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>Trascina qui i tuoi documenti</EmptyTitle>
                  <EmptyDescription>
                    Scegli un file da allegare al contesto corretto. I tipi accettati sono indicati quando il flusso li definisce.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyActions>
                  <Button variant="outline" size="sm">
                    Sfoglia File
                  </Button>
                </EmptyActions>
              </Empty>
            </Specimen>

            <Specimen title="Stato Vuoto Ricerca (outline)">
              <Empty variant="outline">
                <EmptyMedia variant="icon">
                  <IconSearchOff />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>Nessun risultato trovato</EmptyTitle>
                  <EmptyDescription>
                    Nessun cantiere o documento corrisponde ai filtri di ricerca impostati. Prova a modificare i termini inseriti.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyActions>
                  <Button variant="secondary" size="sm">
                    <IconRotateClockwise />
                    <span>Azzera Filtri</span>
                  </Button>
                </EmptyActions>
              </Empty>
            </Specimen>

            <Specimen title="Stato Vuoto Notifiche (ghost)">
              <Empty variant="ghost">
                <EmptyMedia variant="icon">
                  <IconBellOff />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>Tutto aggiornato!</EmptyTitle>
                  <EmptyDescription>
                    Non ci sono nuove notifiche o aggiornamenti da leggere al momento.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
