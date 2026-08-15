"use client";

import { useEffect, useState, type FormEvent, type HTMLAttributes, type ReactNode } from "react";
import { signOut } from "next-auth/react";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Button, buttonVariants } from "@qoovex/ui/components/button";
import { Card, CardContent } from "@qoovex/ui/components/card";
import { Field, FieldDescription, FieldLabel } from "@qoovex/ui/components/field";
import { Input } from "@qoovex/ui/components/input";
import { OtpInput } from "@qoovex/ui/components/otp-input";
import { Spinner } from "@qoovex/ui/components/spinner";
import { cn } from "@qoovex/ui/lib/utils";
import { presentMfaRecoveryStatus } from "@shared/lib/product-state-presentation";
import styles from "./AccountSecurity.module.css";

function SecuritySection({ children, className, tone = "default", ...props }: { children: ReactNode; tone?: "default" | "info" | "warning" } & HTMLAttributes<HTMLElement>) {
  return (
    <section {...props}>
      <Card className={cn(styles.surface, styles[`surface${tone[0].toUpperCase()}${tone.slice(1)}`], className)}>
        <CardContent className={styles.surfaceContent}>{children}</CardContent>
      </Card>
    </section>
  );
}

function SecurityState({ children, tone = "neutral" }: { children: ReactNode; tone?: "positive" | "warning" | "danger" | "neutral" }) {
  return <strong className={cn(styles.state, styles[`state${tone[0].toUpperCase()}${tone.slice(1)}`])}>{children}</strong>;
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

export function AccountSecurityFlow({ initialStatus, mode, showDataExport = false }: { initialStatus: MfaStatus; mode: "gate" | "management"; showDataExport?: boolean }) {
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

  async function copySensitiveValue(value: string, message: string) {
    const result = await run("copy", async () => {
      await navigator.clipboard.writeText(value);
      return true;
    });
    if (result) setNotice(message);
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
            <Alert variant="success"><AlertTitle>Vengono mostrati una sola volta</AlertTitle><AlertDescription>Salvali in un luogo separato dal dispositivo usato per l&apos;accesso.</AlertDescription></Alert>
            <pre className={styles.codeBlock}>{backupCodes.join("\n")}</pre>
            <div className={styles.actions}>
              <Button disabled={loading === "copy"} onClick={() => copySensitiveValue(backupCodes.join("\n"), "Codici copiati negli appunti.")} variant="outline">{loading === "copy" ? <><Spinner /> Copia in corso</> : "Copia i codici"}</Button>
              {status.satisfied ? <Button onClick={() => { setBackupCodes([]); window.location.reload(); }}>Ho salvato i codici</Button> : <Button onClick={leaveSession}>Ho salvato i codici, accedi di nuovo</Button>}
            </div>
            {notice ? <Alert role="status" variant="info"><AlertDescription>{notice}</AlertDescription></Alert> : null}
            {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
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
            <p className="text-muted-foreground">Inserisci manualmente il secret oppure apri il link sul dispositivo compatibile.</p>
            <code className={styles.codeBlock}>{setup.secret}</code>
            <div className={styles.actions}>
              <a className={buttonVariants({ variant: "secondary" })} href={setup.otpauthUrl}>Apri nell&apos;app Authenticator</a>
              <Button disabled={loading === "copy"} onClick={() => copySensitiveValue(setup.secret, "Secret copiato negli appunti.")} variant="outline">{loading === "copy" ? <><Spinner /> Copia in corso</> : "Copia il secret"}</Button>
            </div>
            <form className={styles.form} onSubmit={confirmSetup}>
              <Field><FieldLabel htmlFor="mfa-new-code">Codice del nuovo fattore</FieldLabel>
                <OtpInput autoComplete="one-time-code" id="mfa-new-code" inputMode="numeric" name="newCode" required />
                <FieldDescription>Il nuovo codice conferma solo il nuovo fattore, non sostituisce la verifica precedente.</FieldDescription>
              </Field>
              <Button disabled={loading === "confirm-setup"} type="submit">{loading === "confirm-setup" ? <><Spinner /> Verifica in corso</> : "Conferma nuovo fattore"}</Button>
            </form>
            {notice ? <Alert role="status" variant="info"><AlertDescription>{notice}</AlertDescription></Alert> : null}
            {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
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
            <Field><FieldLabel htmlFor="mfa-gate-code">Codice MFA</FieldLabel>
              <Input autoComplete="one-time-code" autoFocus id="mfa-gate-code" name="code" required />
              <FieldDescription>Puoi usare il codice dell’app Authenticator oppure un backup code monouso.</FieldDescription>
            </Field>
            <Button disabled={loading === "challenge"} type="submit">{loading === "challenge" ? <><Spinner /> Verifica in corso</> : "Apri il workspace"}</Button>
          </form>
        </SecuritySection>
        {recovery ? (
          <SecuritySection tone="warning">
            <div className={styles.section}>
              <div className={styles.statusRow}><h2>Recupero MFA</h2><SecurityState tone={recovery.status === "APPROVED" ? "positive" : recovery.status === "DENIED" || recovery.status === "EXPIRED" ? "danger" : "warning"}>{presentMfaRecoveryStatus(recovery.status).label}</SecurityState></div>
              {recovery.status === "PENDING" ? <Alert variant="warning"><AlertTitle>In attesa del Titolare dell&apos;Azienda</AlertTitle><AlertDescription>Il workspace resta protetto. La richiesta scade alle {new Date(recovery.expiresAt).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}.</AlertDescription></Alert> : null}
              {recovery.status === "APPROVED" ? <Alert variant="success"><AlertTitle>Richiesta approvata</AlertTitle><AlertDescription>Puoi configurare una sola volta un nuovo fattore.</AlertDescription></Alert> : null}
              {recovery.status === "DENIED" ? <Alert variant="destructive"><AlertTitle>Richiesta rifiutata</AlertTitle><AlertDescription>Contatta un Titolare della tua Azienda e avvia una nuova richiesta se necessario.</AlertDescription></Alert> : null}
              {recovery.status === "EXPIRED" ? <Alert variant="destructive"><AlertTitle>Richiesta scaduta</AlertTitle><AlertDescription>Avvia un nuovo recupero e verifica nuovamente l&apos;email.</AlertDescription></Alert> : null}
              <div className={styles.actions}>
                {recovery.status === "APPROVED" ? <Button onClick={startRecoverySetup}>Configura nuovo fattore</Button> : null}
                <Button disabled={loading === "recovery-refresh"} onClick={refreshRecovery} variant="secondary">Aggiorna stato</Button>
              </div>
            </div>
          </SecuritySection>
        ) : recoveryCodeRequested ? (
          <SecuritySection tone="info">
            <form className={styles.form} onSubmit={createRecovery}>
              <Alert variant="info"><AlertTitle>Controlla la posta</AlertTitle><AlertDescription>Il codice verifica la tua email; non disattiva MFA.</AlertDescription></Alert>
              <Field><FieldLabel htmlFor="mfa-recovery-email-code">Codice ricevuto via email</FieldLabel>
                <OtpInput autoComplete="one-time-code" id="mfa-recovery-email-code" inputMode="numeric" name="recoveryEmailCode" required />
              </Field>
              <Button disabled={loading === "recovery-create"} type="submit">{loading === "recovery-create" ? <><Spinner /> Verifica in corso</> : "Continua il recupero"}</Button>
            </form>
          </SecuritySection>
        ) : (
          <Button disabled={loading === "recovery-email"} onClick={requestRecoveryCode} variant="ghost">Non hai piu accesso ai codici?</Button>
        )}
        {notice ? <Alert variant="info"><AlertDescription>{notice}</AlertDescription></Alert> : null}
        {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
        {loading === "recovery-refresh" ? <div aria-live="polite" className="flex items-center gap-2 text-sm text-muted-foreground"><Spinner /> Aggiornamento richiesta MFA</div> : null}
      </div>
    );
  }

  return (
    <div className={styles.flow}>
      <div className={styles.heading}>
        <div><p>Account personale</p><h1>Sicurezza account</h1></div>
        <SecurityState tone={status.enabled ? "positive" : "warning"}>{status.enabled ? "MFA attiva" : "MFA non attiva"}</SecurityState>
      </div>
      {notice ? <Alert variant="success"><AlertDescription>{notice}</AlertDescription></Alert> : null}
      {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}

      {!status.enabled ? (
        <SecuritySection tone="info">
          <div className={styles.section}>
            <h2>Proteggi l&apos;account</h2>
            <p>Prima di generare il secret verifichiamo l&apos;email associata all&apos;account.</p>
            {!emailCodeRequested ? <Button disabled={loading === "enrollment-email"} onClick={requestEnrollmentCode}>{loading === "enrollment-email" ? <><Spinner /> Invio in corso</> : "Invia codice via email"}</Button> : (
              <form className={styles.form} onSubmit={authorizeEnrollment}>
                <Field><FieldLabel htmlFor="mfa-enrollment-code">Codice ricevuto via email</FieldLabel>
                  <OtpInput autoComplete="one-time-code" id="mfa-enrollment-code" inputMode="numeric" name="emailCode" required />
                </Field>
                <Button disabled={loading === "enrollment-authorize"} type="submit">{loading === "enrollment-authorize" ? <><Spinner /> Verifica in corso</> : "Continua"}</Button>
              </form>
            )}
          </div>
        </SecuritySection>
      ) : (
        <div className={styles.grid}>
          <SecuritySection>
            <form className={styles.form} onSubmit={(event) => currentFactorAction(event, "replace")}>
              <h2>Sostituisci il fattore</h2>
              <p className="text-muted-foreground">Richiede il fattore corrente. La conferma del nuovo TOTP revocherà tutte le sessioni.</p>
              <Field><FieldLabel htmlFor="mfa-replace-code">Fattore corrente</FieldLabel><Input autoComplete="one-time-code" id="mfa-replace-code" name="currentCode" required /></Field>
              <Button disabled={loading === "replace"} type="submit">{loading === "replace" ? <><Spinner /> Verifica in corso</> : "Avvia sostituzione"}</Button>
            </form>
          </SecuritySection>
          <SecuritySection>
            <form className={styles.form} onSubmit={(event) => currentFactorAction(event, "backup")}>
              <h2>Rigenera backup code</h2>
              <p className="text-muted-foreground">{status.backupCodesRemaining} codici non utilizzati. I precedenti verranno revocati.</p>
              <Field><FieldLabel htmlFor="mfa-backup-code">Fattore corrente</FieldLabel><Input autoComplete="one-time-code" id="mfa-backup-code" name="currentCode" required /></Field>
              <Button disabled={loading === "backup"} type="submit" variant="secondary">{loading === "backup" ? <><Spinner /> Verifica in corso</> : "Rigenera codici"}</Button>
            </form>
          </SecuritySection>
        </div>
      )}

      {inboxAvailable ? (
        <SecuritySection>
          <div className={styles.section}>
            <div className={styles.statusRow}><h2>Richieste recupero da approvare</h2><SecurityState tone={inbox.length ? "warning" : "neutral"}>{inbox.length ? `${inbox.length} in attesa` : "Nessuna richiesta"}</SecurityState></div>
            {inbox.length === 0 ? <p className="text-muted-foreground">Non ci sono richieste attive per questa Azienda.</p> : (
              <div className={styles.requestList}>
                {inbox.map((request) => (
                  <form className={styles.request} key={request.id} onSubmit={(event) => { event.preventDefault(); void decideRecovery(event.currentTarget, request.id, "approve"); }}>
                    <strong>{request.requester.email}</strong>
                    <span className={styles.requestMeta}>Scade alle {new Date(request.expiresAt).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}</span>
                    <Field><FieldLabel htmlFor={`owner-code-${request.id}`}>Il tuo fattore MFA</FieldLabel><Input autoComplete="one-time-code" id={`owner-code-${request.id}`} name="ownerCode" required /></Field>
                    <div className={styles.actions}>
                      <Button disabled={loading === `approve:${request.id}`} type="submit">{loading === `approve:${request.id}` ? <><Spinner /> Approvazione</> : "Approva"}</Button>
                      <Button disabled={loading === `deny:${request.id}`} onClick={(event) => { event.preventDefault(); const form = event.currentTarget.form; if (form) void decideRecovery(form, request.id, "deny"); }} variant="destructive">{loading === `deny:${request.id}` ? <><Spinner /> Rifiuto</> : "Rifiuta"}</Button>
                    </div>
                  </form>
                ))}
              </div>
            )}
          </div>
        </SecuritySection>
      ) : null}

      {showDataExport ? (
        <SecuritySection tone="info">
          <div className={styles.section}>
            <h2>I tuoi dati</h2>
            <p className="text-muted-foreground">Scarica un file JSON con le informazioni del tuo profilo, i tuoi immobili e le partecipazioni ai lavori.</p>
            <a className={buttonVariants({ variant: "outline" })} href="/api/client/data-export">Scarica i tuoi dati</a>
          </div>
        </SecuritySection>
      ) : null}

      {status.enabled ? (
        <SecuritySection className={styles.dangerZone}>
          <form className={styles.form} onSubmit={(event) => currentFactorAction(event, "disable")}>
            <h2>Disattiva MFA</h2>
            <Alert variant="warning"><AlertTitle>Azione sensibile</AlertTitle><AlertDescription>Richiede sempre il fattore corrente e revoca tutte le sessioni.</AlertDescription></Alert>
            <Field><FieldLabel htmlFor="mfa-disable-code">Fattore corrente</FieldLabel><Input autoComplete="one-time-code" id="mfa-disable-code" name="currentCode" required /></Field>
            <Button disabled={loading === "disable"} type="submit" variant="destructive">{loading === "disable" ? <><Spinner /> Disattivazione</> : "Disattiva MFA"}</Button>
          </form>
        </SecuritySection>
      ) : null}
    </div>
  );
}
