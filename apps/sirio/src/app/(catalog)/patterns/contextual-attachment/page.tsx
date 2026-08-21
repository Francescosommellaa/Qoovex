import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ContextualAttachmentSpecimens } from "@/components/patterns/contextual-attachment-specimen";

const contextContract = [
  ["Contesto visibile", "Nomina l’elemento corrente con un titolo umano: richiesta, proposta, pagamento o disaccordo."],
  ["Associazione automatica", "La composizione riceve il riferimento dall’elemento che contiene il form e lo invia internamente. Non chiede mai all’utente di copiarlo o sceglierlo."],
  ["File e limiti", "Mostra label, tipi consentiti e limite reale prima della selezione; dopo la scelta ripete nome e tipo in linguaggio umano."],
  ["Visibilità", "L’Azienda sceglie tra “Solo Azienda” e “Condiviso con il cliente”. Nel flusso Cliente il file è condiviso e il selettore non viene mostrato."],
  ["Esito", "Dopo il caricamento il file compare accanto all’elemento e nella libreria File con contesto, visibilità, data e dimensione leggibili."],
] as const;

const accessibilityRules = [
  "Associa sempre una label visibile al file input e collega descrizione, stato del file selezionato ed errore con aria-describedby.",
  "Annuncia il nome del file selezionato con una regione polite; l’errore locale usa aria-invalid e porta il focus al controllo soltanto quando serve recuperare.",
  "Durante il caricamento usa aria-busy, impedisci invii ripetuti e mantieni un solo messaggio di stato comprensibile.",
  "Dopo il successo non spostare arbitrariamente il focus: aggiorna la lista nel contesto corrente e comunica dove è comparso il file.",
  "Su viewport stretti nome, contesto e metadati vanno a capo; il file input, il focus ring e le azioni non devono essere tagliati.",
  "Le icone interne a testo già esplicito sono decorative e restano nascoste agli screen reader.",
] as const;

const antiPatterns = [
  "Chiedere all’utente un ID, un riferimento collegato o il nome di una proprietà backend.",
  "Aprire un upload generico quando richiesta, proposta, pagamento o disaccordo sono già noti dalla pagina.",
  "Mostrare codici di categoria, visibilità tecniche, MIME type, chiavi storage o altri metadati interni.",
  "Lasciare ambiguo se il file finirà nel cantiere, in un elemento specifico o tra i documenti condivisi.",
  "Nascondere tipi consentiti e limite fino a quando il caricamento fallisce.",
  "Promettere anteprima, versioning, approvazione o validazione automatica del contenuto.",
] as const;

export default function ContextualAttachmentPatternPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Contextual Attachment"
        description="Pattern canonico per allegare un file nel punto a cui appartiene, senza esporre riferimenti o dettagli tecnici del modello dati."
      />

      <div className="flex flex-col gap-12">
        <section aria-labelledby="contextual-attachment-principle-title" className="max-w-3xl">
          <h2 className="text-2xl font-semibold tracking-tight" id="contextual-attachment-principle-title">Allega il file qui</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            Usa l’upload contestuale quando il file nasce dentro una richiesta, una proposta, un pagamento o un
            disaccordo. L’utente vede il nome dell’elemento; il form riceve internamente l’associazione già nota dalla
            vista. Sirio documenta la composizione del flusso reale e non introduce un nuovo servizio di upload.
          </p>
        </section>

        <section aria-labelledby="contextual-attachment-contract-title">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight" id="contextual-attachment-contract-title">Contratto della composizione</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              Contesto, selezione, visibilità ed esito devono rispondere a domande umane, mentre i riferimenti tecnici restano nel codice.
            </p>
          </div>
          <dl className="mt-6 divide-y divide-border rounded-xl border bg-card px-4 sm:px-6">
            {contextContract.map(([term, description]) => (
              <div className="grid gap-1 py-4 sm:grid-cols-[12rem_1fr] sm:gap-6" key={term}>
                <dt className="font-semibold text-foreground">{term}</dt>
                <dd className="leading-6 text-muted-foreground">{description}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="contextual-attachment-specimens-title">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight" id="contextual-attachment-specimens-title">Specimen canonici</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              Gli esempi usano i contesti, i tipi di file, il limite e le regole di visibilità presenti oggi nei flussi
              Azienda e Cliente. La validazione del campo segue il pattern <Link className="font-medium text-foreground underline underline-offset-4" href="/patterns/form-validation">Form Validation</Link>.
            </p>
          </div>
          <div className="mt-6"><ContextualAttachmentSpecimens /></div>
        </section>

        <section aria-labelledby="generic-upload-title" className="max-w-3xl">
          <h2 className="text-2xl font-semibold tracking-tight" id="generic-upload-title">Quando mantenere l’upload generico</h2>
          <div className="mt-3 space-y-3 leading-7 text-muted-foreground">
            <p>
              L’upload generico resta disponibile all’Azienda per file che riguardano il cantiere nel suo insieme e non
              appartengono naturalmente a una richiesta, proposta, disaccordo o richiesta di pagamento.
            </p>
            <p>
              In quel solo ingresso l’Azienda sceglie anche il tipo umano del file e può caricare PDF, immagini o video
              MP4, WebM e MOV fino a 4 MB. Il Cliente non dispone di un upload generico: i suoi file nascono sempre da
              uno dei contesti supportati e vengono condivisi con l’Azienda.
            </p>
          </div>
        </section>

        <section aria-labelledby="contextual-attachment-accessibility-title">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight" id="contextual-attachment-accessibility-title">Responsive e accessibilità</h2>
            <p className="mt-2 leading-7 text-muted-foreground">Il contesto deve restare comprensibile prima, durante e dopo l’upload, con ogni modalità di input.</p>
          </div>
          <ul className="mt-5 max-w-3xl list-disc space-y-2 pl-5 leading-7 text-muted-foreground">
            {accessibilityRules.map((rule) => <li key={rule}>{rule}</li>)}
          </ul>
        </section>

        <section aria-labelledby="contextual-attachment-mistakes-title">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight" id="contextual-attachment-mistakes-title">Errori da evitare</h2>
            <p className="mt-2 leading-7 text-muted-foreground">Un upload è contestuale soltanto se l’utente sa dove finirà il file senza conoscere il backend.</p>
          </div>
          <ul className="mt-5 max-w-3xl list-disc space-y-2 pl-5 leading-7 text-muted-foreground">
            {antiPatterns.map((antiPattern) => <li key={antiPattern}>{antiPattern}</li>)}
          </ul>
        </section>
      </div>
    </div>
  );
}
