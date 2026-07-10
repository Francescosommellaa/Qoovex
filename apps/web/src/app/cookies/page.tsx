import { contactEmail, contactHref } from "../site-config";
import { LegalPage, LegalSection } from "../site-chrome";

export default function CookiesPage() {
  return (
    <LegalPage
      intro="Informativa cookie in bozza per il sito pubblico Qoovex. Lo stato attuale prevede solo tecnologie necessarie."
      title="Cookie policy"
    >
      <LegalSection title="Stato attuale">
        <p>
          Il sito pubblico usa solo tecnologie necessarie al funzionamento della pagina e al
          salvataggio della preferenza cookie nel browser. Non vengono caricati strumenti di
          misurazione, profilazione o pubblicita.
        </p>
      </LegalSection>

      <LegalSection title="Preferenza salvata nel browser">
        <p>
          Quando selezioni "Solo necessari" o "Ho capito", il sito salva una preferenza tecnica in
          localStorage con chiave <code>qoovex-cookie-preference-v1</code>. La preferenza serve solo
          a non mostrare di nuovo il banner nello stesso browser.
        </p>
      </LegalSection>

      <LegalSection title="Categorie future">
        <p>
          La struttura tecnica permette di aggiungere categorie opzionali in futuro, ma nessuna
          categoria non necessaria e attiva finche non esiste un servizio reale e una scelta
          esplicita dell'utente.
        </p>
      </LegalSection>

      <LegalSection title="Contatti">
        <p>
          Per domande sul sito o sulle preferenze puoi scrivere a{" "}
          <a href={contactHref}>{contactEmail}</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
