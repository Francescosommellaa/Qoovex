"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import styles from "./PlatformAdmin.module.css";

export function RuntimeErrorAction({ errorId, status }: { errorId: string; status: "OPEN" | "RESOLVED" }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const reason = String(new FormData(event.currentTarget).get("reason") ?? "");
    const response = await fetch(`/api/platform-admin/errors/${errorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: status === "OPEN" ? "RESOLVED" : "OPEN", reason }),
    });
    const body = await response.json().catch(() => null) as { message?: string } | null;
    setLoading(false);
    if (!response.ok) {
      setError(body?.message ?? "Aggiornamento non disponibile.");
      return;
    }
    router.refresh();
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.field}>
        <label htmlFor={`error-reason-${errorId}`}>Motivo</label>
        <input id={`error-reason-${errorId}`} maxLength={500} minLength={8} name="reason" required />
      </div>
      <button className={status === "OPEN" ? styles.button : styles.ghostButton} disabled={loading} type="submit">
        {status === "OPEN" ? "Segna risolto" : "Riapri errore"}
      </button>
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
    </form>
  );
}
