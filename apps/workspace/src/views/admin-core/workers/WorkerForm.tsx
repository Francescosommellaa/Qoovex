"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formValue, nullableFormValue, submitJson } from "../admin-api-client";
import styles from "../AdminCore.module.css";
import type { WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";

export function WorkerForm({ mode, worker, disabled }: { mode: "create" | "update"; worker?: WorkspaceWorkerRecord; disabled?: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const payload = {
      displayName: formValue(formData, "displayName"),
      email: nullableFormValue(formData, "email"),
      phone: nullableFormValue(formData, "phone"),
      roleLabel: nullableFormValue(formData, "roleLabel"),
      notes: nullableFormValue(formData, "notes"),
    };
    try {
      const response = await submitJson<WorkspaceWorkerRecord>(mode === "create" ? "/api/workers" : `/api/workers/${worker?.id}`, mode === "create" ? "POST" : "PATCH", payload);
      router.refresh();
      if (mode === "create") router.push(`/workers/${response.id}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Operazione non riuscita.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {error ? <p className={styles.formError}>{error}</p> : null}
      <div className={styles.fieldGrid}>
        <label className={styles.field}>
          <span>Nome visualizzato</span>
          <input defaultValue={worker?.displayName ?? ""} disabled={disabled || pending} name="displayName" required minLength={2} maxLength={160} />
        </label>
        <label className={styles.field}>
          <span>Email opzionale</span>
          <input defaultValue={worker?.email ?? ""} disabled={disabled || pending} name="email" type="email" />
        </label>
        <label className={styles.field}>
          <span>Telefono opzionale</span>
          <input defaultValue={worker?.phone ?? ""} disabled={disabled || pending} name="phone" maxLength={80} />
        </label>
        <label className={styles.field}>
          <span>Ruolo operativo libero</span>
          <input defaultValue={worker?.roleLabel ?? ""} disabled={disabled || pending} name="roleLabel" maxLength={120} />
        </label>
      </div>
      <label className={styles.field}>
        <span>Note operative</span>
        <textarea defaultValue={worker?.notes ?? ""} disabled={disabled || pending} name="notes" maxLength={4000} />
      </label>
      <button className={styles.button} disabled={disabled || pending} type="submit">
        {pending ? "Salvataggio..." : mode === "create" ? "Aggiungi lavoratore" : "Aggiorna lavoratore"}
      </button>
    </form>
  );
}
