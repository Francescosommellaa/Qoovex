"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formValue, nullableFormValue, submitJson } from "../admin-api-client";
import styles from "../AdminCore.module.css";
import { formatDateInput } from "@/views/workspace/workspace-format";
import type { WorkspaceJobSiteRecord } from "@/views/workspace/workspace-records";

export function JobSiteForm({ mode, jobSite, disabled }: { mode: "create" | "update"; jobSite?: WorkspaceJobSiteRecord; disabled?: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formValue(formData, "name"),
      address: nullableFormValue(formData, "address"),
      clientName: nullableFormValue(formData, "clientName"),
      startDate: nullableFormValue(formData, "startDate"),
      endDate: nullableFormValue(formData, "endDate"),
      notes: nullableFormValue(formData, "notes"),
    };
    try {
      const response = await submitJson<WorkspaceJobSiteRecord>(mode === "create" ? "/api/job-sites" : `/api/job-sites/${jobSite?.id}`, mode === "create" ? "POST" : "PATCH", payload);
      router.refresh();
      if (mode === "create") router.push(`/job-sites/${response.id}`);
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
          <span>Nome cantiere</span>
          <input defaultValue={jobSite?.name ?? ""} disabled={disabled || pending} name="name" required minLength={2} maxLength={160} />
        </label>
        <label className={styles.field}>
          <span>Committente opzionale</span>
          <input defaultValue={jobSite?.clientName ?? ""} disabled={disabled || pending} name="clientName" maxLength={160} />
        </label>
        <label className={styles.field}>
          <span>Indirizzo opzionale</span>
          <input defaultValue={jobSite?.address ?? ""} disabled={disabled || pending} name="address" maxLength={500} />
        </label>
        <label className={styles.field}>
          <span>Data inizio</span>
          <input defaultValue={formatDateInput(jobSite?.startDate)} disabled={disabled || pending} name="startDate" type="date" />
        </label>
        <label className={styles.field}>
          <span>Data fine</span>
          <input defaultValue={formatDateInput(jobSite?.endDate)} disabled={disabled || pending} name="endDate" type="date" />
        </label>
      </div>
      <label className={styles.field}>
        <span>Note operative</span>
        <textarea defaultValue={jobSite?.notes ?? ""} disabled={disabled || pending} name="notes" maxLength={4000} />
      </label>
      <button className={styles.button} disabled={disabled || pending} type="submit">
        {pending ? "Salvataggio..." : mode === "create" ? "Aggiungi cantiere" : "Aggiorna cantiere"}
      </button>
    </form>
  );
}
