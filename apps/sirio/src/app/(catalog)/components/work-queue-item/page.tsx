"use client";

import Link from "next/link";
import { Badge } from "@qoovex/ui/components/badge";
import { Button } from "@qoovex/ui/components/button";
import {
  WorkQueueItem,
  WorkQueueItemActions,
  WorkQueueItemContent,
  WorkQueueItemDescription,
  WorkQueueItemTitle,
} from "@qoovex/ui/components/work-queue-item";
import { PageHeader } from "@/components/page-header";
import { Specimen } from "@/components/specimen";

export default function WorkQueueItemCatalogPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Work Queue Item"
        description="Primitiva presentazionale per un elemento di coda operativa. Composizione, gruppi, responsabilità ed empty state sono definiti nel pattern Work Queue."
        importPath="import { WorkQueueItem, WorkQueueItemContent, WorkQueueItemTitle, WorkQueueItemDescription, WorkQueueItemActions } from '@qoovex/ui/components/work-queue-item'"
      />

      <p className="mb-8 max-w-3xl leading-7 text-muted-foreground">
        Questa pagina documenta le varianti visuali del componente. Per decidere quando creare una coda, quali dati mostrare
        e come classificare gli elementi, consulta{" "}
        <Link className="text-primary" data-link="inline" href="/patterns/work-queue">il pattern Work Queue</Link>.
      </p>

      <section aria-labelledby="priority-levels-title">
        <h2 id="priority-levels-title" className="mb-4 text-2xl font-semibold tracking-tight">Varianti di priorità</h2>
        <div className="space-y-4">
          <Specimen title="Default · contesto consultabile o in attesa">
            <WorkQueueItem priority="default">
              <WorkQueueItemContent>
                <WorkQueueItemTitle>Attendi l’accettazione del cliente</WorkQueueItemTitle>
                <WorkQueueItemDescription>
                  Bagno principale · L’invito è stato inviato e il Cliente deve accettarlo.
                </WorkQueueItemDescription>
              </WorkQueueItemContent>
              <WorkQueueItemActions>
                <Badge variant="info">Invito inviato</Badge>
                <Button size="sm" type="button" variant="outline">Apri invito</Button>
              </WorkQueueItemActions>
            </WorkQueueItem>
          </Specimen>

          <Specimen title="Attention · intervento o controllo richiesto">
            <WorkQueueItem priority="attention">
              <WorkQueueItemContent>
                <WorkQueueItemTitle>Valuta la proposta del cliente</WorkQueueItemTitle>
                <WorkQueueItemDescription>
                  Ristrutturazione cucina · Il Cliente ha inviato una proposta di modifica da valutare.
                </WorkQueueItemDescription>
              </WorkQueueItemContent>
              <WorkQueueItemActions>
                <Badge variant="warning">Decisione richiesta</Badge>
                <Button size="sm" type="button" variant="outline">Apri proposta</Button>
              </WorkQueueItemActions>
            </WorkQueueItem>
          </Specimen>

          <Specimen title="Blocking · impedimento reale già previsto dal dominio">
            <WorkQueueItem priority="blocking">
              <WorkQueueItemContent>
                <WorkQueueItemTitle>Richiesta da risolvere</WorkQueueItemTitle>
                <WorkQueueItemDescription>
                  Ristrutturazione cucina · La richiesta “Consegna materiali” è ancora aperta e impedisce la proposta di chiusura.
                </WorkQueueItemDescription>
              </WorkQueueItemContent>
              <WorkQueueItemActions>
                <Badge variant="warning">Blocca la chiusura</Badge>
                <Button size="sm" type="button" variant="outline">Apri richiesta</Button>
              </WorkQueueItemActions>
            </WorkQueueItem>
          </Specimen>
        </div>
      </section>
    </div>
  );
}
