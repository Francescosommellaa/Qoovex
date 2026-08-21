import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { MoneySpecimen } from "@/components/patterns/money-specimen";

const readingRules = [
  ["Importo semplice", "Mostra label contestuale e valore completo in euro, con separatori italiani e due decimali."],
  ["Variazione", "Indica esplicitamente aumento o riduzione e conserva il segno davanti al valore. Il colore può rafforzare, mai sostituire il testo."],
  ["Intervallo", "Mostra minimo e massimo nello stesso ordine, separati da un trattino medio. Se è disponibile un solo estremo, chiamalo Importo minimo o Importo massimo."],
  ["Valore facoltativo", "Ometti la riga quando non serve alla decisione; altrimenti usa una frase umana come Non indicato o Non indicata."],
  ["Valore illeggibile", "Usa il fallback neutro Importo non disponibile e non renderizzare mai il dato ricevuto."],
] as const;

const inputRules = [
  "La label descrive il significato del valore, per esempio Importo, Stima iniziale o Variazione.",
  "Usa inputMode decimal, una descrizione breve e un placeholder che sia soltanto un esempio.",
  "Accetta la notazione italiana supportata dal parser: 1250, 1.250,00 e il simbolo euro finale facoltativo.",
  "Un campo vuoto facoltativo resta assente; un campo obbligatorio vuoto riceve un errore locale.",
  "I valori negativi sono ammessi soltanto nei contesti che rappresentano davvero una riduzione, come una variazione economica.",
  "Converti nel formato canonico soltanto al confine del submit, senza passare da numeri floating-point.",
] as const;

const antiPatterns = [
  "Mostrare il valore serializzato ricevuto dal dominio o nomi di proprietà backend.",
  "Chiedere all’utente di inserire centesimi invece di euro.",
  "Usare il punto come separatore decimale o mescolare convenzioni locali nello stesso flusso.",
  "Interpretare silenziosamente input ambigui invece di mostrare un errore specifico vicino al campo.",
  "Comunicare aumento e riduzione soltanto con verde e rosso.",
  "Aggiungere IVA, commissioni, aliquote, scadenze o calcoli che il dominio non fornisce.",
  "Descrivere un importo documentato come pagato, verificato o garantito da Qoovex.",
] as const;

export default function MoneyPatternPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Money"
        description="Pattern canonico per mostrare e raccogliere importi in euro leggibili, coerenti e privi di dettagli tecnici."
      />

      <div className="flex flex-col gap-12">
        <section aria-labelledby="money-principle-title" className="max-w-3xl">
          <h2 id="money-principle-title" className="text-2xl font-semibold tracking-tight">
            L’importo di dominio non è copy finale
          </h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            Ogni superficie presenta euro nel formato italiano, per esempio 1.250,00 €. In lettura usa il formatter
            condiviso; nei form usa il parser condiviso e conserva il formato canonico soltanto internamente.
            La pagina non ricostruisce conversioni nei componenti e non usa numeri floating-point.
          </p>
        </section>

        <section aria-labelledby="money-source-title" className="max-w-3xl rounded-xl border bg-card p-5 sm:p-6">
          <h2 id="money-source-title" className="text-xl font-semibold tracking-tight">Una sola sorgente di verità</h2>
          <p className="mt-2 leading-7 text-muted-foreground">
            Formatter per importi singoli, valori facoltativi e intervalli, insieme al parser degli input in euro,
            vivono nel modulo condiviso del design system. Workspace aggiunge soltanto presenter di dominio per
            accordi e proposte; Sirio esegue gli stessi helper generici senza mostrare i dettagli del formato interno.
          </p>
        </section>

        <section aria-labelledby="money-reading-rules-title">
          <div className="max-w-3xl">
            <h2 id="money-reading-rules-title" className="text-2xl font-semibold tracking-tight">Regole di lettura</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              La forma del valore resta stabile; label e contesto spiegano che cosa rappresenta.
            </p>
          </div>
          <dl className="mt-6 divide-y divide-border rounded-xl border bg-card px-4 sm:px-6">
            {readingRules.map(([term, description]) => (
              <div key={term} className="grid gap-1 py-4 sm:grid-cols-[12rem_1fr] sm:gap-6">
                <dt className="font-semibold text-foreground">{term}</dt>
                <dd className="leading-6 text-muted-foreground">{description}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="money-specimens-title">
          <div className="max-w-3xl">
            <h2 id="money-specimens-title" className="text-2xl font-semibold tracking-tight">Specimen canonici</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              Gli esempi coprono importo semplice, input, variazioni, intervallo, assenza ed errore senza esporre il formato interno.
            </p>
          </div>
          <div className="mt-6"><MoneySpecimen /></div>
        </section>

        <section aria-labelledby="money-input-rules-title">
          <div className="max-w-3xl">
            <h2 id="money-input-rules-title" className="text-2xl font-semibold tracking-tight">Input monetari</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              Il controllo segue il pattern <Link href="/patterns/form-validation" className="font-medium text-foreground underline underline-offset-4">Form Validation</Link>:
              label visibile, descrizione utile, errore locale, associazioni ARIA e focus di recupero.
            </p>
          </div>
          <ol className="mt-5 max-w-3xl list-decimal space-y-2 pl-5 leading-7 text-muted-foreground">
            {inputRules.map((rule) => <li key={rule}>{rule}</li>)}
          </ol>
        </section>

        <section aria-labelledby="money-context-title" className="max-w-3xl">
          <h2 id="money-context-title" className="text-2xl font-semibold tracking-tight">Contesto economico reale</h2>
          <div className="mt-3 space-y-3 leading-7 text-muted-foreground">
            <p>
              Nell’accordo iniziale il valore è una stima; nelle proposte è una baseline, una variazione o un intervallo;
              nei pagamenti documentati è l’importo richiesto o dichiarato dalle parti. La label deve preservare questa differenza.
            </p>
            <p>
              Mostrare un importo non prova che un pagamento sia avvenuto. Qoovex registra informazioni e dichiarazioni:
              non incassa, custodisce, trasferisce, verifica automaticamente o garantisce denaro.
            </p>
          </div>
        </section>

        <section aria-labelledby="money-accessibility-title">
          <div className="max-w-3xl">
            <h2 id="money-accessibility-title" className="text-2xl font-semibold tracking-tight">Accessibilità e responsive</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              Valore, significato e recupero dell’errore devono restare comprensibili con tastiera, screen reader e viewport ridotti.
            </p>
          </div>
          <ul className="mt-5 max-w-3xl list-disc space-y-2 pl-5 leading-7 text-muted-foreground">
            <li>Associa sempre la label al controllo e collega descrizione ed errore con ID stabili.</li>
            <li>Usa cifre tabulari quando più valori devono essere confrontati, senza trasformare paragrafi o istruzioni in testo accent.</li>
            <li>Lascia andare a capo label e valori lunghi; non troncare il simbolo euro o un estremo dell’intervallo.</li>
            <li>Per aumento e riduzione mantieni segno e testo esplicito anche senza colore.</li>
            <li>Dopo un errore porta il focus al campo coinvolto; dopo un valore valido comunica il formato risultante con un solo messaggio di stato.</li>
          </ul>
        </section>

        <section aria-labelledby="money-mistakes-title">
          <div className="max-w-3xl">
            <h2 id="money-mistakes-title" className="text-2xl font-semibold tracking-tight">Errori da evitare</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              Il presentation layer non deve inventare calcoli, significati o garanzie economiche.
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
