import type { ReactNode } from "react";
import Link from "next/link";
import {
  IconAlertTriangle,
  IconArchive,
  IconCircleCheck,
  IconClock,
  IconHelpCircle,
} from "@tabler/icons-react";
import { Badge } from "@qoovex/ui/components/badge";
import { PageHeader } from "@/components/page-header";

type StatusSpecimenVariant = "destructive" | "outline" | "success" | "warning";

type StatusSpecimenProps = {
  action?: string;
  description?: string;
  icon?: ReactNode;
  label: string;
  specimenLabel: string;
  variant: StatusSpecimenVariant;
};

const presentationAnatomy = [
  ["Label", "Traduce lo stato nel linguaggio del prodotto e descrive fedelmente la condizione corrente."],
  ["Tono", "Sceglie una variante semantica coerente: positivo, attenzione, informazione, errore o neutro."],
  ["Descrizione", "Aggiunge una frase breve solo quando chiarisce attesa, conseguenza o contesto."],
  ["Icona", "Rafforza il significato quando utile, senza sostituire la label e senza diventare rumore decorativo."],
  ["Prossima azione", "Compare solo quando capability e contesto reali indicano che l’utente può agire adesso."],
] as const;

const componentChoices = [
  ["Badge", "Per uno stato compatto accanto a titolo, elemento di lista o riepilogo."],
  ["Testo di stato", "Quando la frase deve entrare naturalmente nel contenuto o lo spazio è molto denso."],
  ["Badge e descrizione", "Per attese, stati poco familiari o condizioni che richiedono una spiegazione immediata."],
  ["Stato e azione", "Solo quando il consumer riceve anche un’azione disponibile dal servizio o dalla vista corrente."],
] as const;

const accessibilityRules = [
  "Mantieni sempre una label testuale visibile: colore, bordo e icona non comunicano lo stato da soli.",
  "Nascondi l’icona allo screen reader quando ripete il significato già espresso dalla label.",
  "Non affidare una descrizione importante al solo attributo title, all’hover o a un tooltip.",
  "Usa i token semantici del design system, verificati per contrasto in light e dark mode.",
  "Su viewport stretti consenti a label e descrizione di andare a capo senza troncare contenuto o focus ring.",
  "Annuncia un cambiamento con una live region solo se avviene dinamicamente e richiede davvero attenzione immediata.",
] as const;

const mistakes = [
  "Renderizzare il valore ricevuto dal backend o trasformarlo meccanicamente sostituendo underscore e maiuscole.",
  "Usare un solo dizionario globale quando lo stesso valore assume significati diversi in contesti diversi.",
  "Dedurre priorità, permessi o prossime azioni dal colore del badge.",
  "Aggiungere descrizioni, conseguenze o urgenze che il dominio non dimostra.",
  "Creare mapping locali nelle singole pagine o una seconda mappa di dominio dentro Sirio.",
] as const;

function StatusSpecimen({
  action,
  description,
  icon,
  label,
  specimenLabel,
  variant,
}: StatusSpecimenProps) {
  return (
    <article className="min-w-0 py-5 first:pt-0 last:pb-0" aria-label={specimenLabel}>
      <Badge variant={variant}>
        {icon}
        {label}
      </Badge>
      {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p> : null}
      {action ? (
        <dl className="mt-2 flex flex-wrap gap-x-2 text-sm">
          <dt className="font-medium text-foreground">Prossima azione:</dt>
          <dd className="text-muted-foreground">{action}</dd>
        </dl>
      ) : null}
    </article>
  );
}

export default function StatusPresentationPatternPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Status Presentation"
        description="Pattern canonico per trasformare uno stato di dominio in una rappresentazione umana, coerente e operativa senza esporre il modello tecnico sottostante."
      />

      <div className="flex flex-col gap-12">
        <section aria-labelledby="principle-title" className="max-w-3xl">
          <h2 id="principle-title" className="text-2xl font-semibold tracking-tight">Lo stato di backend non è copy finale</h2>
          <div className="mt-3 space-y-3 leading-7 text-muted-foreground">
            <p>
              Ogni superficie riceve una presentazione tipizzata con label e tono già definiti nel contesto di dominio.
              Descrizione e icona sono facoltative; la prossima azione resta separata e deriva soltanto dalle capability
              realmente disponibili per ruolo, stato e dati correnti.
            </p>
            <p>
              Lo stesso valore tecnico può descrivere entità diverse. Per questo la traduzione è specifica del contesto
              e non una conversione generica del nome ricevuto dal backend.
            </p>
          </div>
        </section>

        <section id="source-of-actions" aria-labelledby="source-title" className="max-w-3xl rounded-xl border bg-card p-5 sm:p-6">
          <h2 id="source-title" className="text-xl font-semibold tracking-tight">Una sola fonte per stato e azioni</h2>
          <p className="mt-2 leading-7 text-muted-foreground">
            Nel Workspace il presenter di stato produce label, tono ed eventuale descrizione. I consumer, come
            <code className="mx-1 font-accent text-sm text-foreground">WorkspaceState</code>, si limitano a renderizzare
            quell’output. Le azioni arrivano invece dai servizi e dalle viste che conoscono capability e ruolo. Sirio
            documenta output verificati: non importa il dominio del Workspace e non mantiene un mapper parallelo.
          </p>
        </section>

        <section aria-labelledby="anatomy-title">
          <div className="max-w-3xl">
            <h2 id="anatomy-title" className="text-2xl font-semibold tracking-tight">Anatomia della presentazione</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              La label comunica sempre il significato. Gli altri elementi aggiungono contesto soltanto quando servono.
            </p>
          </div>
          <dl className="mt-6 divide-y divide-border rounded-xl border bg-card px-4 sm:px-6">
            {presentationAnatomy.map(([term, description]) => (
              <div className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6" key={term}>
                <dt className="font-semibold text-foreground">{term}</dt>
                <dd className="leading-6 text-muted-foreground">{description}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="examples-title">
          <div className="max-w-3xl">
            <h2 id="examples-title" className="text-2xl font-semibold tracking-tight">Stati reali, presentati per le persone</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              Gli specimen usano output già definiti dal presentation layer del Workspace. Le frasi di supporto e
              l’azione mostrate appartengono ai contesti reali indicati, non vengono dedotte dal tono.
            </p>
          </div>
          <div className="mt-6 divide-y divide-border rounded-xl border bg-card px-4 sm:px-6">
            <StatusSpecimen
              specimenLabel="Esempio di stato completato"
              label="Lavoro confermato"
              variant="success"
              icon={<IconCircleCheck aria-hidden="true" className="size-4" />}
            />
            <StatusSpecimen
              specimenLabel="Esempio di stato in attesa"
              label="Attende conferma del cliente"
              variant="warning"
              icon={<IconClock aria-hidden="true" className="size-4" />}
              description="Il riepilogo è stato pubblicato e il cliente deve confermarlo."
              action="Controlla il riepilogo"
            />
            <StatusSpecimen
              specimenLabel="Esempio di stato che richiede attenzione"
              label="Dichiarazione da chiarire"
              variant="destructive"
              icon={<IconAlertTriangle aria-hidden="true" className="size-4" />}
            />
            <StatusSpecimen
              specimenLabel="Esempio di stato chiuso e non operativo"
              label="Cantiere archiviato"
              variant="outline"
              icon={<IconArchive aria-hidden="true" className="size-4" />}
              description="Il lavoro non richiede azioni operative. Riepilogo e storico restano consultabili."
            />
          </div>
        </section>

        <section aria-labelledby="fallback-title">
          <div className="max-w-3xl">
            <h2 id="fallback-title" className="text-2xl font-semibold tracking-tight">Fallback neutro e senza leakage</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              Un valore non riconosciuto non viene interpretato, trasformato o mostrato. Il presenter restituisce una
              label neutra, non assegna descrizioni o azioni inventate e lascia visibile il contesto dell’elemento.
            </p>
          </div>
          <div className="mt-6 max-w-3xl rounded-xl border bg-card p-4 sm:p-6">
            <StatusSpecimen
              specimenLabel="Esempio di fallback per stato non riconosciuto"
              label="Stato non disponibile"
              variant="outline"
              icon={<IconHelpCircle aria-hidden="true" className="size-4" />}
            />
          </div>
        </section>

        <section aria-labelledby="component-choice-title">
          <div className="max-w-3xl">
            <h2 id="component-choice-title" className="text-2xl font-semibold tracking-tight">Badge, testo o composizione</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              Il presenter definisce il significato; il consumer sceglie la forma adatta alla densità e all’importanza del contesto.
            </p>
          </div>
          <dl className="mt-6 divide-y divide-border rounded-xl border bg-card px-4 sm:px-6">
            {componentChoices.map(([term, description]) => (
              <div className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6" key={term}>
                <dt className="font-semibold text-foreground">{term}</dt>
                <dd className="leading-6 text-muted-foreground">{description}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
            Per API, dimensioni e varianti visuali della primitiva consulta la pagina <Link className="font-medium text-foreground underline underline-offset-4" href="/components/badge">Badge</Link>.
          </p>
        </section>

        <section aria-labelledby="accessibility-title">
          <div className="max-w-3xl">
            <h2 id="accessibility-title" className="text-2xl font-semibold tracking-tight">Responsive e accessibilità</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              La comprensione dello stato deve restare invariata senza colore, senza icone e su ogni viewport.
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
              La presentazione non deve ricostruire il dominio né sostituirsi alla sorgente che determina le azioni.
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
