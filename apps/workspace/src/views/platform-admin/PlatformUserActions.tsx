"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import styles from "./PlatformAdmin.module.css";

export function PlatformUserActions({ userId, suspended, protectedAccount }: { userId: string; suspended: boolean; protectedAccount: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const action = submitter?.value ?? "";
    const reason = String(formData.get("reason") ?? "");
    setLoading(true);
    setError(null);
    setSuccess(null);
    const response = await fetch(`/api/platform-admin/users/${userId}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    const body = await response.json().catch(() => null) as { message?: string } | null;
    setLoading(false);
    if (!response.ok) {
      setError(body?.message ?? "Operazione non disponibile.");
      return;
    }
    form.reset();
    setSuccess("Operazione completata e registrata nell'audit.");
    router.refresh();
  }

  if (protectedAccount) return <p className={styles.notice}>Gli account Operatore Qoovex non possono essere modificati dalla console.</p>;
  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.field}>
        <label htmlFor={`reason-${userId}`}>Motivo operativo</label>
        <textarea id={`reason-${userId}`} minLength={8} maxLength={500} name="reason" required />
      </div>
      <div className={styles.actions}>
        <button className={suspended ? styles.button : styles.dangerButton} disabled={loading} name="action" type="submit" value={suspended ? "reactivate" : "suspend"}>
          {suspended ? "Riattiva account" : "Sospendi account"}
        </button>
        <button className={styles.ghostButton} disabled={loading || suspended} name="action" type="submit" value="revoke-sessions">Revoca sessioni</button>
      </div>
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      {success ? <p className={styles.success}>{success}</p> : null}
    </form>
  );
}
