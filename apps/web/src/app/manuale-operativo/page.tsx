import { contactEmail, contactHref, workspaceProductionUrl } from "../site-config";
import { LegalPage, LegalSection } from "../site-chrome";

export default function ManualeOperativoPage() {
  return (
    <LegalPage
      eyebrow="Manuale operativo"
      intro="Regole pratiche per usare Qoovex nei piloti: il prodotto aiuta a ordinare informazioni, ma non sostituisce controlli professionali."
      title="Qoovex organizza, non certifica"
    >
      <LegalSection title="Principio base">
        <p>
          Qoovex rende visibili documenti, scadenze, checklist, prove e pacchetti condivisi. Non
          stabilisce se un documento sia sufficiente, se una situazione sia idonea o se una richiesta
          sia completa.
        </p>
      </LegalSection>

      <LegalSection title="Responsabilita operative">
        <ul className="legal-list">
          <li>Il cliente decide quali dati inserire e chi puo accedervi.</li>
          <li>Responsabili e consulenti verificano contenuti, requisiti e decisioni operative.</li>
          <li>Gli utenti caricano solo materiali autorizzati e pertinenti.</li>
          <li>Qoovex mantiene ordine, tracciabilita tecnica e strumenti di revisione.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Preset e liste documenti">
        <p>
          Qoovex non include liste documentali precompilate in questa fase. Eventuali requisiti,
          checklist o preset devono arrivare dal cliente, da consulenti incaricati o da materiale
          verificato dal team prima dell'inserimento.
        </p>
      </LegalSection>

      <LegalSection title="Uso durante i piloti">
        <p>
          Il workspace previsto per la produzione e {workspaceProductionUrl}. Prima di attivare un
          cliente pilota bisogna verificare dominio, email mittente, account owner, ruoli,
          configurazione documentale fornita dal cliente e procedura di uscita dal pilota.
        </p>
      </LegalSection>

      <LegalSection title="Canale operativo">
        <p>
          Per accesso pilota, supporto operativo o richieste dati:{" "}
          <a href={contactHref}>{contactEmail}</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
