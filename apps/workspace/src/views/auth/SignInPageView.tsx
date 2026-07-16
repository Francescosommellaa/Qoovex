"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getGenericAuthFailureMessage } from "@shared/lib/auth-error";
import styles from "./AuthPages.module.css";

export function SignInPageView({
  callbackUrl,
  showDevAuth,
  statusMessage,
}: {
  callbackUrl: string;
  showDevAuth: boolean;
  statusMessage: string | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [devLoading, setDevLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const identifier = String(formData.get("identifier") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const result = await signIn("credentials", {
      identifier,
      password,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);
    if (result?.error) {
      setError(getGenericAuthFailureMessage());
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  async function signInAsDev() {
    setDevLoading(true);
    setError(null);
    const response = await fetch("/api/dev-auth", { method: "POST" });
    const body = await response.json().catch(() => null) as { error?: string } | null;
    if (!response.ok) {
      setDevLoading(false);
      setError(body?.error ?? "Accesso dev non disponibile.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className={styles.authPage}>
      <section className={styles.authCard} aria-labelledby="sign-in-title">
        <p className={styles.brand}>Qoovex</p>
        <h1 id="sign-in-title">Accedi</h1>
        <p>Organizza documenti, scadenze e prove di cantiere nel tuo workspace.</p>
        {statusMessage ? <p className={styles.success} role="status">{statusMessage}</p> : null}

        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.field}>
            <label htmlFor="identifier">Email o username</label>
            <input autoComplete="username" id="identifier" name="identifier" required type="text" />
          </div>
          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <input autoComplete="current-password" id="password" name="password" required type="password" />
          </div>
          {error ? <p className={styles.error} role="alert">{error}</p> : null}
          <button className={styles.primaryButton} disabled={loading} type="submit">
            {loading ? "Accesso in corso" : "Accedi"}
          </button>
        </form>

        <p className={styles.hint}>
          <Link className={styles.textLink} data-link="inline" href={`/reset-password?callbackUrl=${encodeURIComponent(callbackUrl)}`}>Password dimenticata?</Link>
          {" · "}
          <Link className={styles.textLink} data-link="inline" href={`/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`}>Verifica o reinvia il codice email</Link>
        </p>

        {showDevAuth ? <button className={styles.secondaryButton} disabled={devLoading || loading} onClick={signInAsDev} type="button">{devLoading ? "Accesso dev in corso" : "Accedi come dev"}</button> : null}

        <p className={styles.hint}>
          Non hai un account? <Link className={styles.textLink} data-link="inline" href={`/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`}>Crea account</Link>
        </p>
      </section>
    </main>
  );
}
