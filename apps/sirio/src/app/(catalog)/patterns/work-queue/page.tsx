"use client";

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

type QueueExampleProps = {
  action: string;
  actor: string;
  detail: string;
  jobSite: string;
  priority?: "attention" | "default";
  state: string;
  stateVariant: "info" | "warning";
  title: string;
};

function QueueExample({ action, actor, detail, jobSite, priority = "default", state, stateVariant, title }: QueueExampleProps) {
  return (
    <WorkQueueItem priority={priority}>
      <WorkQueueItemContent>
        <WorkQueueItemTitle>{title}</WorkQueueItemTitle>
        <WorkQueueItemDescription>
          <span className="font-medium text-foreground">{jobSite}</span> · {detail}
        </WorkQueueItemDescription>
        <dl className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs">
          <div className="flex items-center gap-2">
            <dt className="font-medium text-foreground">Stato</dt>
            <dd><Badge variant={stateVariant}>{state}</Badge></dd>
          </div>
          <div className="flex items-center gap-1">
            <dt className="font-medium text-foreground">Deve intervenire:</dt>
            <dd>{actor}</dd>
          </div>
        </dl>
      </WorkQueueItemContent>
      <WorkQueueItemActions>
        <Button size="sm" type="button" variant="outline">{action}</Button>
      </WorkQueueItemActions>
    </WorkQueueItem>
  );
}

const itemInformation = [
  ["Titolo", "Descrive l’azione o la situazione in linguaggio umano."],
  ["Contesto", "Nomina il lavoro e aggiunge solo il dettaglio necessario per distinguerlo."],
  ["Stato", "Usa una label comprensibile e coerente con lo stato reale."],
  ["Responsabile", "Dichiara chi deve intervenire: l’utente, l’Azienda o il Cliente."],
  ["Azione", "Apre direttamente l’elemento o la sezione in cui si può continuare."],
] as const;

const categoryRules = [
  ["Richiede te", "Solo attività che l’utente Azienda può svolgere adesso."],
  ["Attende cliente", "Solo elementi fermi finché il Cliente non compie l’azione prevista."],
  ["Da verificare", "Elementi che richiedono un controllo Azienda, come una dichiarazione di pagamento ricevuta."],
] as const;

const accessibilityRules = [
  "Rendi la coda una lista e ogni gruppo una sezione con heading associato.",
  "Mantieni titolo, contesto, stato e responsabile disponibili come testo: il colore non basta.",
  "Usa un link per la CTA quando apre un’altra route o un’ancora e assicurati che il focus sia visibile.",
  "Su viewport stretti impila contenuto e azione; non troncare label, nomi del lavoro o focus ring.",
  "Mantieni l’ordine DOM uguale all’ordine di lettura: contenuto prima, azione dopo.",
] as const;

const mistakes = [
  "Creare task da uno stato generico senza verificare che esista un’azione reale.",
  "Inserire lo stesso elemento in più gruppi o confondere categoria operativa e priorità visuale.",
  "Mostrare enum, ID, scadenze inventate, payload o nomi di proprietà backend.",
  "Usare CTA generiche come “Gestisci” quando è possibile nominare l’oggetto da aprire.",
  "Presentare Qoovex come certificatore, arbitro, garante o sistema che esegue pagamenti.",
] as const;

export default function WorkQueuePatternPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Work Queue"
        description="Pattern operativo per mostrare ciò che richiede un intervento, ciò che attende l’altra parte e ciò che deve essere controllato, usando soltanto azioni e stati reali del Workspace."
      />

      <div className="flex flex-col gap-12">
        <section aria-labelledby="when-to-use-title" className="max-w-3xl">
          <h2 id="when-to-use-title" className="text-2xl font-semibold tracking-tight">Quando usarla</h2>
          <div className="mt-3 space-y-3 leading-7 text-muted-foreground">
            <p>
              Usa una work queue quando una superficie deve rispondere subito a “che cosa devo fare adesso?”.
              Ogni elemento deve derivare da un’azione realmente disponibile o da un’attesa verificabile.
            </p>
            <p>
              Non usarla come lista di attività recenti, riepilogo di tutti i lavori o audit log. Gli eventi spiegano
              che cosa è successo; la work queue spiega che cosa serve fare o controllare ora.
            </p>
          </div>
        </section>

        <section aria-labelledby="item-anatomy-title">
          <div className="max-w-3xl">
            <h2 id="item-anatomy-title" className="text-2xl font-semibold tracking-tight">Informazioni di ogni item</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              La gerarchia parte dall’azione, prosegue con il contesto e rende espliciti stato e persona che deve intervenire.
            </p>
          </div>
          <dl className="mt-6 divide-y divide-border rounded-xl border bg-card px-4 sm:px-6">
            {itemInformation.map(([term, description]) => (
              <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6" key={term}>
                <dt className="font-semibold text-foreground">{term}</dt>
                <dd className="leading-6 text-muted-foreground">{description}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="groups-title">
          <div className="max-w-3xl">
            <h2 id="groups-title" className="text-2xl font-semibold tracking-tight">Categorie operative</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              La home Azienda usa tre gruppi esclusivi. La home Cliente mostra invece soltanto “Da fare”, perché include
              esclusivamente azioni che il Cliente può svolgere ora: non forzare questi gruppi su ruoli o dati che non li supportano.
            </p>
          </div>
          <dl className="mt-6 grid gap-4 md:grid-cols-3">
            {categoryRules.map(([term, description]) => (
              <div className="rounded-xl border bg-card p-5" key={term}>
                <dt className="font-semibold text-foreground">{term}</dt>
                <dd className="mt-2 text-sm leading-6 text-muted-foreground">{description}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
            La categoria descrive la responsabilità operativa. La priorità dell’item segnala invece attenzione o un blocco reale:
            sono due informazioni diverse e non devono essere dedotte l’una dall’altra.
          </p>
        </section>

        <section aria-labelledby="examples-title">
          <div className="max-w-3xl">
            <h2 id="examples-title" className="text-2xl font-semibold tracking-tight">Esempi canonici</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              Gli esempi riprendono situazioni presenti nelle work queue del Workspace. Le CTA sono specimen e non eseguono azioni.
            </p>
          </div>

          <div className="mt-6 space-y-8">
            <section aria-labelledby="requires-action-example" className="space-y-3">
              <div>
                <h3 id="requires-action-example" className="text-lg font-semibold">Richiede un’azione</h3>
                <p className="text-sm text-muted-foreground">L’utente può aprire il contesto e intervenire subito.</p>
              </div>
              <QueueExample action="Apri riepilogo" actor="Tu" detail="L’Azienda ha pubblicato il riepilogo iniziale da controllare." jobSite="Ristrutturazione cucina" priority="attention" state="Conferma richiesta" stateVariant="warning" title="Conferma il riepilogo iniziale" />
            </section>

            <section aria-labelledby="waiting-example" className="space-y-3">
              <div>
                <h3 id="waiting-example" className="text-lg font-semibold">Attende l’altra parte</h3>
                <p className="text-sm text-muted-foreground">L’Azienda vede che l’invito è partito e che ora deve agire il Cliente.</p>
              </div>
              <QueueExample action="Apri invito" actor="Cliente" detail="L’invito è stato inviato e il Cliente deve accettarlo." jobSite="Bagno principale" state="Invito inviato" stateVariant="info" title="Attendi l’accettazione del cliente" />
            </section>

            <section aria-labelledby="review-example" className="space-y-3">
              <div>
                <h3 id="review-example" className="text-lg font-semibold">Da verificare</h3>
                <p className="text-sm text-muted-foreground">La revisione riguarda ciò che il Cliente ha dichiarato, non una verifica automatica di Qoovex.</p>
              </div>
              <QueueExample action="Apri pagamento" actor="Azienda" detail="Acconto materiali: il Cliente ha inviato una dichiarazione da rivedere." jobSite="Ristrutturazione cucina" priority="attention" state="Revisione richiesta" stateVariant="warning" title="Controlla la dichiarazione di pagamento" />
            </section>

            <section aria-labelledby="empty-example" className="space-y-3">
              <div>
                <h3 id="empty-example" className="text-lg font-semibold">Empty state</h3>
                <p className="text-sm text-muted-foreground">Conferma l’assenza di attività e indica che resta possibile consultare i lavori.</p>
              </div>
              <p className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
                Al momento non è richiesto nessun tuo intervento. Puoi consultare i tuoi lavori.
              </p>
            </section>
          </div>
        </section>

        <section aria-labelledby="actions-title" className="max-w-3xl">
          <h2 id="actions-title" className="text-2xl font-semibold tracking-tight">Gerarchia delle azioni</h2>
          <div className="mt-3 space-y-3 leading-7 text-muted-foreground">
            <p>
              Mantieni una CTA breve e specifica per item, allineata al deep link reale: “Apri proposta”, “Apri pagamento”
              o “Apri riepilogo”. Un item in attesa può offrire un collegamento per consultare il contesto, ma non deve
              simulare un’azione disponibile all’utente corrente.
            </p>
            <p>
              Gli elementi chiusi o non più azionabili non competono con quelli aperti. Se restano consultabili, spostali
              nello storico o nella superficie di dettaglio appropriata.
            </p>
          </div>
        </section>

        <section aria-labelledby="accessibility-title">
          <div className="max-w-3xl">
            <h2 id="accessibility-title" className="text-2xl font-semibold tracking-tight">Responsive e accessibilità</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              La coda deve conservare ordine, significato e azioni anche senza colore, hover o layout a più colonne.
            </p>
          </div>
          <ul className="mt-5 max-w-3xl list-disc space-y-2 pl-5 leading-7 text-muted-foreground">
            {accessibilityRules.map((rule) => <li key={rule}>{rule}</li>)}
          </ul>
        </section>

        <section aria-labelledby="mistakes-title">
          <div className="max-w-3xl">
            <h2 id="mistakes-title" className="text-2xl font-semibold tracking-tight">Errori da evitare</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              Una work queue non introduce regole: rende leggibili responsabilità e azioni già determinate dal prodotto.
            </p>
          </div>
          <ul className="mt-5 max-w-3xl list-disc space-y-2 pl-5 leading-7 text-muted-foreground">
            {mistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}
          </ul>
        </section>
      </div>
    </div>
  );
}
