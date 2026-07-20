"use client";

import { deadlineStatuses, deadlineSourceTypes } from "@qoovex/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formValue, nullableFormValue, submitJson } from "../admin-api-client";
import styles from "../AdminCore.module.css";
import { deadlineStatusLabels, formatDateInput, formatDateTimeInput } from "@/views/workspace/workspace-format";
import type { WorkspaceDeadlineRecord, WorkspaceDocumentRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";
import type { WorkspaceCreationContext, WorkspaceOrigin } from "@/views/workspace/workspace-flow-context";

export function DeadlineForm({
  mode,
  deadline,
  documents,
  workers,
  jobSites,
  disabled,
  initialContext = null,
  origin = null,
}: {
  mode: "create" | "update";
  deadline?: WorkspaceDeadlineRecord;
  documents: WorkspaceDocumentRecord[];
  workers: WorkspaceWorkerRecord[];
  jobSites: WorkspaceJobSiteRecord[];
  disabled?: boolean;
  initialContext?: WorkspaceCreationContext | null;
  origin?: WorkspaceOrigin | null;
}) {
  const router = useRouter();
  const [sourceType, setSourceType] = useState(deadline?.sourceType ?? "MANUAL");
  const initialRelation = initialContext?.type === "document" ? "document" : initialContext?.type === "worker" ? "worker" : initialContext?.type === "job-site" ? "job-site" : deadline?.documentId ? "document" : deadline?.workerId ? "worker" : deadline?.jobSiteId ? "job-site" : "none";
  const [relation, setRelation] = useState<"none" | "document" | "worker" | "job-site">(initialRelation);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const selectedSourceType = relation === "document" ? "DOCUMENT" : mode === "update" ? formValue(formData, "sourceType") ?? "MANUAL" : "MANUAL";
    const payload: Record<string, unknown> = {
      title: formValue(formData, "title"),
      dueDate: formValue(formData, "dueDate"),
      sourceType: selectedSourceType,
      documentId: relation === "document" ? formValue(formData, "documentId") : null,
      workerId: relation === "worker" ? nullableFormValue(formData, "workerId") : null,
      jobSiteId: relation === "job-site" ? nullableFormValue(formData, "jobSiteId") : null,
      status: mode === "update" ? formValue(formData, "status") : undefined,
      remindAt: nullableFormValue(formData, "remindAt"),
    };

    try {
      const response = await submitJson<WorkspaceDeadlineRecord>(mode === "create" ? "/api/deadlines" : `/api/deadlines/${deadline?.id}`, mode === "create" ? "POST" : "PATCH", payload);
      if (mode === "create") {
        if (origin === "dashboard") router.push(`/dashboard?updated=${response.id}`);
        else if (initialContext?.type === "job-site") router.push(`/job-sites/${initialContext.id}`);
        else if (initialContext?.type === "worker") router.push(`/workers/${initialContext.id}`);
        else if (initialContext?.type === "document") router.push(`/documents/${initialContext.id}`);
        else router.push(`/deadlines?updated=${response.id}`);
      } else {
        router.push(`/deadlines?updated=${response.id}`);
      }
      router.refresh();
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
        {mode === "update" ? <label className={styles.field}>
          <span>Origine</span>
          <select defaultValue={sourceType} disabled={disabled || pending} name="sourceType" onChange={(event) => setSourceType(event.target.value as typeof sourceType)}>
            {deadlineSourceTypes.map((type) => (
              <option key={type} value={type}>{type === "DOCUMENT" ? "Documento" : type === "CHECKLIST" ? "Checklist" : type === "MANUAL" ? "Manuale" : "Altro"}</option>
            ))}
          </select>
        </label> : null}
        {mode === "create" ? <label className={styles.field}><span>Collegato a</span><select disabled={Boolean(initialContext)} onChange={(event) => setRelation(event.target.value as typeof relation)} value={relation}><option value="none">Nessun collegamento</option><option value="document">Documento</option><option value="worker">Lavoratore</option><option value="job-site">Cantiere</option></select></label> : null}
        {relation === "document" ? (
          <label className={styles.field}>
            <span>Documento collegato</span>
            {initialContext?.type === "document" ? <input name="documentId" type="hidden" value={initialContext.id} /> : null}
            <select defaultValue={deadline?.documentId ?? (initialContext?.type === "document" ? initialContext.id : "")} disabled={disabled || pending || initialContext?.type === "document"} name={initialContext?.type === "document" ? undefined : "documentId"} required>
              <option value="">Seleziona documento</option>
              {documents.map((document) => (
                <option key={document.id} value={document.id}>{document.title}</option>
              ))}
            </select>
          </label>
        ) : null}
        {relation === "worker" ? <label className={styles.field}>
          <span>Lavoratore collegato</span>
          {initialContext?.type === "worker" ? <input name="workerId" type="hidden" value={initialContext.id} /> : null}
          <select defaultValue={deadline?.workerId ?? (initialContext?.type === "worker" ? initialContext.id : "")} disabled={disabled || pending || initialContext?.type === "worker"} name={initialContext?.type === "worker" ? undefined : "workerId"} required>
            <option value="">Nessuno</option>
            {workers.map((worker) => (
              <option key={worker.id} value={worker.id}>{worker.displayName}</option>
            ))}
          </select>
        </label> : null}
        {relation === "job-site" ? <label className={styles.field}>
          <span>Cantiere collegato</span>
          {initialContext?.type === "job-site" ? <input name="jobSiteId" type="hidden" value={initialContext.id} /> : null}
          <select defaultValue={deadline?.jobSiteId ?? (initialContext?.type === "job-site" ? initialContext.id : "")} disabled={disabled || pending || initialContext?.type === "job-site"} name={initialContext?.type === "job-site" ? undefined : "jobSiteId"} required>
            <option value="">Nessuno</option>
            {jobSites.map((jobSite) => (
              <option key={jobSite.id} value={jobSite.id}>{jobSite.name}</option>
            ))}
          </select>
        </label> : null}
        {mode === "update" ? <label className={styles.field}>
          <span>Stato</span>
          <select defaultValue={deadline?.status ?? "SCHEDULED"} disabled={disabled || pending} name="status">
            {deadlineStatuses.filter((status) => status !== "ARCHIVED").map((status) => (
              <option key={status} value={status}>{deadlineStatusLabels[status]}</option>
            ))}
          </select>
        </label> : null}
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
