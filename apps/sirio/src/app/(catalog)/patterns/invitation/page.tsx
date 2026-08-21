import { PageHeader } from "@/components/page-header";
import { InvitationSpecimens } from "@/components/patterns/invitation-specimen";

const invitationContract = [
  ["Chi invita", "Mostra il nome dell’Azienda. Aggiungi la persona invitante soltanto quando il dato è realmente disponibile."],
  ["Per quale contesto", "Nomina il lavoro e, quando presente, il suo indirizzo. Per un invito Collaboratore mostra invece Azienda e ruolo, senza inventare un cantiere."],
  ["Cosa comporta", "Spiega l’accesso che verrà creato e il passo immediatamente successivo, senza promettere permessi ulteriori."],
  ["Azione primaria", "Usa una sola CTA che unisca decisione e destinazione: “Accetta e apri il lavoro” quando il lavoro è noto."],
  ["Destinazione", "Dopo l’accettazione apri direttamente il lavoro restituito dal flusso. Usa il Workspace generale soltanto quando non esiste un contesto più preciso."],
] as const;

const additionalStates = [
  ["Accesso richiesto", "Conserva il ritorno all’invito durante accesso o registrazione e ricorda di usare l’email invitata."],
  ["Email da verificare", "Chiedi di completare la verifica e di riaprire lo stesso link; non mostrare una CTA che salti il controllo."],
  ["Tipo di account non adatto", "Spiega che serve l’account previsto dall’invito e offri il cambio account quando disponibile."],
  ["Account già presente nel lavoro", "Non tentare una seconda associazione: proponi il cambio account oppure il contatto con l’Azienda."],
  ["Invito accettato, accesso non disponibile", "Dichiara che il lavoro non può essere aperto con questo account e indica di contattare l’Azienda."],
  ["Invito non disponibile", "Usa un fallback neutro per link non valido o stato non distinguibile, senza rivelare il motivo tecnico."],
] as const;

const accessibilityRules = [
  "Usa un solo h1 e heading ordinati per contesto, azione e stati limite.",
  "Il Dialog di conferma riceve titolo e descrizione reali, trattiene il focus e lo restituisce al trigger quando viene chiuso.",
  "Durante l’accettazione imposta aria-busy, disabilita le azioni e annuncia una sola volta lo stato pending.",
  "Gli esiti dinamici usano status per informazioni e successo; usa alert soltanto quando serve attenzione immediata.",
  "Le icone che ripetono il testo sono decorative e restano nascoste agli screen reader.",
  "Su mobile il riepilogo precede sempre la CTA, i testi vanno a capo e i controlli mantengono il target touch canonico.",
] as const;

const antiPatterns = [
  "Mostrare “Accetta invito” senza dire chi invita, per quale lavoro e cosa succede dopo.",
  "Esporre token, identificativi, stati tecnici, codici errore o messaggi backend grezzi.",
  "Affiancare più CTA primarie equivalenti che non chiariscono il passo consigliato.",
  "Lasciare uno stato scaduto, revocato o non disponibile senza spiegazione o recovery reale.",
  "Portare alla dashboard quando la risposta di accettazione identifica già il lavoro corretto.",
  "Promettere accessi, permessi o un nuovo invito automatico che il dominio non garantisce.",
] as const;

export default function InvitationPatternPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Invitation"
        description="Pattern canonico per capire, accettare e recuperare un invito Qoovex senza esporre il modello tecnico sottostante."
      />

      <div className="flex flex-col gap-12">
        <section aria-labelledby="invitation-principle-title" className="max-w-3xl">
          <h2 className="text-2xl font-semibold tracking-tight" id="invitation-principle-title">Prima capire, poi accettare</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            Un invito è una decisione contestuale, non un semplice link. Prima dell’azione l’utente deve riconoscere
            l’Azienda, il lavoro quando esiste e la conseguenza reale. Dopo il successo deve arrivare al contesto più
            preciso già noto, senza doverlo cercare nel Workspace.
          </p>
        </section>

        <section aria-labelledby="invitation-contract-title">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight" id="invitation-contract-title">Contratto della composizione</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              Il testo visibile deriva dai dati autorizzati della preview e dalla destinazione restituita dall’accettazione.
            </p>
          </div>
          <dl className="mt-6 divide-y divide-border rounded-xl border bg-card px-4 sm:px-6">
            {invitationContract.map(([term, description]) => (
              <div className="grid gap-1 py-4 sm:grid-cols-[12rem_1fr] sm:gap-6" key={term}>
                <dt className="font-semibold text-foreground">{term}</dt>
                <dd className="leading-6 text-muted-foreground">{description}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="invitation-specimens-title">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight" id="invitation-specimens-title">Specimen canonici</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              Gli esempi riprendono i dati, le CTA, le recovery e la destinazione del flusso Cliente reale. Sono
              dimostrativi: non inviano richieste e non creano accessi.
            </p>
          </div>
          <div className="mt-6"><InvitationSpecimens /></div>
        </section>

        <section aria-labelledby="invitation-additional-states-title">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight" id="invitation-additional-states-title">Altri stati reali</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              Questi casi esistono nel flusso Cliente ma non richiedono tutti uno specimen separato. La recovery compare soltanto quando il prodotto può offrirla.
            </p>
          </div>
          <dl className="mt-6 divide-y divide-border rounded-xl border bg-card px-4 sm:px-6">
            {additionalStates.map(([term, description]) => (
              <div className="grid gap-1 py-4 sm:grid-cols-[14rem_1fr] sm:gap-6" key={term}>
                <dt className="font-semibold text-foreground">{term}</dt>
                <dd className="leading-6 text-muted-foreground">{description}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="invitation-variants-title" className="max-w-3xl">
          <h2 className="text-2xl font-semibold tracking-tight" id="invitation-variants-title">Cliente e Collaboratore non sono lo stesso invito</h2>
          <div className="mt-3 space-y-3 leading-7 text-muted-foreground">
            <p>
              L’invito Cliente appartiene a un lavoro preciso: mostra Azienda, lavoro, indirizzo facoltativo e apre
              direttamente quel lavoro dopo l’accettazione. Il Cliente entra come cliente principale e dovrà poi
              consultare il riepilogo iniziale pubblicato dall’Azienda.
            </p>
            <p>
              L’invito Collaboratore appartiene all’Azienda: mostra Azienda, ruolo e scadenza. Può essere rifiutato e,
              dopo l’accettazione, richiede un nuovo accesso al Workspace. Non promettere un cantiere specifico quando
              la preview non lo espone.
            </p>
          </div>
        </section>

        <section aria-labelledby="invitation-accessibility-title">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight" id="invitation-accessibility-title">Responsive e accessibilità</h2>
            <p className="mt-2 leading-7 text-muted-foreground">Contesto, decisione e recovery devono restare leggibili e raggiungibili con ogni modalità di input.</p>
          </div>
          <ul className="mt-5 max-w-3xl list-disc space-y-2 pl-5 leading-7 text-muted-foreground">
            {accessibilityRules.map((rule) => <li key={rule}>{rule}</li>)}
          </ul>
        </section>

        <section aria-labelledby="invitation-mistakes-title">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight" id="invitation-mistakes-title">Errori da evitare</h2>
            <p className="mt-2 leading-7 text-muted-foreground">Un invito è comprensibile soltanto quando anticipa contesto, conseguenza e prossimo passo.</p>
          </div>
          <ul className="mt-5 max-w-3xl list-disc space-y-2 pl-5 leading-7 text-muted-foreground">
            {antiPatterns.map((antiPattern) => <li key={antiPattern}>{antiPattern}</li>)}
          </ul>
        </section>
      </div>
    </div>
  );
}
