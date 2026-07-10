import { contactEmail, contactHref } from "../site-config";
import { LegalPage, LegalSection } from "../site-chrome";

export default function TermsPage() {
  return (
    <LegalPage
      intro="Termini di servizio in bozza per l'uso pilota di Qoovex. Il testo deve essere revisionato prima della vendita a clienti reali."
      title="Termini di servizio"
    >
      <LegalSection title="Uso del servizio">
        <p>
          Qoovex permette di organizzare documenti, scadenze, checklist, prove operative e
          pacchetti condivisibili. L'utente resta responsabile dei contenuti caricati e della loro
          correttezza.
        </p>
      </LegalSection>

      <LegalSection title="Nessuna consulenza professionale">
        <p>
          Qoovex organizza, non certifica. Il servizio non decide obblighi, requisiti, idoneita o
          valutazioni al posto di responsabili, consulenti o utenti competenti.
        </p>
      </LegalSection>

      <LegalSection title="Account e ruoli">
        <p>
          Gli utenti devono mantenere credenziali sicure e usare solo gli account autorizzati. I
          ruoli nel workspace limitano viste e azioni, ma l'organizzazione cliente deve assegnarli
          in modo coerente con le proprie responsabilita operative.
        </p>
      </LegalSection>

      <LegalSection title="Contenuti caricati">
        <p>
          File, PDF, foto e note restano contenuti del cliente o degli utenti che li caricano. Non
          devono essere caricati dati non necessari, dati fuori scope o materiali che l'utente non e
          autorizzato a trattare.
        </p>
      </LegalSection>

      <LegalSection title="Sospensione e disponibilita">
        <p>
          Qoovex puo limitare accessi che mettono a rischio sicurezza, integrita dei dati o uso
          corretto della piattaforma. In fase pilota possono esistere finestre di manutenzione e
          interventi tecnici pianificati.
        </p>
      </LegalSection>

      <LegalSection title="Cancellazione dati">
        <p>
          Le richieste di export o cancellazione devono essere inviate a{" "}
          <a href={contactHref}>{contactEmail}</a>. La cancellazione operativa segue una procedura
          tracciata e richiede verifica dell'identita del richiedente.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
