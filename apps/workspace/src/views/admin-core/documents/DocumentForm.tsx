"use client";

import type { DocumentStatus } from "@qoovex/types";
import { documentStatuses } from "@qoovex/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formValue, nullableFormValue, submitJson } from "../admin-api-client";
import styles from "../AdminCore.module.css";
import { documentStatusLabels, formatDateInput } from "@/views/workspace/workspace-format";
import type { WorkspaceDocumentRecord, WorkspaceDocumentTypeRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";

interface DocumentFormProps {
  mode: "create" | "update";
  document?: WorkspaceDocumentRecord;
  documentTypes: WorkspaceDocumentTypeRecord[];
  workers: WorkspaceWorkerRecord[];
  jobSites: WorkspaceJobSiteRecord[];
  disabled?: boolean;
}

export function DocumentForm({ mode, document, documentTypes, workers, jobSites, disabled }: DocumentFormProps) {
  const router = useRouter();
  const [ownerType, setOwnerType] = useState(document?.ownerType ?? "ORGANIZATION");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const selectedOwnerType = formValue(formData, "ownerType") ?? "ORGANIZATION";
    const payload: Record<string, unknown> = {
      title: formValue(formData, "title"),
      documentTypeId: nullableFormValue(formData, "documentTypeId"),
      ownerType: selectedOwnerType,
      status: formValue(formData, "status"),
      expiryDate: nullableFormValue(formData, "expiryDate"),
      notes: nullableFormValue(formData, "notes"),
    };
    if (selectedOwnerType === "WORKER") payload.workerId = formValue(formData, "workerId");
    if (selectedOwnerType === "JOB_SITE") payload.jobSiteId = formValue(formData, "jobSiteId");

    try {
      const response = await submitJson<WorkspaceDocumentRecord>(mode === "create" ? "/api/documents" : `/api/documents/${document?.id}`, mode === "create" ? "POST" : "PATCH", payload);
      router.refresh();
      if (mode === "create") router.push(`/documents/${response.id}`);
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
          <span>Titolo documento</span>
          <input defaultValue={document?.title ?? ""} disabled={disabled || pending} name="title" required minLength={2} maxLength={160} />
        </label>
        <label className={styles.field}>
          <span>Tipo documento configurato</span>
          <select defaultValue={document?.documentTypeId ?? ""} disabled={disabled || pending} name="documentTypeId">
            <option value="">Senza tipo</option>
            {documentTypes.map((documentType) => (
              <option key={documentType.id} value={documentType.id}>{documentType.name}</option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Collegato a</span>
          <select defaultValue={ownerType} disabled={disabled || pending} name="ownerType" onChange={(event) => setOwnerType(event.target.value as typeof ownerType)}>
            <option value="ORGANIZATION">Azienda</option>
            <option value="WORKER">Lavoratore</option>
            <option value="JOB_SITE">Cantiere</option>
          </select>
        </label>
        {ownerType === "WORKER" ? (
          <label className={styles.field}>
            <span>Lavoratore</span>
            <select defaultValue={document?.workerId ?? ""} disabled={disabled || pending} name="workerId" required>
              <option value="">Seleziona lavoratore</option>
              {workers.map((worker) => (
                <option key={worker.id} value={worker.id}>{worker.displayName}</option>
              ))}
            </select>
          </label>
        ) : null}
        {ownerType === "JOB_SITE" ? (
          <label className={styles.field}>
            <span>Cantiere</span>
            <select defaultValue={document?.jobSiteId ?? ""} disabled={disabled || pending} name="jobSiteId" required>
              <option value="">Seleziona cantiere</option>
              {jobSites.map((jobSite) => (
                <option key={jobSite.id} value={jobSite.id}>{jobSite.name}</option>
              ))}
            </select>
          </label>
        ) : null}
        {mode === "update" ? <label className={styles.field}>
          <span>Stato documentale</span>
          <select defaultValue={document?.status ?? "TO_REVIEW"} disabled={disabled || pending} name="status">
            {documentStatuses.filter((status): status is Exclude<DocumentStatus, "ARCHIVED"> => status !== "ARCHIVED").map((status) => (
              <option key={status} value={status}>{documentStatusLabels[status]}</option>
            ))}
          </select>
        </label> : null}
        <label className={styles.field}>
          <span>Scadenza registrata</span>
          <input defaultValue={formatDateInput(document?.expiryDate)} disabled={disabled || pending} name="expiryDate" type="date" />
        </label>
      </div>
      <label className={styles.field}>
        <span>Note operative</span>
        <textarea defaultValue={document?.notes ?? ""} disabled={disabled || pending} name="notes" maxLength={4000} />
      </label>
      <button className={styles.button} disabled={disabled || pending} type="submit">
        {pending ? "Salvataggio..." : mode === "create" ? "Aggiungi documento" : "Aggiorna documento"}
      </button>
    </form>
  );
}
