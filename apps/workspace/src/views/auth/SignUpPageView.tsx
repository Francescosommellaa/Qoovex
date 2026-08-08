"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { IconAlertCircle, IconArrowLeft, IconArrowRight, IconCircleCheck, IconRefresh } from "@tabler/icons-react";
import { Alert, AlertDescription } from "@qoovex/ui/components/alert";
import { Badge } from "@qoovex/ui/components/badge";
import { Button } from "@qoovex/ui/components/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@qoovex/ui/components/field";
import { Input } from "@qoovex/ui/components/input";
import { OtpInput } from "@qoovex/ui/components/otp-input";
import { PasswordInput } from "@qoovex/ui/components/password-input";
import { Spinner } from "@qoovex/ui/components/spinner";
import { AuthPageShell, AuthStage, credentialSteps } from "./AuthPageShell";
import styles from "./AuthPages.module.css";

type Step = "email" | "verify" | "details";
const PENDING_SIGNUP_EMAIL_KEY = "qv-pending-signup-email";
const stepNumber: Record<Step, number> = { email: 1, verify: 2, details: 3 };

async function postJson(path: string, payload: Record<string, unknown>) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) throw new Error(typeof body.message === "string" ? body.message : "Operazione non riuscita.");
  return body;
}

function signInHref(callbackUrl: string, status?: "verified" | "created") {
  const params = new URLSearchParams({ callbackUrl });
  if (status) params.set(status, "1");
  return `/sign-in?${params.toString()}`;
}

export function SignUpPageView({
  callbackUrl,
  verifiedEmail,
}: {
  callbackUrl: string;
  verifiedEmail: string | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(verifiedEmail ? "details" : "email");
  const [email, setEmail] = useState(verifiedEmail ?? "");
  const [message, setMessage] = useState<string | null>(
    verifiedEmail ? "Email verificata. Ora scegli username e password." : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (verifiedEmail) return;
    const pendingEmail = window.sessionStorage.getItem(PENDING_SIGNUP_EMAIL_KEY)?.trim();
    if (!pendingEmail) return;
    setEmail(pendingEmail);
    setStep("verify");
    setMessage("Inserisci il codice ricevuto o richiedine uno nuovo.");
  }, [verifiedEmail]);

  async function requestCode(submittedEmail: string) {
    await postJson("/api/auth/credentials/sign-up", { email: submittedEmail });
    setEmail(submittedEmail);
    window.sessionStorage.setItem(PENDING_SIGNUP_EMAIL_KEY, submittedEmail);
    setStep("verify");
    setMessage("Se l’indirizzo può essere verificato, riceverai un codice. Controlla la tua email.");
  }

  async function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const submittedEmail = String(formData.get("email") ?? "").trim();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await requestCode(submittedEmail);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Invio codice non riuscito.");
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
      setError(requestError instanceof Error ? requestError.message : "Invio codice non riuscito.");
    } finally {
      setLoading(false);
    }
  }

  async function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const code = String(formData.get("code") ?? "").trim();
    try {
      const result = await postJson("/api/auth/credentials/verify-email", { email, code });
      window.sessionStorage.removeItem(PENDING_SIGNUP_EMAIL_KEY);
      if (result.next === "sign-in") {
        router.push(signInHref(callbackUrl, "verified"));
        return;
      }
      setStep("details");
      setMessage("Email verificata. Ora scegli username e password.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Verifica non riuscita.");
    } finally {
      setLoading(false);
    }
  }

  async function submitDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    setLoading(true);
    setError(null);
    try {
      await postJson("/api/auth/credentials/sign-up/complete", { username, password });
      const result = await signIn("credentials", {
        identifier: email,
        password,
        redirect: false,
        callbackUrl,
      });
      if (result?.error) {
        router.push(signInHref(callbackUrl, "created"));
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Registrazione non riuscita.");
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    window.sessionStorage.removeItem(PENDING_SIGNUP_EMAIL_KEY);
    setEmail("");
    setStep("email");
    setMessage(null);
    setError(null);
  }

  return (
    <AuthPageShell
      currentStep={stepNumber[step]}
      description={<p>Verifica l’email prima di impostare le credenziali. I dati account vengono salvati solo al termine.</p>}
      footer={<p>Hai già un account? <Link data-link="inline" href={signInHref(callbackUrl)}>Accedi</Link></p>}
      steps={credentialSteps}
      title="Crea il tuo account"
      titleId="sign-up-title"
    >
      {step === "email" ? (
        <AuthStage>
          <form aria-busy={loading} className={styles.form} onSubmit={submitEmail}>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input autoComplete="email" autoFocus className="h-11 px-3" id="email" name="email" required type="email" />
              <FieldDescription>Usa l’indirizzo sul quale vuoi ricevere il codice di verifica.</FieldDescription>
            </Field>
            {error ? <Alert variant="destructive"><IconAlertCircle /><AlertDescription>{error}</AlertDescription></Alert> : null}
            <Button className="h-11 w-full active:scale-[0.985]" disabled={loading} type="submit">
              {loading ? <><Spinner /> Invio in corso</> : <>Invia codice <IconArrowRight data-icon="inline-end" /></>}
            </Button>
          </form>
        </AuthStage>
      ) : null}

      {step === "verify" ? (
        <AuthStage>
          <Badge className="w-fit max-w-full truncate font-normal" variant="secondary">{email}</Badge>
          {message ? <Alert role="status" variant="info"><AlertDescription>{message}</AlertDescription></Alert> : null}
          <form aria-busy={loading} className={styles.form} onSubmit={submitCode}>
            <Field>
              <FieldLabel htmlFor="code">Codice email</FieldLabel>
              <OtpInput autoFocus id="code" inputMode="numeric" name="code" required />
              <FieldDescription>Incolla o digita le sei cifre ricevute. Il codice ha durata limitata.</FieldDescription>
            </Field>
            {error ? <Alert variant="destructive"><IconAlertCircle /><AlertDescription>{error}</AlertDescription></Alert> : null}
            <div className={styles.formActions}>
              <Button className="h-11 active:scale-[0.985]" disabled={loading} type="submit">
                {loading ? <><Spinner /> Verifica in corso</> : <>Verifica email <IconArrowRight data-icon="inline-end" /></>}
              </Button>
              <Button disabled={loading} onClick={resendCode} type="button" variant="outline"><IconRefresh /> Reinvia codice</Button>
              <Button disabled={loading} onClick={restart} type="button" variant="ghost"><IconArrowLeft /> Usa un’altra email</Button>
            </div>
          </form>
        </AuthStage>
      ) : null}

      {step === "details" ? (
        <AuthStage>
          {message ? <Alert role="status" variant="success"><IconCircleCheck /><AlertDescription>{message}</AlertDescription></Alert> : null}
          <form aria-busy={loading} className={styles.form} onSubmit={submitDetails}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  autoComplete="username"
                  autoFocus
                  className="h-11 px-3"
                  id="username"
                  maxLength={32}
                  minLength={3}
                  name="username"
                  pattern="[a-z0-9](?:[a-z0-9_]{1,30}[a-z0-9])"
                  required
                  spellCheck={false}
                  type="text"
                />
                <FieldDescription>3–32 caratteri: lettere minuscole, numeri e underscore.</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <PasswordInput
                  autoComplete="new-password"
                  id="password"
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
            </FieldGroup>
            {error ? <Alert variant="destructive"><IconAlertCircle /><AlertDescription>{error}</AlertDescription></Alert> : null}
            <Button className="h-11 w-full active:scale-[0.985]" disabled={loading} type="submit">
              {loading ? <><Spinner /> Creazione in corso</> : <>Crea account <IconArrowRight data-icon="inline-end" /></>}
            </Button>
          </form>
        </AuthStage>
      ) : null}
    </AuthPageShell>
  );
}
