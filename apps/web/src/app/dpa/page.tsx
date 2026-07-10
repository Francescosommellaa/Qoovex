import { contactEmail, contactHref } from "../site-config";
import { LegalPage, LegalSection } from "../site-chrome";

export default function DpaPage() {
  return (
    <LegalPage
      intro="Schema DPA/nomina in bozza per i casi in cui il cliente usa Qoovex per dati di lavoratori, cantieri, documenti e prove operative."
      title="DPA / nomina trattamento dati"
    >
      <LegalSection title="Ruoli privacy da confermare">
        <p>
          Per i dati caricati nel workspace dal cliente, lo schema operativo previsto e: cliente
          come titolare, Qoovex come responsabile del trattamento. La qualificazione definitiva deve
          essere confermata nel contratto.
        </p>
      </LegalSection>

      <LegalSection title="Oggetto del trattamento">
        <p>
          Qoovex tratta dati necessari a organizzare account, aziende, lavoratori, cantieri,
          documenti, scadenze, checklist, prove, notifiche operative e audit tecnici.
        </p>
      </LegalSection>

      <LegalSection title="Istruzioni del cliente">
        <p>
          Qoovex opera sui dati secondo configurazione del workspace, ruoli, richieste del cliente e
          procedure documentate. Il cliente deve evitare il caricamento di dati non necessari o fuori
          dallo scopo concordato.
        </p>
      </LegalSection>

      <LegalSection title="Subfornitori">
        <p>
          La lista finale deve includere solo servizi realmente configurati: hosting e funzioni
          applicative Vercel, storage Blob Vercel, database PostgreSQL/Prisma configurato ed email
          transazionali Resend se attive.
        </p>
      </LegalSection>

      <LegalSection title="Sicurezza e isolamento">
        <p>
          Il workspace applica isolamento per organizationId, ruoli applicativi, storage privato,
          audit e separazione delle variabili segrete. Queste misure devono essere integrate con le
          procedure interne del cliente.
        </p>
      </LegalSection>

      <LegalSection title="Assistenza su diritti e cancellazione">
        <p>
          Qoovex assiste il cliente nella gestione di export, rettifiche e cancellazioni tecniche.
          Le richieste operative vanno inviate a <a href={contactHref}>{contactEmail}</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
