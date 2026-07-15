"use client";

import { recordStatuses } from "@qoovex/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formValue, nullableFormValue, submitJson } from "../admin-api-client";
import styles from "../AdminCore.module.css";
import { recordStatusLabels } from "@/views/workspace/workspace-format";
import type { WorkspaceChecklistRecord, WorkspaceJobSiteRecord } from "@/views/workspace/workspace-records";

interface ChecklistFormProps {
  mode: "create" | "update";
  checklist?: WorkspaceChecklistRecord;
  jobSites: WorkspaceJobSiteRecord[];
  disabled?: boolean;
  initialJobSiteId?: string;
}

export function ChecklistForm({ mode, checklist, jobSites, disabled, initialJobSiteId }: ChecklistFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formValue(formData, "name"),
      description: nullableFormValue(formData, "description"),
      jobSiteId: nullableFormValue(formData, "jobSiteId"),
      status: formValue(formData, "status") ?? "ACTIVE",
    };

    try {
      const response = await submitJson<WorkspaceChecklistRecord>(mode === "create" ? "/api/checklists" : `/api/checklists/${checklist?.id}`, mode === "create" ? "POST" : "PATCH", payload);
      router.refresh();
      if (mode === "create") router.push(`/checklists/${response.id}`);
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
          <span>Nome checklist</span>
          <input defaultValue={checklist?.name ?? ""} disabled={disabled || pending} maxLength={160} minLength={2} name="name" required />
        </label>
        <label className={styles.field}>
          <span>Cantiere collegato</span>
          {initialJobSiteId ? <input name="jobSiteId" type="hidden" value={initialJobSiteId} /> : null}
          <select defaultValue={checklist?.jobSiteId ?? initialJobSiteId ?? ""} disabled={disabled || pending || Boolean(initialJobSiteId)} name={initialJobSiteId ? undefined : "jobSiteId"}>
            <option value="">Nessun cantiere</option>
            {jobSites.map((jobSite) => (
              <option key={jobSite.id} value={jobSite.id}>{jobSite.name}</option>
            ))}
          </select>
        </label>
        {mode === "update" ? <label className={styles.field}>
          <span>Stato</span>
          <select defaultValue={checklist?.status ?? "ACTIVE"} disabled={disabled || pending} name="status">
            {recordStatuses.filter((status) => status !== "ARCHIVED").map((status) => (
              <option key={status} value={status}>{recordStatusLabels[status]}</option>
            ))}
          </select>
        </label> : null}
      </div>
      <label className={styles.field}>
        <span>Descrizione</span>
        <textarea defaultValue={checklist?.description ?? ""} disabled={disabled || pending} maxLength={4000} name="description" />
      </label>
      <button className={styles.button} disabled={disabled || pending} type="submit">
        {pending ? "Salvataggio..." : mode === "create" ? "Crea checklist" : "Aggiorna checklist"}
      </button>
    </form>
  );
}
