import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { FormValidationSpecimen } from "@/components/patterns/form-validation-specimen";

const fieldContract = [
  ["Label", "È sempre visibile e collegata al controllo tramite htmlFor e id. Il placeholder resta soltanto un esempio."],
  ["Controllo", "Mantiene name, tipo, autocomplete e semantica nativa o della primitiva canonica."],
  ["Descrizione", "Compare solo quando chiarisce contenuto, formato o conseguenza del campo."],
  ["Errore locale", "Segue il controllo, usa linguaggio umano e viene incluso nel suo aria-describedby."],
] as const;

const validationFlow = [
  "Mantieni lo stato del form e impedisci un secondo invio anche prima del re-render di pending.",
  "Mappa gli errori attribuibili ai campi, mostra un solo FieldError per controllo e imposta aria-invalid.",
  "Collega descrizione ed errore concatenando i rispettivi ID in aria-describedby.",
  "Dopo una risposta fallita porta il focus al primo controllo invalido visibile, seguendo l’ordine del form.",
  "Mostra un errore generale soltanto quando il problema non appartiene a un campo e non spostare arbitrariamente il focus.",
  "Durante l’invio usa aria-busy, controlli disabilitati e un solo messaggio di stato; dopo il successo comunica l’esito senza sottrarre il focus.",
] as const;

const accessibilityRules = [
  "Input e textarea usano label native associate; select e checkbox mantengono la stessa relazione accessibile tramite le primitive canoniche.",
  "L’errore non dipende dal colore: testo specifico, aria-invalid e associazione al controllo comunicano insieme lo stato.",
  "FieldError fornisce l’annuncio urgente del singolo errore. Non aggiungere un secondo role=alert attorno allo stesso messaggio.",
  "Pending e successo usano un solo role=status per cambiamento; lo spinner decorativo va nascosto se il testo annuncia già l’attesa.",
  "Il focus resta visibile e segue l’ordine DOM. Non usare tabIndex positivi né autofocus aggressivo dopo successo o errore generale.",
  "Su viewport stretti label, descrizioni, errori e azioni vanno a capo senza separarsi dal controllo a cui appartengono.",
] as const;

const antiPatterns = [
  "Usare il placeholder come unica label o come istruzione permanente.",
  "Mostrare tutti gli errori soltanto in cima al form, lontano dai controlli coinvolti.",
  "Comunicare l’errore soltanto con colore, bordo o icona.",
  "Perdere il focus dopo il submit o spostarlo quando non aiuta il recupero.",
  "Renderizzare label senza htmlFor/id corrispondenti o riutilizzare lo stesso ID.",
  "Mostrare nomi di proprietà backend, codici o messaggi raw ricevuti dal server.",
  "Annunciare lo stesso errore con più live region o usare role=alert per ogni feedback non urgente.",
] as const;

export default function FormValidationPatternPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Form Validation"
        description="Pattern canonico per costruire form Qoovex comprensibili, recuperabili e accessibili usando le primitive già adottate nel prodotto."
      />

      <div className="flex flex-col gap-12">
        <section aria-labelledby="when-title" className="max-w-3xl">
          <h2 id="when-title" className="text-2xl font-semibold tracking-tight">Quando usarlo</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            Usa questa composizione per ogni form operativo o di account che valida dati prima o dopo il submit.
            Sirio documenta il contratto già presente nei form reali: non introduce un form builder, una nuova
            sorgente di errori o una seconda astrazione sopra il design system.
          </p>
        </section>

        <section aria-labelledby="contract-title">
          <div className="max-w-3xl">
            <h2 id="contract-title" className="text-2xl font-semibold tracking-tight">Contratto del campo</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              Ogni parte ha un compito preciso. Descrizione ed errore sono facoltativi, la label no.
            </p>
          </div>
          <dl className="mt-6 divide-y divide-border rounded-xl border bg-card px-4 sm:px-6">
            {fieldContract.map(([term, description]) => (
              <div key={term} className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
                <dt className="font-semibold text-foreground">{term}</dt>
                <dd className="leading-6 text-muted-foreground">{description}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="specimens-title">
          <div className="max-w-3xl">
            <h2 id="specimens-title" className="text-2xl font-semibold tracking-tight">Specimen interattivi</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              Gli esempi coprono campo normale, descrizione, errore locale, più errori, invio in corso,
              successo ed errore generale. Sono dimostrativi e non inviano dati.
            </p>
          </div>
          <div className="mt-6">
            <FormValidationSpecimen />
          </div>
        </section>

        <section aria-labelledby="flow-title">
          <div className="max-w-3xl">
            <h2 id="flow-title" className="text-2xl font-semibold tracking-tight">Flusso di validazione</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              Il mapping degli errori resta vicino alla mutation reale; la composizione visuale resta comune.
            </p>
          </div>
          <ol className="mt-5 max-w-3xl list-decimal space-y-2 pl-5 leading-7 text-muted-foreground">
            {validationFlow.map((step) => <li key={step}>{step}</li>)}
          </ol>
        </section>

        <section aria-labelledby="controls-title" className="max-w-3xl">
          <h2 id="controls-title" className="text-2xl font-semibold tracking-tight">Controlli canonici</h2>
          <div className="mt-3 space-y-3 leading-7 text-muted-foreground">
            <p>
              Componi <Link href="/components/field" className="font-medium text-foreground underline underline-offset-4">Field</Link>,
              <code className="mx-1 font-accent text-sm text-foreground">Label</code>,
              <code className="mx-1 font-accent text-sm text-foreground">FieldDescription</code> e
              <code className="mx-1 font-accent text-sm text-foreground">FieldError</code> con input,
              <Link href="/components/textarea" className="ml-1 font-medium text-foreground underline underline-offset-4">textarea</Link>,
              <Link href="/components/select" className="ml-1 font-medium text-foreground underline underline-offset-4">select</Link> e checkbox esistenti.
            </p>
            <p>
              I controlli composti legacy che non espongono ancora un contratto completo per ID, ref o messaggi locali
              non sono specimen canonici di questo pattern: vanno valutati separatamente prima di usarli in nuovi form.
            </p>
          </div>
        </section>

        <section aria-labelledby="accessibility-title">
          <div className="max-w-3xl">
            <h2 id="accessibility-title" className="text-2xl font-semibold tracking-tight">Responsive e accessibilità</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              La tastiera, il focus e gli annunci fanno parte del comportamento del form, non sono decorazioni successive.
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
              Questi anti-pattern rendono il recupero ambiguo anche quando la validazione tecnica è corretta.
            </p>
          </div>
          <ul className="mt-5 max-w-3xl list-disc space-y-2 pl-5 leading-7 text-muted-foreground">
            {antiPatterns.map((antiPattern) => <li key={antiPattern}>{antiPattern}</li>)}
          </ul>
        </section>
      </div>
    </div>
  );
}
