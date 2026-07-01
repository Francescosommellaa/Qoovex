"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formValue, nullableFormValue, submitJson } from "../admin-api-client";
import styles from "../AdminCore.module.css";
import type { WorkspaceEvidenceRecord } from "@/views/workspace/workspace-records";

export function EvidenceUpdateForm({ evidence, disabled }: { evidence: WorkspaceEvidenceRecord; disabled?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    try {
      await submitJson(`/api/evidence/${evidence.id}`, "PATCH", {
        title: formValue(formData, "title"),
        description: nullableFormValue(formData, "description"),
      });
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Aggiornamento non riuscito.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {error ? <p className={styles.formError}>{error}</p> : null}
      <label className={styles.field}>
        <span>Titolo prova</span>
        <input defaultValue={evidence.title} disabled={disabled || pending} maxLength={160} minLength={2} name="title" required />
      </label>
      <label className={styles.field}>
        <span>Descrizione</span>
        <textarea defaultValue={evidence.description ?? ""} disabled={disabled || pending} maxLength={4000} name="description" />
      </label>
      <button className={styles.button} disabled={disabled || pending} type="submit">
        {pending ? "Salvataggio..." : "Aggiorna prova"}
      </button>
    </form>
  );
}
