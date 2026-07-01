"use client";

import { deadlineStatuses, deadlineSourceTypes } from "@qoovex/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formValue, nullableFormValue, submitJson } from "../admin-api-client";
import styles from "../AdminCore.module.css";
import { deadlineStatusLabels, formatDateInput, formatDateTimeInput } from "@/views/workspace/workspace-format";
import type { WorkspaceDeadlineRecord, WorkspaceDocumentRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";

export function DeadlineForm({
  mode,
  deadline,
  documents,
  workers,
  jobSites,
  disabled,
}: {
  mode: "create" | "update";
  deadline?: WorkspaceDeadlineRecord;
  documents: WorkspaceDocumentRecord[];
  workers: WorkspaceWorkerRecord[];
  jobSites: WorkspaceJobSiteRecord[];
  disabled?: boolean;
}) {
  const router = useRouter();
  const [sourceType, setSourceType] = useState(deadline?.sourceType ?? "MANUAL");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const selectedSourceType = formValue(formData, "sourceType") ?? "MANUAL";
    const payload: Record<string, unknown> = {
      title: formValue(formData, "title"),
      dueDate: formValue(formData, "dueDate"),
      sourceType: selectedSourceType,
      documentId: selectedSourceType === "DOCUMENT" ? formValue(formData, "documentId") : null,
      workerId: nullableFormValue(formData, "workerId"),
      jobSiteId: nullableFormValue(formData, "jobSiteId"),
      status: formValue(formData, "status"),
      remindAt: nullableFormValue(formData, "remindAt"),
    };

    try {
      await submitJson(mode === "create" ? "/api/deadlines" : `/api/deadlines/${deadline?.id}`, mode === "create" ? "POST" : "PATCH", payload);
      router.refresh();
      if (mode === "create") event.currentTarget.reset();
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
          <span>Titolo scadenza</span>
          <input defaultValue={deadline?.title ?? ""} disabled={disabled || pending} name="title" required minLength={2} maxLength={160} />
        </label>
        <label className={styles.field}>
          <span>Data scadenza</span>
          <input defaultValue={formatDateInput(deadline?.dueDate)} disabled={disabled || pending} name="dueDate" required type="date" />
        </label>
        <label className={styles.field}>
          <span>Origine</span>
          <select defaultValue={sourceType} disabled={disabled || pending} name="sourceType" onChange={(event) => setSourceType(event.target.value as typeof sourceType)}>
            {deadlineSourceTypes.map((type) => (
              <option key={type} value={type}>{type === "DOCUMENT" ? "Documento" : type === "CHECKLIST" ? "Checklist" : type === "MANUAL" ? "Manuale" : "Altro"}</option>
            ))}
          </select>
        </label>
        {sourceType === "DOCUMENT" ? (
          <label className={styles.field}>
            <span>Documento collegato</span>
            <select defaultValue={deadline?.documentId ?? ""} disabled={disabled || pending} name="documentId" required>
              <option value="">Seleziona documento</option>
              {documents.map((document) => (
                <option key={document.id} value={document.id}>{document.title}</option>
              ))}
            </select>
          </label>
        ) : null}
        <label className={styles.field}>
          <span>Lavoratore collegato</span>
          <select defaultValue={deadline?.workerId ?? ""} disabled={disabled || pending} name="workerId">
            <option value="">Nessuno</option>
            {workers.map((worker) => (
              <option key={worker.id} value={worker.id}>{worker.displayName}</option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Cantiere collegato</span>
          <select defaultValue={deadline?.jobSiteId ?? ""} disabled={disabled || pending} name="jobSiteId">
            <option value="">Nessuno</option>
            {jobSites.map((jobSite) => (
              <option key={jobSite.id} value={jobSite.id}>{jobSite.name}</option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Stato</span>
          <select defaultValue={deadline?.status ?? "SCHEDULED"} disabled={disabled || pending} name="status">
            {deadlineStatuses.filter((status) => status !== "ARCHIVED").map((status) => (
              <option key={status} value={status}>{deadlineStatusLabels[status]}</option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Promemoria</span>
          <input defaultValue={formatDateTimeInput(deadline?.remindAt)} disabled={disabled || pending} name="remindAt" type="datetime-local" />
        </label>
      </div>
      <button className={styles.button} disabled={disabled || pending} type="submit">
        {pending ? "Salvataggio..." : mode === "create" ? "Aggiungi scadenza" : "Aggiorna scadenza"}
      </button>
    </form>
  );
}
