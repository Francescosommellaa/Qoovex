"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getGenericAuthFailureMessage } from "@shared/lib/auth-error";
import styles from "./AuthPages.module.css";

export function SignInPageView({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <main className={styles.authPage}>
      <section className={styles.authCard} aria-labelledby="sign-in-title">
        <p className={styles.brand}>Qoovex</p>
        <h1 id="sign-in-title">Accedi</h1>
        <p>Organizza documenti, scadenze e prove di cantiere nel tuo workspace.</p>

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
          Non hai un account? <Link className={styles.textLink} href={`/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`}>Crea account</Link>
        </p>
      </section>
    </main>
  );
}
