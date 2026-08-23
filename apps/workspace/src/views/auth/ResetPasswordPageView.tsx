"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { IconAlertCircle, IconArrowLeft, IconArrowRight, IconRefresh } from "@tabler/icons-react";
import { Alert, AlertDescription } from "@qoovex/ui/components/alert";
import { Badge } from "@qoovex/ui/components/badge";
import { Button } from "@qoovex/ui/components/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@qoovex/ui/components/field";
import { Input } from "@qoovex/ui/components/input";
import { OtpInput } from "@qoovex/ui/components/otp-input";
import { PasswordInput } from "@qoovex/ui/components/password-input";
import { Spinner } from "@qoovex/ui/components/spinner";
import { AuthPageShell, AuthStage, resetSteps } from "./AuthPageShell";
import styles from "./AuthPages.module.css";

const PENDING_RESET_EMAIL_KEY = "qv-pending-password-reset-email";

async function postJson(path: string, payload: Record<string, unknown>) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) throw new Error(typeof body.message === "string" ? body.message : "Operazione non riuscita.");
}

export function ResetPasswordPageView({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [codeRequested, setCodeRequested] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const pendingEmail = window.sessionStorage.getItem(PENDING_RESET_EMAIL_KEY)?.trim();
    if (!pendingEmail) return;
    setEmail(pendingEmail);
    setCodeRequested(true);
    setMessage("Inserisci il codice ricevuto o richiedine uno nuovo.");
  }, []);

  async function requestCode(requestEmail: string) {
    await postJson("/api/auth/credentials/password-reset/request", { email: requestEmail });
    window.sessionStorage.setItem(PENDING_RESET_EMAIL_KEY, requestEmail);
    setEmail(requestEmail);
    setCodeRequested(true);
    setMessage("Se esiste un account con password, riceverai un codice di reset.");
  }

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const requestEmail = String(formData.get("email") ?? "").trim();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await requestCode(requestEmail);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Richiesta reset non riuscita.");
    } finally {
      setLoading(false);
    }
  }

  async function submitReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const code = String(formData.get("code") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmation = String(formData.get("passwordConfirmation") ?? "");
    if (password !== confirmation) {
      setError("Le password non coincidono.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await postJson("/api/auth/credentials/password-reset/confirm", { email, code, password });
      window.sessionStorage.removeItem(PENDING_RESET_EMAIL_KEY);
      const params = new URLSearchParams({ callbackUrl, passwordReset: "1" });
      router.push(`/sign-in?${params.toString()}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Reset password non riuscito.");
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    setLoading(true);
    setError(null);
    try {
      await requestCode(email);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Richiesta reset non riuscita.");
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    window.sessionStorage.removeItem(PENDING_RESET_EMAIL_KEY);
    setEmail("");
    setCodeRequested(false);
    setMessage(null);
    setError(null);
  }

  return (
    <AuthPageShell
      currentStep={codeRequested ? 2 : 1}
      description={<p>Richiedi un codice email e scegli una nuova password. La risposta non rivela se l’account esiste.</p>}
      footer={<p><Link data-link="inline" href={`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`}>Torna all’accesso</Link></p>}
      steps={resetSteps}
      title="Recupera la password"
      titleId="reset-password-title"
    >
      {!codeRequested ? (
        <AuthStage>
          <form aria-busy={loading} className={styles.form} onSubmit={submitRequest}>
            <Field>
              <FieldLabel htmlFor="reset-email">Email</FieldLabel>
              <Input autoComplete="email" autoFocus className="h-11 px-3" id="reset-email" name="email" required type="email" />
              <FieldDescription>Invieremo le istruzioni solo se l’indirizzo è associato a un account con password.</FieldDescription>
            </Field>
            {error ? <Alert variant="destructive"><IconAlertCircle /><AlertDescription>{error}</AlertDescription></Alert> : null}
            <Button className="h-11 w-full" disabled={loading} type="submit">
              {loading ? <><Spinner /> Invio in corso</> : <>Invia codice di reset <IconArrowRight data-icon="inline-end" /></>}
            </Button>
          </form>
        </AuthStage>
      ) : (
        <AuthStage>
          <Badge className="w-fit max-w-full truncate font-normal" variant="secondary">{email}</Badge>
          {message ? <Alert role="status" variant="info"><AlertDescription>{message}</AlertDescription></Alert> : null}
          <form aria-busy={loading} className={styles.form} onSubmit={submitReset}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="reset-code">Codice email</FieldLabel>
                <OtpInput autoFocus id="reset-code" inputMode="numeric" name="code" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="new-password">Nuova password</FieldLabel>
                <PasswordInput
                  autoComplete="new-password"
                  id="new-password"
                  inputClassName="h-11 px-3"
                  maxLength={128}
                  minLength={12}
                  name="password"
                  required
                  revealLabel="Mostra password"
                  concealLabel="Nascondi password"
                />
                <FieldDescription>Almeno 12 caratteri. Evita password comuni o già usate altrove.</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="new-password-confirmation">Conferma nuova password</FieldLabel>
                <PasswordInput
                  autoComplete="new-password"
                  id="new-password-confirmation"
                  inputClassName="h-11 px-3"
                  maxLength={128}
                  minLength={12}
                  name="passwordConfirmation"
                  required
                  revealLabel="Mostra conferma password"
                  concealLabel="Nascondi conferma password"
                />
              </Field>
            </FieldGroup>
            {error ? <Alert variant="destructive"><IconAlertCircle /><AlertDescription>{error}</AlertDescription></Alert> : null}
            <div className={styles.formActions}>
              <Button className="h-11" disabled={loading} type="submit">
                {loading ? <><Spinner /> Aggiornamento in corso</> : <>Aggiorna password <IconArrowRight data-icon="inline-end" /></>}
              </Button>
              <Button disabled={loading} onClick={resendCode} type="button" variant="outline"><IconRefresh /> Reinvia codice</Button>
              <Button disabled={loading} onClick={restart} type="button" variant="ghost"><IconArrowLeft /> Usa un’altra email</Button>
            </div>
          </form>
        </AuthStage>
      )}
    </AuthPageShell>
  );
}
