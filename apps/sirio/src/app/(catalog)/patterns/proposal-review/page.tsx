import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ProposalReviewSpecimens } from "@/components/patterns/proposal-review-specimen";

const reviewHierarchy = [
  ["1. Che cosa cambia", "Apri con una sintesi concreta della modifica e con la motivazione fornita dalla parte che la propone."],
  ["2. Rispetto a cosa", "Mostra Prima e Proposto soltanto quando la proposta conserva una baseline affidabile nello stesso snapshot."],
  ["3. Conseguenze reali", "Rendi leggibili impatto economico, tempi e condizioni presenti, senza dedurre effetti ulteriori."],
  ["4. Azioni disponibili", "Indica chi deve intervenire e mostra soltanto le azioni realmente consentite sulla proposta corrente."],
] as const;

const supportedData = [
  ["Sintesi e motivazione", "Sono sempre richieste dal payload corrente e formano il nucleo della review."],
  ["Importo", "Può essere nessuna variazione, una variazione fissa oppure un intervallo. La baseline economica è facoltativa."],
  ["Tempi", "Possono includere una nuova conclusione prevista e una descrizione dell’impatto; oggi non esiste una baseline temporale confrontabile nello snapshot."],
  ["Condizioni", "Compaiono solo quando sono presenti; non vengono sostituite da righe vuote o formule generiche."],
  ["Parte e data", "La parte rappresentata e la data possono contestualizzare la proposta. Il nome della persona compare soltanto se è già risolto dalla sorgente."],
  ["Stato", "Usa la label umana del presentation layer, separata dalla disponibilità delle azioni."],
] as const;

const accessibilityRules = [
  "Mantieni un heading per ogni proposta e sottosezioni nell’ordine: modifica, confronto, conseguenze, azioni.",
  "Usa liste descrittive per coppie Prima/Proposto, dettagli e metadati; non simulare tabelle con testo separato da spazi.",
  "Lascia andare a capo valori, condizioni e date su viewport stretti; non troncare importi o focus ring delle azioni reali.",
  "Il badge di stato conserva sempre una label testuale e non comunica significato soltanto con colore o icona.",
  "Le azioni operative devono seguire il focus order della review e restare associate alla proposta mostrata.",
  "Un aggiornamento obsoleto viene spiegato con testo umano; ID, numero di versione e dettagli tecnici restano interni.",
] as const;

const mistakes = [
  "Aprire con numero di versione, stato tecnico o identificatore invece che con il contenuto della modifica.",
  "Inventare un valore Prima quando la baseline non appartiene allo snapshot della proposta.",
  "Mostrare contemporaneamente campi invariati che non aiutano la decisione.",
  "Renderizzare dati salvati, proprietà backend o importi nel formato interno.",
  "Affidare aumento, riduzione o stato soltanto a verde, rosso o posizione visiva.",
  "Presentare accettazione, rifiuto o controproposta come disponibili quando la sorgente non le consente.",
  "Aggiungere conseguenze contrattuali, legali o economiche che il dominio non registra.",
] as const;

export default function ProposalReviewPatternPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Proposal Review"
        description="Pattern canonico per rendere comprensibile una proposta di modifica prima che l’utente decida come rispondere."
      />

      <div className="flex flex-col gap-12">
        <section aria-labelledby="proposal-review-principle-title" className="max-w-3xl">
          <h2 id="proposal-review-principle-title" className="text-2xl font-semibold tracking-tight">
            Prima il cambiamento, poi la decisione
          </h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            Una proposal review non è una card amministrativa e non è ancora il passaggio di conferma finale.
            Deve permettere di capire che cosa viene proposto, quale confronto è affidabile e quali conseguenze sono
            state dichiarate prima di presentare le azioni disponibili.
          </p>
        </section>

        <section aria-labelledby="proposal-review-source-title" className="max-w-3xl rounded-xl border bg-card p-5 sm:p-6">
          <h2 id="proposal-review-source-title" className="text-xl font-semibold tracking-tight">Presentazione derivata dallo snapshot</h2>
          <p className="mt-2 leading-7 text-muted-foreground">
            Nel Workspace il presenter valida lo snapshot corrente e produce sintesi, confronti e dettagli leggibili.
            Gli importi usano il formatter condiviso del pattern <Link className="font-medium text-foreground underline underline-offset-4" href="/patterns/money">Money</Link>;
            lo stato usa il presentation layer documentato in <Link className="font-medium text-foreground underline underline-offset-4" href="/patterns/status-presentation">Status Presentation</Link>.
            Sirio usa gli stessi componenti e formatter generici, senza importare servizi o creare un secondo mapper di dominio.
          </p>
        </section>

        <section aria-labelledby="proposal-review-hierarchy-title">
          <div className="max-w-3xl">
            <h2 id="proposal-review-hierarchy-title" className="text-2xl font-semibold tracking-tight">Gerarchia della review</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              L’ordine di lettura resta stabile anche quando alcuni dati facoltativi non sono presenti.
            </p>
          </div>
          <ol className="mt-6 divide-y divide-border rounded-xl border bg-card px-4 sm:px-6">
            {reviewHierarchy.map(([term, description]) => (
              <li className="grid gap-1 py-4 sm:grid-cols-[12rem_1fr] sm:gap-6" key={term}>
                <strong className="font-semibold text-foreground">{term}</strong>
                <span className="leading-6 text-muted-foreground">{description}</span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="proposal-review-specimens-title">
          <div className="max-w-3xl">
            <h2 id="proposal-review-specimens-title" className="text-2xl font-semibold tracking-tight">Specimen canonici</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              I contenuti sono dimostrativi ma rispettano i campi e i fallback del flusso proposte reale. Le azioni sono
              descritte come gerarchia informativa: il pattern generale di conferma finale resta separato.
            </p>
          </div>
          <div className="mt-6"><ProposalReviewSpecimens /></div>
        </section>

        <section aria-labelledby="proposal-review-baseline-title" className="max-w-3xl">
          <h2 id="proposal-review-baseline-title" className="text-2xl font-semibold tracking-tight">Confrontare solo ciò che è confrontabile</h2>
          <div className="mt-3 space-y-3 leading-7 text-muted-foreground">
            <p>
              Nel flusso corrente la baseline economica può essere inclusa nella proposta. Solo in quel caso importo
              precedente e importo proposto formano un vero confronto Prima/Proposto.
            </p>
            <p>
              Se la baseline manca, mostra la variazione o l’intervallo come valore proposto. Per tempi e condizioni
              mostra i nuovi dati dichiarati senza ricostruire uno stato precedente da fonti mutabili esterne allo snapshot.
            </p>
          </div>
        </section>

        <section aria-labelledby="proposal-review-data-title">
          <div className="max-w-3xl">
            <h2 id="proposal-review-data-title" className="text-2xl font-semibold tracking-tight">Dati realmente supportati</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              Mostra tutti e soli i dati presenti che aiutano a comprendere la proposta corrente.
            </p>
          </div>
          <dl className="mt-6 divide-y divide-border rounded-xl border bg-card px-4 sm:px-6">
            {supportedData.map(([term, description]) => (
              <div className="grid gap-1 py-4 sm:grid-cols-[12rem_1fr] sm:gap-6" key={term}>
                <dt className="font-semibold text-foreground">{term}</dt>
                <dd className="leading-6 text-muted-foreground">{description}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
            Gli step interessati e le persone coinvolte sono conservati come riferimenti nello snapshot, ma non vanno
            mostrati finché la sorgente della review non li risolve in nomi umani. Un riferimento interno non è copy.
          </p>
        </section>

        <section aria-labelledby="proposal-review-accessibility-title">
          <div className="max-w-3xl">
            <h2 id="proposal-review-accessibility-title" className="text-2xl font-semibold tracking-tight">Responsive e accessibilità</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              La review deve restare leggibile nello stesso ordine con tastiera, screen reader e viewport ridotti.
            </p>
          </div>
          <ul className="mt-5 max-w-3xl list-disc space-y-2 pl-5 leading-7 text-muted-foreground">
            {accessibilityRules.map((rule) => <li key={rule}>{rule}</li>)}
          </ul>
        </section>

        <section aria-labelledby="proposal-review-mistakes-title">
          <div className="max-w-3xl">
            <h2 id="proposal-review-mistakes-title" className="text-2xl font-semibold tracking-tight">Errori da evitare</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              Una review fedele non espone il modello dati e non amplia il significato della proposta.
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
