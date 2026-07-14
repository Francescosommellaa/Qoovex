"use client";

import { useEffect, useState, type FormEvent, type HTMLAttributes, type ReactNode } from "react";
import { signOut } from "next-auth/react";
import { Alert, Button, Field, Input, LoadingState } from "@qoovex/ui";
import styles from "./AccountSecurity.module.css";

function SecuritySection({ children, className, tone = "default", ...props }: { children: ReactNode; tone?: "default" | "info" | "warning" } & HTMLAttributes<HTMLElement>) {
  return <section {...props} className={`${styles.surface} ${styles[`surface${tone[0].toUpperCase()}${tone.slice(1)}`]} ${className ?? ""}`}>{children}</section>;
}

function SecurityState({ children, tone = "neutral" }: { children: ReactNode; tone?: "positive" | "warning" | "danger" | "neutral" }) {
  return <strong className={`${styles.state} ${styles[`state${tone[0].toUpperCase()}${tone.slice(1)}`]}`}>{children}</strong>;
}

export interface MfaStatus {
  enabled: boolean;
  satisfied: boolean;
  backupCodesRemaining: number;
  totpVerifiedAt: string | Date | null;
}

type Setup = { secret: string; otpauthUrl: string };
type Recovery = {
  id: string;
  mode: "SELF_EMAIL" | "OWNER_APPROVAL";
  status: "PENDING" | "APPROVED" | "DENIED" | "SETUP_STARTED" | "COMPLETED" | "EXPIRED";
  expiresAt: string;
};
type RecoveryRequest = {
  id: string;
  requester: { id: string; email: string };
  expiresAt: string;
};
type ApiError = { message?: string; code?: string };

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const body = await response.json().catch(() => null) as T | ApiError | null;
  if (!response.ok) {
    const fallback = response.status === 429 ? "Troppi tentativi. Riprova tra qualche minuto." : "Operazione non disponibile.";
    const message = body && typeof body === "object" && "message" in body ? body.message : null;
    throw new Error(typeof message === "string" ? message : fallback);
  }
  return body as T;
}

function jsonInit(method: "POST" | "DELETE", body?: Record<string, unknown>): RequestInit {
  return {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  };
}

export function AccountSecurityFlow({ initialStatus, mode }: { initialStatus: MfaStatus; mode: "gate" | "management" }) {
  const [status, setStatus] = useState(initialStatus);
  const [setup, setSetup] = useState<Setup | null>(null);
  const [recovery, setRecovery] = useState<Recovery | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [inbox, setInbox] = useState<RecoveryRequest[]>([]);
  const [inboxAvailable, setInboxAvailable] = useState(false);
  const [emailCodeRequested, setEmailCodeRequested] = useState(false);
  const [recoveryCodeRequested, setRecoveryCodeRequested] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== "gate") return;
    let active = true;
    requestJson<{ recovery: Recovery | null }>("/api/account/mfa/recovery")
      .then((body) => { if (active) setRecovery(body.recovery); })
      .catch(() => undefined);
    return () => { active = false; };
  }, [mode]);

  useEffect(() => {
    if (mode !== "management" || !status.enabled || !status.satisfied) return;
    let active = true;
    requestJson<{ requests: RecoveryRequest[] }>("/api/account/mfa/recovery/inbox")
      .then((body) => {
        if (!active) return;
        setInbox(body.requests);
        setInboxAvailable(true);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [mode, status.enabled, status.satisfied]);

  async function run<T>(key: string, operation: () => Promise<T>) {
    setLoading(key);
    setError(null);
    setNotice(null);
    try {
      return await operation();
    } catch (operationError) {
      setError(operationError instanceof Error ? operationError.message : "Operazione non disponibile.");
      return null;
    } finally {
      setLoading(null);
    }
  }

  async function leaveSession() {
    await fetch("/api/account/mfa/session", { method: "DELETE" }).catch(() => null);
    await signOut({ callbackUrl: "/sign-in" });
  }

  async function challenge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = String(new FormData(event.currentTarget).get("code") ?? "");
    const result = await run("challenge", () => requestJson<{ verified: true }>("/api/account/mfa/challenge", jsonInit("POST", { code })));
    if (result) window.location.reload();
  }

  async function requestEnrollmentCode() {
    const result = await run("enrollment-email", () => requestJson<{ sent: true }>("/api/account/mfa/enrollment-code", jsonInit("POST")));
    if (result) {
      setEmailCodeRequested(true);
      setNotice("Codice inviato all'email verificata. Scade tra 10 minuti.");
    }
  }

  async function authorizeEnrollment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = String(new FormData(event.currentTarget).get("emailCode") ?? "");
    const result = await run("enrollment-authorize", () => requestJson<Setup>("/api/account/mfa", jsonInit("POST", { authorizationType: "email", code })));
    if (result) setSetup(result);
  }

  async function confirmSetup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = String(new FormData(event.currentTarget).get("newCode") ?? "");
    const result = await run("confirm-setup", () => requestJson<{ backupCodes: string[]; reauthenticationRequired: true }>("/api/account/mfa/confirm", jsonInit("POST", { code })));
    if (result) {
      setBackupCodes(result.backupCodes);
      setSetup(null);
      setStatus((current) => ({ ...current, enabled: true, satisfied: false }));
    }
  }

  async function currentFactorAction(event: FormEvent<HTMLFormElement>, action: "replace" | "backup" | "disable") {
    event.preventDefault();
    const currentCode = String(new FormData(event.currentTarget).get("currentCode") ?? "");
    if (action === "replace") {
      const result = await run(action, () => requestJson<Setup>("/api/account/mfa", jsonInit("POST", { authorizationType: "current-factor", code: currentCode })));
      if (result) setSetup(result);
      return;
    }
    if (action === "backup") {
      const result = await run(action, () => requestJson<{ backupCodes: string[] }>("/api/account/mfa/backup-codes", jsonInit("POST", { currentCode })));
      if (result) setBackupCodes(result.backupCodes);
      return;
    }
    const result = await run(action, () => requestJson<{ disabled: true; reauthenticationRequired: true }>("/api/account/mfa", jsonInit("DELETE", { currentCode })));
    if (result) await leaveSession();
  }

  async function requestRecoveryCode() {
    const result = await run("recovery-email", () => requestJson<{ sent: true }>("/api/account/mfa/recovery/code", jsonInit("POST")));
    if (result) {
      setRecoveryCodeRequested(true);
      setNotice("Codice di recupero inviato all'email verificata.");
    }
  }

  async function createRecovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const emailCode = String(new FormData(event.currentTarget).get("recoveryEmailCode") ?? "");
    const result = await run("recovery-create", () => requestJson<Recovery>("/api/account/mfa/recovery", jsonInit("POST", { emailCode })));
    if (result) setRecovery(result);
  }

  async function refreshRecovery() {
    const result = await run("recovery-refresh", () => requestJson<{ recovery: Recovery | null }>("/api/account/mfa/recovery"));
    if (result) setRecovery(result.recovery);
  }

  async function startRecoverySetup() {
    if (!recovery) return;
    const result = await run("recovery-setup", () => requestJson<Setup>("/api/account/mfa", jsonInit("POST", { authorizationType: "recovery", recoveryRequestId: recovery.id })));
    if (result) setSetup(result);
  }

  async function decideRecovery(form: HTMLFormElement, requestId: string, decision: "approve" | "deny") {
    const currentCode = String(new FormData(form).get("ownerCode") ?? "");
    const result = await run(`${decision}:${requestId}`, () => requestJson<{ id: string; status: string }>(`/api/account/mfa/recovery/${requestId}/decision`, jsonInit("POST", { decision, currentCode })));
    if (result) {
      setInbox((current) => current.filter((item) => item.id !== requestId));
      setNotice(decision === "approve" ? "Recupero approvato e notificato." : "Recupero rifiutato e notificato.");
    }
  }

  if (backupCodes.length > 0) {
    return (
      <div className={`${styles.flow} ${mode === "gate" ? styles.gate : ""}`}>
        <SecuritySection>
          <div className={styles.section}>
            <SecurityState tone="positive">Configurazione completata</SecurityState>
            <h1>Conserva i codici di recupero</h1>
            <Alert title="Vengono mostrati una sola volta" tone="positive">Salvali in un luogo separato dal dispositivo usato per l&apos;accesso.</Alert>
            <pre className={styles.codeBlock}>{backupCodes.join("\n")}</pre>
            {status.satisfied ? <Button onClick={() => { setBackupCodes([]); window.location.reload(); }}>Ho salvato i codici</Button> : <Button onClick={leaveSession}>Ho salvato i codici, accedi di nuovo</Button>}
          </div>
        </SecuritySection>
      </div>
    );
  }

  if (setup) {
    return (
      <div className={`${styles.flow} ${mode === "gate" ? styles.gate : ""}`}>
        <SecuritySection>
          <div className={styles.section}>
            <SecurityState tone="warning">Nuovo fattore da confermare</SecurityState>
            <h1>Configura l&apos;app Authenticator</h1>
            <p className="qv-text-muted">Inserisci manualmente il secret oppure apri il link sul dispositivo compatibile.</p>
            <code className={styles.codeBlock}>{setup.secret}</code>
            <Button href={setup.otpauthUrl} variant="secondary">Apri nell&apos;app Authenticator</Button>
            <form className={styles.form} onSubmit={confirmSetup}>
              <Field htmlFor="mfa-new-code" label="Codice del nuovo fattore" description="Il nuovo codice conferma solo il nuovo fattore, non sostituisce la verifica precedente.">
                <Input autoComplete="one-time-code" id="mfa-new-code" inputMode="numeric" name="newCode" pattern="[0-9]{6}" required />
              </Field>
              <Button disabled={loading === "confirm-setup"} type="submit">{loading === "confirm-setup" ? "Verifica in corso" : "Conferma nuovo fattore"}</Button>
            </form>
            {error ? <Alert tone="danger">{error}</Alert> : null}
          </div>
        </SecuritySection>
      </div>
    );
  }

  if (mode === "gate") {
    return (
      <div className={`${styles.flow} ${styles.gate}`}>
        <div className={styles.heading}>
          <div><p>Accesso al workspace</p><h1>Conferma MFA</h1></div>
          <SecurityState tone="warning">Conferma richiesta</SecurityState>
        </div>
        <SecuritySection>
          <form className={styles.form} onSubmit={challenge}>
            <p>Inserisci il codice dell&apos;app Authenticator oppure un codice di recupero monouso.</p>
            <Field htmlFor="mfa-gate-code" label="Codice MFA">
              <Input autoComplete="one-time-code" autoFocus id="mfa-gate-code" name="code" required />
            </Field>
            <Button disabled={loading === "challenge"} type="submit">{loading === "challenge" ? "Verifica in corso" : "Apri il workspace"}</Button>
          </form>
        </SecuritySection>
        {recovery ? (
          <SecuritySection tone="warning">
            <div className={styles.section}>
              <div className={styles.statusRow}><h2>Recupero MFA</h2><SecurityState tone={recovery.status === "APPROVED" ? "positive" : recovery.status === "DENIED" || recovery.status === "EXPIRED" ? "danger" : "warning"}>{recovery.status}</SecurityState></div>
              {recovery.status === "PENDING" ? <Alert title="In attesa dell'OWNER" tone="warning">Il workspace resta protetto. La richiesta scade alle {new Date(recovery.expiresAt).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}.</Alert> : null}
              {recovery.status === "APPROVED" ? <Alert title="Richiesta approvata" tone="positive">Puoi configurare una sola volta un nuovo fattore.</Alert> : null}
              {recovery.status === "DENIED" ? <Alert title="Richiesta rifiutata" tone="danger">Contatta un OWNER della tua Azienda e avvia una nuova richiesta se necessario.</Alert> : null}
              {recovery.status === "EXPIRED" ? <Alert title="Richiesta scaduta" tone="danger">Avvia un nuovo recupero e verifica nuovamente l&apos;email.</Alert> : null}
              <div className={styles.actions}>
                {recovery.status === "APPROVED" ? <Button onClick={startRecoverySetup}>Configura nuovo fattore</Button> : null}
                <Button disabled={loading === "recovery-refresh"} onClick={refreshRecovery} variant="secondary">Aggiorna stato</Button>
              </div>
            </div>
          </SecuritySection>
        ) : recoveryCodeRequested ? (
          <SecuritySection tone="info">
            <form className={styles.form} onSubmit={createRecovery}>
              <Alert title="Controlla la posta" tone="info">Il codice verifica la tua email; non disattiva MFA.</Alert>
              <Field htmlFor="mfa-recovery-email-code" label="Codice ricevuto via email">
                <Input autoComplete="one-time-code" id="mfa-recovery-email-code" inputMode="numeric" name="recoveryEmailCode" pattern="[0-9]{6}" required />
              </Field>
              <Button disabled={loading === "recovery-create"} type="submit">Continua il recupero</Button>
            </form>
          </SecuritySection>
        ) : (
          <Button disabled={loading === "recovery-email"} onClick={requestRecoveryCode} variant="ghost">Non hai piu accesso ai codici?</Button>
        )}
        {notice ? <Alert tone="info">{notice}</Alert> : null}
        {error ? <Alert tone="danger">{error}</Alert> : null}
        {loading === "recovery-refresh" ? <LoadingState label="Aggiornamento richiesta MFA" /> : null}
      </div>
    );
  }

  return (
    <div className={styles.flow}>
      <div className={styles.heading}>
        <div><p>Account personale</p><h1>Sicurezza account</h1></div>
        <SecurityState tone={status.enabled ? "positive" : "warning"}>{status.enabled ? "MFA attiva" : "MFA non attiva"}</SecurityState>
      </div>
      {notice ? <Alert tone="positive">{notice}</Alert> : null}
      {error ? <Alert tone="danger">{error}</Alert> : null}

      {!status.enabled ? (
        <SecuritySection tone="info">
          <div className={styles.section}>
            <h2>Proteggi l&apos;account</h2>
            <p>Prima di generare il secret verifichiamo l&apos;email associata all&apos;account.</p>
            {!emailCodeRequested ? <Button disabled={loading === "enrollment-email"} onClick={requestEnrollmentCode}>{loading === "enrollment-email" ? "Invio in corso" : "Invia codice via email"}</Button> : (
              <form className={styles.form} onSubmit={authorizeEnrollment}>
                <Field htmlFor="mfa-enrollment-code" label="Codice ricevuto via email">
                  <Input autoComplete="one-time-code" id="mfa-enrollment-code" inputMode="numeric" name="emailCode" pattern="[0-9]{6}" required />
                </Field>
                <Button disabled={loading === "enrollment-authorize"} type="submit">Continua</Button>
              </form>
            )}
          </div>
        </SecuritySection>
      ) : (
        <div className={styles.grid}>
          <SecuritySection>
            <form className={styles.form} onSubmit={(event) => currentFactorAction(event, "replace")}>
              <h2>Sostituisci il fattore</h2>
              <p className="qv-text-muted">Richiede il fattore corrente. La conferma del nuovo TOTP revocherà tutte le sessioni.</p>
              <Field htmlFor="mfa-replace-code" label="Fattore corrente"><Input autoComplete="one-time-code" id="mfa-replace-code" name="currentCode" required /></Field>
              <Button disabled={loading === "replace"} type="submit">Avvia sostituzione</Button>
            </form>
          </SecuritySection>
          <SecuritySection>
            <form className={styles.form} onSubmit={(event) => currentFactorAction(event, "backup")}>
              <h2>Rigenera backup code</h2>
              <p className="qv-text-muted">{status.backupCodesRemaining} codici non utilizzati. I precedenti verranno revocati.</p>
              <Field htmlFor="mfa-backup-code" label="Fattore corrente"><Input autoComplete="one-time-code" id="mfa-backup-code" name="currentCode" required /></Field>
              <Button disabled={loading === "backup"} type="submit" variant="secondary">Rigenera codici</Button>
            </form>
          </SecuritySection>
        </div>
      )}

      {inboxAvailable ? (
        <SecuritySection>
          <div className={styles.section}>
            <div className={styles.statusRow}><h2>Richieste recupero da approvare</h2><SecurityState tone={inbox.length ? "warning" : "neutral"}>{inbox.length ? `${inbox.length} in attesa` : "Nessuna richiesta"}</SecurityState></div>
            {inbox.length === 0 ? <p className="qv-text-muted">Non ci sono richieste attive per questa Azienda.</p> : (
              <div className={styles.requestList}>
                {inbox.map((request) => (
                  <form className={styles.request} key={request.id} onSubmit={(event) => { event.preventDefault(); void decideRecovery(event.currentTarget, request.id, "approve"); }}>
                    <strong>{request.requester.email}</strong>
                    <span className={styles.requestMeta}>Scade alle {new Date(request.expiresAt).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}</span>
                    <Field htmlFor={`owner-code-${request.id}`} label="Il tuo fattore MFA"><Input autoComplete="one-time-code" id={`owner-code-${request.id}`} name="ownerCode" required /></Field>
                    <div className={styles.actions}>
                      <Button disabled={loading === `approve:${request.id}`} type="submit">Approva</Button>
                      <Button disabled={loading === `deny:${request.id}`} onClick={(event) => { event.preventDefault(); const form = event.currentTarget.form; if (form) void decideRecovery(form, request.id, "deny"); }} variant="danger">Rifiuta</Button>
                    </div>
                  </form>
                ))}
              </div>
            )}
          </div>
        </SecuritySection>
      ) : null}

      {status.enabled ? (
        <SecuritySection className={styles.dangerZone}>
          <form className={styles.form} onSubmit={(event) => currentFactorAction(event, "disable")}>
            <h2>Disattiva MFA</h2>
            <Alert title="Azione sensibile" tone="warning">Richiede sempre il fattore corrente e revoca tutte le sessioni.</Alert>
            <Field htmlFor="mfa-disable-code" label="Fattore corrente"><Input autoComplete="one-time-code" id="mfa-disable-code" name="currentCode" required /></Field>
            <Button disabled={loading === "disable"} type="submit" variant="danger">Disattiva MFA</Button>
          </form>
        </SecuritySection>
      ) : null}
    </div>
  );
}
