import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import { Badge } from "@qoovex/ui/components/badge";
import {
  IconCheck,
  IconAlertTriangle,
  IconInfoCircle,
  IconAlertCircle,
} from "@tabler/icons-react";

export default function BadgePage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Badge"
        description="Primitiva compatta per etichette, metadati e rappresentazioni di stato. Il significato di prodotto appartiene al pattern Status Presentation."
        importPath="import { Badge } from '@qoovex/ui/components/badge'"
      />

      <div className="flex flex-col gap-12">
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Varianti semantiche</h2>
          <SpecimenGrid cols={3}>
            <Specimen title="Default">
              <Badge>Etichetta</Badge>
            </Specimen>

            <Specimen title="Secondary">
              <Badge variant="secondary">Informazione secondaria</Badge>
            </Specimen>

            <Specimen title="Outline e glass">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Neutro</Badge>
                <Badge variant="glass">In evidenza</Badge>
              </div>
            </Specimen>

            <Specimen title="Success">
              <Badge variant="success">
                <IconCheck aria-hidden="true" /> Completato
              </Badge>
            </Specimen>

            <Specimen title="Warning">
              <Badge variant="warning">
                <IconAlertTriangle aria-hidden="true" /> Richiede attenzione
              </Badge>
            </Specimen>

            <Specimen title="Destructive">
              <Badge variant="destructive"><IconAlertCircle aria-hidden="true" /> Errore</Badge>
            </Specimen>
          </SpecimenGrid>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Dimensioni</h2>
          <SpecimenGrid cols={3}>
            <Specimen title="Small (sm)">
              <div className="flex items-center gap-2">
                <Badge size="sm" variant="success">
                  Etichetta breve
                </Badge>
                <Badge size="sm" variant="outline">
                  Metadato
                </Badge>
              </div>
            </Specimen>

            <Specimen title="Default (md)">
              <div className="flex items-center gap-2">
                <Badge variant="info">
                  <IconInfoCircle aria-hidden="true" /> Informazione
                </Badge>
              </div>
            </Specimen>

            <Specimen title="Large (lg)">
              <div className="flex items-center gap-2">
                <Badge size="lg" variant="success">
                  <IconCheck aria-hidden="true" /> Operazione completata
                </Badge>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>

        <section className="max-w-3xl rounded-xl border bg-card p-5 sm:p-6" aria-labelledby="product-status-title">
          <h2 id="product-status-title" className="text-xl font-semibold tracking-tight">Stati di prodotto</h2>
          <p className="mt-2 leading-7 text-muted-foreground">
            Questa pagina documenta la primitiva. Label, tono, descrizione ed eventuale azione di uno stato reale sono
            definiti dal pattern <Link className="font-medium text-foreground underline underline-offset-4" href="/patterns/status-presentation">Status Presentation</Link>,
            non dal componente Badge e non dalla singola pagina prodotto.
          </p>
        </section>
      </div>
    </div>
  );
}
