import { contactEmail, contactHref, publicSiteUrl, workspaceProductionUrl } from "../site-config";
import { LegalPage, LegalSection } from "../site-chrome";

export default function PrivacyPage() {
  return (
    <LegalPage
      intro="Informativa privacy in bozza per sito pubblico e workspace Qoovex. La versione commerciale deve essere validata prima della pubblicazione definitiva."
      title="Privacy policy"
    >
      <LegalSection title="Titolare e contatti">
        <p>
          Il titolare indicato per la fase pilota e Qoovex. Per richieste privacy, accesso ai dati
          o cancellazione puoi scrivere a <a href={contactHref}>{contactEmail}</a>.
        </p>
        <p className="text-muted-foreground">
          Sito pubblico: {publicSiteUrl}. Workspace di produzione previsto: {workspaceProductionUrl}.
        </p>
      </LegalSection>

      <LegalSection title="Categorie di dati trattati">
        <ul className="legal-list">
          <li>Dati account: nome, email, ruolo, organizzazione e credenziali tecniche.</li>
          <li>Dati workspace: aziende, lavoratori, cantieri, documenti, scadenze, checklist e prove caricate dagli utenti.</li>
          <li>Dati tecnici: log applicativi, audit, indirizzi IP minimizzati o hashati dove previsto dal prodotto.</li>
          <li>Dati email: inviti, notifiche transazionali e stato di consegna quando il servizio email e configurato.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Finalita e basi da validare">
        <p>
          Qoovex tratta i dati per creare account, proteggere l'accesso, organizzare contenuti nel
          workspace, inviare comunicazioni operative e mantenere audit tecnici. Le basi giuridiche
          definitive devono essere confermate nel testo finale in base al contratto con il cliente.
        </p>
      </LegalSection>

      <LegalSection title="Conservazione">
        <p>
          I dati restano disponibili per il periodo necessario all'erogazione del servizio e secondo
          le impostazioni di retention configurate. La cancellazione definitiva passa da procedura
          tracciata e, quando applicabile, da job tecnico nel workspace.
        </p>
      </LegalSection>

      <LegalSection title="Destinatari e subfornitori">
        <p>
          I dati possono transitare su infrastrutture usate per hosting, database, storage Blob ed
          email transazionali. La lista finale dei subfornitori deve riflettere solo i servizi
          effettivamente attivi in produzione.
        </p>
      </LegalSection>

      <LegalSection title="Diritti e richieste">
        <p>
          Gli interessati possono richiedere informazioni, accesso, rettifica o cancellazione
          scrivendo a <a href={contactHref}>{contactEmail}</a>. Le richieste vengono gestite con
          verifica dell'identita e controllo dello scope organizzativo.
        </p>
      </LegalSection>

      <LegalSection title="Sicurezza">
        <p>
          Qoovex applica isolamento per organizzazione, ruoli, storage privato per file operativi,
          audit tecnici e variabili segrete separate dagli ambienti pubblici. Queste misure non
          sostituiscono le verifiche organizzative del cliente.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
