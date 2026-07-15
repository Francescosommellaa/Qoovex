"use client";

import type { DocumentPackageStatus } from "@qoovex/types";
import { documentPackageStatuses } from "@qoovex/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formValue, nullableFormValue, submitJson } from "../admin-api-client";
import styles from "../AdminCore.module.css";
import { documentPackageStatusLabels } from "@/views/workspace/workspace-format";
import type { WorkspaceDocumentPackageRecord, WorkspaceJobSiteRecord } from "@/views/workspace/workspace-records";

interface DocumentPackageFormProps {
  mode: "create" | "update";
  documentPackage?: WorkspaceDocumentPackageRecord;
  jobSites: WorkspaceJobSiteRecord[];
  disabled?: boolean;
  initialJobSiteId?: string;
}

export function DocumentPackageForm({ mode, documentPackage, jobSites, disabled, initialJobSiteId }: DocumentPackageFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const payload = {
      title: formValue(formData, "title"),
      description: nullableFormValue(formData, "description"),
      jobSiteId: nullableFormValue(formData, "jobSiteId"),
      status: formValue(formData, "status") ?? "DRAFT",
    };

    try {
      const response = await submitJson<WorkspaceDocumentPackageRecord>(mode === "create" ? "/api/document-packages" : `/api/document-packages/${documentPackage?.id}`, mode === "create" ? "POST" : "PATCH", payload);
      router.refresh();
      if (mode === "create") router.push(`/document-packages/${response.id}?result=share-created`);
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
          <span>Titolo condivisione</span>
          <input defaultValue={documentPackage?.title ?? ""} disabled={disabled || pending} maxLength={160} minLength={2} name="title" required />
        </label>
        <label className={styles.field}>
          <span>Cantiere collegato</span>
          {initialJobSiteId ? <input name="jobSiteId" type="hidden" value={initialJobSiteId} /> : null}
          <select defaultValue={documentPackage?.jobSiteId ?? initialJobSiteId ?? ""} disabled={disabled || pending || Boolean(initialJobSiteId)} name={initialJobSiteId ? undefined : "jobSiteId"}>
            <option value="">Nessun cantiere</option>
            {jobSites.map((jobSite) => (
              <option key={jobSite.id} value={jobSite.id}>{jobSite.name}</option>
            ))}
          </select>
        </label>
        {mode === "update" ? <label className={styles.field}>
          <span>Stato pacchetto</span>
          <select defaultValue={documentPackage?.status ?? "DRAFT"} disabled={disabled || pending} name="status">
            {documentPackageStatuses.filter((status): status is Exclude<DocumentPackageStatus, "ARCHIVED"> => status !== "ARCHIVED").map((status) => (
              <option key={status} value={status}>{documentPackageStatusLabels[status]}</option>
            ))}
          </select>
        </label> : null}
      </div>
      <label className={styles.field}>
        <span>Descrizione</span>
        <textarea defaultValue={documentPackage?.description ?? ""} disabled={disabled || pending} maxLength={4000} name="description" />
      </label>
      <button className={styles.button} disabled={disabled || pending} type="submit">
        {pending ? "Salvataggio..." : mode === "create" ? "Continua alla selezione" : "Aggiorna condivisione"}
      </button>
    </form>
  );
}
