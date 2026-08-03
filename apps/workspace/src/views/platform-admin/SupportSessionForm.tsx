"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import styles from "./PlatformAdmin.module.css";

export function SupportSessionForm({ organizationCode }: { organizationCode: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const reason = String(new FormData(event.currentTarget).get("reason") ?? "");
    const response = await fetch("/api/support/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationCode, reason }),
    });
    const body = await response.json().catch(() => null) as { message?: string } | null;
    setLoading(false);
    if (!response.ok) {
      setError(body?.message ?? "Sessione supporto non disponibile.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.field}>
        <label htmlFor={`support-${organizationCode}`}>Motivo del supporto</label>
        <textarea id={`support-${organizationCode}`} minLength={8} maxLength={500} name="reason" required />
      </div>
      <button className={styles.button} disabled={loading} type="submit">{loading ? "Apertura in corso" : "Apri supporto"}</button>
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
    </form>
  );
}
