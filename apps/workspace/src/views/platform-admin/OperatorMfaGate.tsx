"use client";

import { useState, type FormEvent } from "react";
import styles from "./PlatformAdmin.module.css";

type SetupState = { secret: string; otpauthUrl: string } | null;

export function OperatorMfaGate({ enabled }: { enabled: boolean }) {
  const [setup, setSetup] = useState<SetupState>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function startSetup() {
    setLoading(true);
    setError(null);
    const response = await fetch("/api/account/mfa", { method: "POST" });
    const body = await response.json().catch(() => null) as SetupState | { message?: string };
    setLoading(false);
    if (!response.ok || !body || !("secret" in body)) {
      setError(body && "message" in body ? body.message ?? "Configurazione MFA non disponibile." : "Configurazione MFA non disponibile.");
      return;
    }
    setSetup(body);
  }

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const code = String(new FormData(event.currentTarget).get("code") ?? "");
    const endpoint = enabled ? "/api/account/mfa/challenge" : "/api/account/mfa/confirm";
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
    const body = await response.json().catch(() => null) as { message?: string; backupCodes?: string[] } | null;
    setLoading(false);
    if (!response.ok) {
      setError(body?.message ?? "Codice MFA non valido.");
      return;
    }
    if (body?.backupCodes) {
      setBackupCodes(body.backupCodes);
      return;
    }
    window.location.reload();
  }

  if (backupCodes.length > 0) {
    return (
      <div className={styles.stack}>
        <p className={styles.success}>MFA attivata. Conserva questi codici in un luogo sicuro: non verranno mostrati di nuovo.</p>
        <pre className={styles.codeBlock}>{backupCodes.join("\n")}</pre>
        <button className={styles.button} onClick={() => window.location.reload()} type="button">Continua</button>
      </div>
    );
  }

  return (
    <div className={styles.stack}>
      <p className={styles.notice}>{enabled ? "Inserisci un codice dell'app Authenticator per aprire la console." : "La console richiede MFA. Avvia la configurazione e inserisci il codice generato dall'app Authenticator."}</p>
      {!enabled && !setup ? <button className={styles.button} disabled={loading} onClick={startSetup} type="button">Configura MFA</button> : null}
      {setup ? (
        <div className={styles.stack}>
          <p className={styles.muted}>Aggiungi manualmente questo secret alla tua app Authenticator.</p>
          <code className={styles.codeBlock}>{setup.secret}</code>
        </div>
      ) : null}
      {enabled || setup ? (
        <form className={styles.form} onSubmit={verify}>
          <div className={styles.field}>
            <label htmlFor="operator-mfa-code">Codice MFA</label>
            <input autoComplete="one-time-code" id="operator-mfa-code" inputMode="numeric" name="code" pattern="[0-9]{6}" required />
          </div>
          <button className={styles.button} disabled={loading} type="submit">{loading ? "Verifica in corso" : "Verifica"}</button>
        </form>
      ) : null}
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
    </div>
  );
}
