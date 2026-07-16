"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
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
    <main className={styles.authPage}>
      <section className={styles.authCard} aria-labelledby="reset-password-title">
        <p className={styles.brand}>Qoovex</p>
        <h1 id="reset-password-title">Recupera password</h1>
        <p>Richiedi un codice email e imposta una nuova password.</p>

        {!codeRequested ? (
          <form className={styles.form} onSubmit={submitRequest}>
            <div className={styles.field}>
              <label htmlFor="reset-email">Email</label>
              <input autoComplete="email" id="reset-email" name="email" required type="email" />
            </div>
            {error ? <p className={styles.error} role="alert">{error}</p> : null}
            <button className={styles.primaryButton} disabled={loading} type="submit">
              {loading ? "Invio in corso" : "Invia codice di reset"}
            </button>
          </form>
        ) : (
          <form className={styles.form} onSubmit={submitReset}>
            <p className={styles.success}>{email}</p>
            {message ? <p className={styles.success} role="status">{message}</p> : null}
            <div className={styles.field}>
              <label htmlFor="reset-code">Codice email</label>
              <input autoComplete="one-time-code" id="reset-code" inputMode="numeric" name="code" required type="text" />
            </div>
            <div className={styles.field}>
              <label htmlFor="new-password">Nuova password</label>
              <input autoComplete="new-password" id="new-password" name="password" required type="password" />
            </div>
            <div className={styles.field}>
              <label htmlFor="new-password-confirmation">Conferma nuova password</label>
              <input autoComplete="new-password" id="new-password-confirmation" name="passwordConfirmation" required type="password" />
            </div>
            {error ? <p className={styles.error} role="alert">{error}</p> : null}
            <button className={styles.primaryButton} disabled={loading} type="submit">
              {loading ? "Aggiornamento in corso" : "Aggiorna password"}
            </button>
            <button className={styles.secondaryButton} disabled={loading} onClick={resendCode} type="button">
              Reinvia codice
            </button>
            <button className={styles.textButton} disabled={loading} onClick={restart} type="button">
              Usa un'altra email
            </button>
          </form>
        )}

        <p className={styles.hint}>
          <Link className={styles.textLink} data-link="inline" href={`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`}>Torna all'accesso</Link>
        </p>
      </section>
    </main>
  );
}
