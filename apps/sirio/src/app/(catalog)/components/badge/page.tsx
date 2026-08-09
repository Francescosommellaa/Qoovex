import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import { Badge } from "@qoovex/ui/components/badge";
import {
  IconCheck,
  IconAlertTriangle,
  IconInfoCircle,
  IconShieldCheck,
  IconFlame,
} from "@tabler/icons-react";

export default function BadgePage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Badge"
        description="Piccolo indicatore visivo per status, etichette e metadati stilizzato con bordi di precisione e supporto per dimensioni e glassmorphism."
        importPath="import { Badge } from '@qoovex/ui/components/badge'"
      />

      <div className="flex flex-col gap-12">
        {/* ── Varianti di Colore e Stato ─────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Varianti di Colore & Stato</h2>
          <SpecimenGrid cols={3}>
            <Specimen title="Default & Primary">
              <Badge>Attivo</Badge>
            </Specimen>

            <Specimen title="Secondary & Neutral">
              <Badge variant="secondary">In Bozza</Badge>
            </Specimen>

            <Specimen title="Outline & Glass">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Standard</Badge>
                <Badge variant="glass">Glassmorphism</Badge>
              </div>
            </Specimen>

            <Specimen title="Success & Confermato">
              <Badge variant="success">
                <IconCheck /> Confermato
              </Badge>
            </Specimen>

            <Specimen title="Warning & Attenzione">
              <Badge variant="warning">
                <IconAlertTriangle /> In Revisione
              </Badge>
            </Specimen>

            <Specimen title="Destructive & Errore">
              <Badge variant="destructive">Sospeso</Badge>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── Indicatore di Stato Pulsante (Status Dots) ──────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Indicatori con Punto di Stato (Status Dots)</h2>
          <SpecimenGrid cols={3}>
            <Specimen title="Live & Operativo">
              <Badge variant="success" className="gap-2">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-success" />
                </span>
                Cantiere Attivo
              </Badge>
            </Specimen>

            <Specimen title="Info & Sincronizzazione">
              <Badge variant="info" className="gap-2">
                <span className="size-2 rounded-full bg-info" />
                Sync in corso
              </Badge>
            </Specimen>

            <Specimen title="Allarme / Critico">
              <Badge variant="destructive" className="gap-2">
                <span className="size-2 rounded-full bg-destructive" />
                Blocco Legale
              </Badge>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── Dimensioni (Sizes) ─────────────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Dimensioni (Sizes)</h2>
          <SpecimenGrid cols={3}>
            <Specimen title="Small (sm)">
              <div className="flex items-center gap-2">
                <Badge size="sm" variant="success">
                  v2.4.0
                </Badge>
                <Badge size="sm" variant="outline">
                  PROD
                </Badge>
              </div>
            </Specimen>

            <Specimen title="Default (md)">
              <div className="flex items-center gap-2">
                <Badge variant="info">
                  <IconInfoCircle /> Info Cantiere
                </Badge>
              </div>
            </Specimen>

            <Specimen title="Large (lg)">
              <div className="flex items-center gap-2">
                <Badge size="lg" variant="glass">
                  <IconFlame className="text-warning" /> Feature In Evidenza
                </Badge>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
