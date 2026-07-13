"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import styles from "./AuthPages.module.css";

type Step = "email" | "verify" | "details";
const PENDING_SIGNUP_EMAIL_KEY = "qv-pending-signup-email";

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
    setMessage("Se l'indirizzo puo essere verificato, riceverai un codice. Controlla la tua email.");
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
    <main className={styles.authPage}>
      <section className={styles.authCard} aria-labelledby="sign-up-title">
        <p className={styles.brand}>Qoovex</p>
        <h1 id="sign-up-title">Crea account</h1>
        <p>Verifica prima la tua email. Username e password vengono salvati solo dopo la verifica.</p>

        {step === "email" ? (
          <form className={styles.form} onSubmit={submitEmail}>
            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input autoComplete="email" id="email" name="email" required type="email" />
            </div>
            {error ? <p className={styles.error} role="alert">{error}</p> : null}
            <button className={styles.primaryButton} disabled={loading} type="submit">
              {loading ? "Invio in corso" : "Invia codice"}
            </button>
          </form>
        ) : null}

        {step === "verify" ? (
          <form className={styles.form} onSubmit={submitCode}>
            <p className={styles.success}>{email}</p>
            <div className={styles.field}>
              <label htmlFor="code">Codice email</label>
              <input autoComplete="one-time-code" id="code" inputMode="numeric" name="code" required type="text" />
            </div>
            {message ? <p className={styles.success} role="status">{message}</p> : null}
            {error ? <p className={styles.error} role="alert">{error}</p> : null}
            <button className={styles.primaryButton} disabled={loading} type="submit">
              {loading ? "Verifica in corso" : "Verifica email"}
            </button>
            <button className={styles.secondaryButton} disabled={loading} onClick={resendCode} type="button">
              Reinvia codice
            </button>
            <button className={styles.textButton} disabled={loading} onClick={restart} type="button">
              Usa un'altra email
            </button>
          </form>
        ) : null}

        {step === "details" ? (
          <form className={styles.form} onSubmit={submitDetails}>
            {message ? <p className={styles.success} role="status">{message}</p> : null}
            <div className={styles.field}>
              <label htmlFor="username">Username</label>
              <input autoComplete="username" id="username" name="username" required type="text" />
            </div>
            <div className={styles.field}>
              <label htmlFor="password">Password</label>
              <input autoComplete="new-password" id="password" name="password" required type="password" />
            </div>
            {error ? <p className={styles.error} role="alert">{error}</p> : null}
            <button className={styles.primaryButton} disabled={loading} type="submit">
              {loading ? "Creazione in corso" : "Crea account"}
            </button>
          </form>
        ) : null}

        <p className={styles.hint}>
          Hai gia un account? <Link className={styles.textLink} href={signInHref(callbackUrl)}>Accedi</Link>
        </p>
      </section>
    </main>
  );
}
