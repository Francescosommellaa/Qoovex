import type { ComponentType } from "react";
import {
  IconArrowsExchange,
  IconCheck,
  IconCreditCard,
  IconHelpCircle,
  IconListCheck,
  IconMessageCircle,
  IconTool,
} from "@tabler/icons-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@qoovex/ui/components/collapsible";
import {
  Timeline,
  TimelineActor,
  TimelineEntry,
  TimelineMarker,
} from "@qoovex/ui/components/timeline";
import { PageHeader } from "@/components/page-header";

type TimelineSpecimen = {
  actor: string;
  dateTime: string;
  dateTimeLabel: string;
  description: string;
  details?: readonly { label: string; value: string }[];
  icon: ComponentType;
  title: string;
  variant: "active" | "default" | "success" | "warning";
};

const eventAnatomy = [
  ["Titolo", "Dice subito che cosa è successo con una frase umana e specifica."],
  ["Descrizione", "Aggiunge il significato dell’evento senza ripetere il titolo."],
  ["Attore", "Nomina la persona o la parte che ha agito, quando il dato è disponibile e utile."],
  ["Data e ora", "Usa il formato italiano leggibile e un elemento time con valore machine-readable."],
  ["Dettagli", "Mostra soltanto informazioni che cambiano la comprensione, come importo o stato presentato."],
] as const;

const examples = [
  {
    title: "Aggiornamento lavori",
    description: "Completata la posa sul lato nord.",
    actor: "Marco Rossi",
    dateTime: "2026-08-12T10:30:00+02:00",
    dateTimeLabel: "12 ago 2026, 10:30",
    details: [{ label: "Titolo", value: "Avanzamento facciata" }],
    icon: IconTool,
    variant: "active",
  },
  {
    title: "Chiarimento richiesto",
    description: "È stato richiesto un chiarimento sul cantiere.",
    actor: "Cliente",
    dateTime: "2026-08-12T11:15:00+02:00",
    dateTimeLabel: "12 ago 2026, 11:15",
    details: [{ label: "Richiesta", value: "Confermare la data prevista per la consegna" }],
    icon: IconMessageCircle,
    variant: "warning",
  },
  {
    title: "Modifica proposta",
    description: "È stata presentata una proposta di modifica.",
    actor: "Azienda",
    dateTime: "2026-08-12T14:20:00+02:00",
    dateTimeLabel: "12 ago 2026, 14:20",
    icon: IconArrowsExchange,
    variant: "active",
  },
  {
    title: "Pagamento richiesto",
    description: "È stata inviata una richiesta di pagamento documentata.",
    actor: "Azienda",
    dateTime: "2026-08-12T15:10:00+02:00",
    dateTimeLabel: "12 ago 2026, 15:10",
    details: [{ label: "Importo", value: "1.250,00 €" }],
    icon: IconCreditCard,
    variant: "active",
  },
  {
    title: "Riepilogo iniziale confermato",
    description: "Il cliente ha confermato il riepilogo iniziale del cantiere.",
    actor: "Cliente",
    dateTime: "2026-08-12T16:05:00+02:00",
    dateTimeLabel: "12 ago 2026, 16:05",
    icon: IconCheck,
    variant: "success",
  },
] as const satisfies readonly TimelineSpecimen[];

const accessibilityRules = [
  "Rendi la cronologia una lista ordinata e ogni evento un elemento con un heading coerente con la pagina.",
  "Mantieni titolo, descrizione, attore e data nell’ordine DOM in cui devono essere letti.",
  "Le icone nei marcatori sono decorative quando il titolo comunica già il significato e restano nascoste agli screen reader.",
  "Se un evento è raggiunto da un deep link, rendi il contenitore focalizzabile solo quando serve e assicurati che il focus resti visibile.",
  "Su viewport stretti impila i dettagli, consenti il ritorno a capo e non troncare testo, data o focus ring.",
  "La cronologia non è un live region: annuncia un nuovo evento soltanto se l’aggiornamento avviene in tempo reale e richiede attenzione immediata.",
] as const;

const mistakes = [
  "Renderizzare direttamente dati tecnici o serializzare il contenuto salvato.",
  "Usare il colore o un’icona come unica spiegazione del tipo o dell’esito.",
  "Trasformare ogni dettaglio disponibile in metadato visibile, anche quando non aiuta a capire l’evento.",
  "Nascondere titolo o conseguenza principale dentro un pannello espandibile.",
  "Inventare attori, esiti, verifiche o conseguenze che i dati dell’evento non dimostrano.",
] as const;

function TimelineEventSpecimen({ event }: { event: TimelineSpecimen }) {
  const EventIcon = event.icon;

  return (
    <TimelineEntry>
      <TimelineMarker variant={event.variant}>
        <EventIcon />
      </TimelineMarker>
      <article className="min-w-0 pb-1">
        <h3 className="text-sm font-semibold text-foreground">{event.title}</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{event.description}</p>
        {event.details?.length ? (
          <dl className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
            {event.details.map((detail) => (
              <div className="min-w-0" key={`${detail.label}-${detail.value}`}>
                <dt className="inline text-muted-foreground">{detail.label}: </dt>
                <dd className="inline break-words text-foreground">{detail.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <TimelineActor>{event.actor}</TimelineActor>
          <span aria-hidden="true" className="text-xs text-muted-foreground">·</span>
          <time className="text-xs text-muted-foreground" dateTime={event.dateTime}>{event.dateTimeLabel}</time>
        </div>
      </article>
    </TimelineEntry>
  );
}

export default function TimelineEventPatternPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Timeline Event"
        description="Pattern canonico per trasformare gli eventi del cantiere in una cronologia che racconta che cosa è successo, senza esporre il modello tecnico sottostante."
      />

      <div className="flex flex-col gap-12">
        <section aria-labelledby="when-to-use-title" className="max-w-3xl">
          <h2 id="when-to-use-title" className="text-2xl font-semibold tracking-tight">Quando usare una timeline</h2>
          <div className="mt-3 space-y-3 leading-7 text-muted-foreground">
            <p>
              Usa una timeline per raccontare in ordine temporale cambiamenti già avvenuti nel lavoro: aggiornamenti,
              richieste, decisioni, pagamenti documentati e passaggi del ciclo di vita.
            </p>
            <p>
              Non usarla come work queue o come audit log. La timeline risponde a “che cosa è successo?”; le superfici
              operative indicano invece che cosa deve fare l’utente adesso.
            </p>
          </div>
        </section>

        <section aria-labelledby="source-title" className="max-w-3xl rounded-xl border bg-card p-5 sm:p-6">
          <h2 id="source-title" className="text-xl font-semibold tracking-tight">Una sola fonte per il significato</h2>
          <p className="mt-2 leading-7 text-muted-foreground">
            Nel Workspace la funzione <code className="font-accent text-sm text-foreground">presentTimelineEvent</code> produce
            titolo, descrizione, attore, data, tono, sezione e dettagli già leggibili. Le viste devono renderizzare
            quell’output: non ricostruiscono copy o significato a partire dai dati salvati. Sirio mostra output fissi
            verificati, non contiene un secondo mapper di dominio.
          </p>
        </section>

        <section aria-labelledby="anatomy-title">
          <div className="max-w-3xl">
            <h2 id="anatomy-title" className="text-2xl font-semibold tracking-tight">Struttura minima e gerarchia</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              Il significato principale viene prima; provenienza e dettagli lo sostengono senza competere con il titolo.
            </p>
          </div>
          <dl className="mt-6 divide-y divide-border rounded-xl border bg-card px-4 sm:px-6">
            {eventAnatomy.map(([term, description]) => (
              <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6" key={term}>
                <dt className="font-semibold text-foreground">{term}</dt>
                <dd className="leading-6 text-muted-foreground">{description}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="examples-title">
          <div className="max-w-3xl">
            <h2 id="examples-title" className="text-2xl font-semibold tracking-tight">Eventi supportati</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              Gli specimen riprendono titoli, descrizioni e formatter del presenter reale del Workspace. I contenuti sono
              dimostrativi e non provengono dal runtime prodotto.
            </p>
          </div>
          <div className="mt-6 rounded-xl border bg-card p-4 sm:p-6">
            <Timeline aria-label="Esempi di eventi del cantiere">
              {examples.map((event) => <TimelineEventSpecimen event={event} key={event.title} />)}
            </Timeline>
          </div>
        </section>

        <section aria-labelledby="details-title">
          <div className="max-w-3xl">
            <h2 id="details-title" className="text-2xl font-semibold tracking-tight">Dettagli con progressive disclosure</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              Lascia sempre visibili evento e conseguenza. Un dettaglio secondario può essere espandibile quando è lungo
              o raro; un importo o uno stato essenziale resta invece immediatamente leggibile.
            </p>
          </div>
          <div className="mt-6 rounded-xl border bg-card p-4 sm:p-6">
            <Timeline aria-label="Evento con dettagli espandibili">
              <TimelineEntry>
                <TimelineMarker variant="warning"><IconListCheck /></TimelineMarker>
                <article className="min-w-0 pb-1">
                  <h3 className="text-sm font-semibold text-foreground">Lavoro pronto per la conferma</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Il lavoro dello step è pronto per la conferma del cliente.
                  </p>
                  <Collapsible className="mt-2" defaultOpen>
                    <CollapsibleTrigger className="rounded-md text-sm font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      Dettagli del passaggio
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <dl className="grid gap-1 pt-2 text-sm sm:grid-cols-2">
                        <div>
                          <dt className="inline text-muted-foreground">Stato precedente: </dt>
                          <dd className="inline text-foreground">In corso</dd>
                        </div>
                        <div>
                          <dt className="inline text-muted-foreground">Nuovo stato: </dt>
                          <dd className="inline text-foreground">Lavoro completato, da confermare</dd>
                        </div>
                      </dl>
                    </CollapsibleContent>
                  </Collapsible>
                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <TimelineActor>Marco Rossi</TimelineActor>
                    <span aria-hidden="true" className="text-xs text-muted-foreground">·</span>
                    <time className="text-xs text-muted-foreground" dateTime="2026-08-13T09:40:00+02:00">13 ago 2026, 09:40</time>
                  </div>
                </article>
              </TimelineEntry>
            </Timeline>
          </div>
        </section>

        <section aria-labelledby="fallback-title">
          <div className="max-w-3xl">
            <h2 id="fallback-title" className="text-2xl font-semibold tracking-tight">Fallback per eventi non riconosciuti</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              Il fallback non prova a interpretare dati sconosciuti e non li espone. Mantiene attore e data quando sono
              disponibili, usa tono neutro e rimanda alle sezioni pertinenti del cantiere.
            </p>
          </div>
          <div className="mt-6 max-w-3xl rounded-xl border bg-card p-4 sm:p-6">
            <Timeline aria-label="Esempio di evento non riconosciuto">
              <TimelineEventSpecimen event={{
                actor: "Autore non disponibile",
                dateTime: "2026-08-13T11:10:00+02:00",
                dateTimeLabel: "13 ago 2026, 11:10",
                description: "È stato registrato un aggiornamento. I dettagli sono disponibili nelle sezioni pertinenti del cantiere.",
                icon: IconHelpCircle,
                title: "Aggiornamento del cantiere",
                variant: "default",
              }} />
            </Timeline>
          </div>
        </section>

        <section aria-labelledby="accessibility-title">
          <div className="max-w-3xl">
            <h2 id="accessibility-title" className="text-2xl font-semibold tracking-tight">Responsive e accessibilità</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              La cronologia deve conservare ordine e significato senza dipendere da colore, icone, hover o colonne.
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
              La fedeltà all’evento non richiede di mostrare il formato in cui è stato salvato.
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
