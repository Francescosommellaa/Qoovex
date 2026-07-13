"use client";

import type { EvidenceType } from "@qoovex/types";
import { evidenceTypes } from "@qoovex/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formValue, nullableFormValue, submitFormData, submitJson } from "../admin-api-client";
import styles from "../AdminCore.module.css";
import { evidenceTypeLabels } from "@/views/workspace/workspace-format";
import type { WorkspaceChecklistItemRecord, WorkspaceChecklistRecord, WorkspaceEvidenceRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";

interface EvidenceFormProps {
  jobSites: WorkspaceJobSiteRecord[];
  workers: WorkspaceWorkerRecord[];
  checklistItems: WorkspaceChecklistItemRecord[];
  checklists: WorkspaceChecklistRecord[];
  disabled?: boolean;
}

function checklistItemLabel(item: WorkspaceChecklistItemRecord, checklists: WorkspaceChecklistRecord[]) {
  const checklist = checklists.find((candidate) => candidate.id === item.checklistId);
  return `${checklist?.name ?? "Checklist"} - ${item.label}`;
}

export function EvidenceForm({ jobSites, workers, checklistItems, checklists, disabled }: EvidenceFormProps) {
  const router = useRouter();
  const [type, setType] = useState<EvidenceType>("NOTE");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const selectedType = (formValue(formData, "type") ?? "NOTE") as EvidenceType;

    try {
      if (selectedType === "NOTE") {
        const payload = {
          type: selectedType,
          title: formValue(formData, "title"),
          description: nullableFormValue(formData, "description"),
          jobSiteId: nullableFormValue(formData, "jobSiteId"),
          workerId: nullableFormValue(formData, "workerId"),
          checklistItemId: nullableFormValue(formData, "checklistItemId"),
        };
        await submitJson<{ evidence: WorkspaceEvidenceRecord }>("/api/evidence", "POST", payload);
      } else {
        await submitFormData<{ evidence: WorkspaceEvidenceRecord }>("/api/evidence", formData);
      }
      router.refresh();
      event.currentTarget.reset();
      setType("NOTE");
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
          <span>Tipo prova</span>
          <select disabled={disabled || pending} name="type" onChange={(event) => setType(event.target.value as EvidenceType)} value={type}>
            {evidenceTypes.map((evidenceType) => (
              <option key={evidenceType} value={evidenceType}>{evidenceTypeLabels[evidenceType]}</option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Titolo prova</span>
          <input disabled={disabled || pending} maxLength={160} minLength={2} name="title" required />
        </label>
        <label className={styles.field}>
          <span>Cantiere</span>
          <select disabled={disabled || pending} name="jobSiteId">
            <option value="">Nessun cantiere</option>
            {jobSites.map((jobSite) => (
              <option key={jobSite.id} value={jobSite.id}>{jobSite.name}</option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Lavoratore</span>
          <select disabled={disabled || pending} name="workerId">
            <option value="">Nessun lavoratore</option>
            {workers.map((worker) => (
              <option key={worker.id} value={worker.id}>{worker.displayName}</option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Voce checklist</span>
          <select disabled={disabled || pending} name="checklistItemId">
            <option value="">Nessuna voce</option>
            {checklistItems.map((item) => (
              <option key={item.id} value={item.id}>{checklistItemLabel(item, checklists)}</option>
            ))}
          </select>
        </label>
        {type !== "NOTE" ? (
          <label className={styles.field}>
            <span>File prova</span>
            <input accept={type === "PHOTO" ? "image/jpeg,image/png,image/webp" : "application/pdf,image/jpeg,image/png,image/webp"} disabled={disabled || pending} name="file" required type="file" />
            <small className="qv-text-muted">Limite 4 MB. Foto: JPEG, PNG, WebP. File: PDF o immagini.</small>
          </label>
        ) : null}
      </div>
      <label className={styles.field}>
        <span>Descrizione</span>
        <textarea disabled={disabled || pending} maxLength={4000} name="description" />
      </label>
      <button className={styles.button} disabled={disabled || pending} type="submit">
        {pending ? "Salvataggio..." : type === "NOTE" ? "Aggiungi nota operativa" : "Aggiungi prova"}
      </button>
    </form>
  );
}
