import Link from "next/link";
import { OrganizationSetupForm } from "./OrganizationSetupForm";
import styles from "./AuthPages.module.css";

export function SignInRequiredState({ callbackUrl = "/dashboard" }: { callbackUrl?: string }) {
  return (
    <main className={styles.authPage}>
      <section className={styles.setupCard} aria-labelledby="signin-required-title">
        <p className={styles.brand}>Qoovex</p>
        <h1 id="signin-required-title">Accedi al workspace</h1>
        <p>Per usare Qoovex serve un account. Dopo l'accesso potrai organizzare documenti, scadenze e prove di cantiere.</p>
        <div className={styles.actions}>
          <Link className={styles.primaryButton} href={`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`}>Accedi</Link>
          <Link className={styles.secondaryLink} href={`/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`}>Crea account</Link>
        </div>
      </section>
    </main>
  );
}

export function OrganizationRequiredState() {
  return (
    <main className={styles.authPage}>
      <section className={styles.setupCard} aria-labelledby="organization-required-title">
        <p className={styles.brand}>Qoovex</p>
        <h1 id="organization-required-title">Configura la tua azienda</h1>
        <p>Per usare Qoovex serve un'azienda attiva dove organizzare documenti, scadenze e prove di cantiere.</p>
        <OrganizationSetupForm />
      </section>
    </main>
  );
}

export function DataConfigurationState() {
  return (
    <main className={styles.authPage}>
      <section className={styles.setupCard} aria-labelledby="data-config-title">
        <p className={styles.brand}>Qoovex</p>
        <h1 id="data-config-title">Configurazione dati non pronta</h1>
        <p>Verifica che le migration siano applicate sull'ambiente corretto. Nessun reset automatico del database viene eseguito.</p>
      </section>
    </main>
  );
}
