"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import styles from "./AuthPages.module.css";

type Step = "details" | "verify";

async function postJson(path: string, payload: Record<string, unknown>) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof body.message === "string" ? body.message : "Operazione non riuscita.");
  return body;
}

export function SignUpPageView({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submitDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const submittedEmail = String(formData.get("email") ?? "").trim();
    const submittedUsername = String(formData.get("username") ?? "").trim();
    const submittedPassword = String(formData.get("password") ?? "");
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await postJson("/api/auth/credentials/sign-up", { email: submittedEmail, username: submittedUsername, password: submittedPassword });
      setEmail(submittedEmail);
      setPassword(submittedPassword);
      setStep("verify");
      setMessage("Codice inviato. Controlla la tua email e completa la verifica.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Registrazione non riuscita.");
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
      await postJson("/api/auth/credentials/verify-email", { email, code });
      const result = await signIn("credentials", { identifier: email, password, redirect: false, callbackUrl });
      if (result?.error) throw new Error("Account verificato. Accedi con le credenziali appena create.");
      router.push(callbackUrl);
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Verifica non riuscita.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.authPage}>
      <section className={styles.authCard} aria-labelledby="sign-up-title">
        <p className={styles.brand}>Qoovex</p>
        <h1 id="sign-up-title">Crea account</h1>
        <p>Entra nel workspace per organizzare documenti, scadenze e prove di cantiere.</p>

        {step === "details" ? (
          <form className={styles.form} onSubmit={submitDetails}>
            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input autoComplete="email" id="email" name="email" required type="email" />
            </div>
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
        ) : (
          <form className={styles.form} onSubmit={submitCode}>
            <div className={styles.field}>
              <label htmlFor="code">Codice email</label>
              <input autoComplete="one-time-code" id="code" inputMode="numeric" name="code" required type="text" />
            </div>
            {message ? <p className={styles.success}>{message}</p> : null}
            {error ? <p className={styles.error} role="alert">{error}</p> : null}
            <button className={styles.primaryButton} disabled={loading} type="submit">
              {loading ? "Verifica in corso" : "Completa verifica"}
            </button>
          </form>
        )}

        <p className={styles.hint}>
          Hai gia un account? <Link className={styles.textLink} href={`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`}>Accedi</Link>
        </p>
      </section>
    </main>
  );
}
