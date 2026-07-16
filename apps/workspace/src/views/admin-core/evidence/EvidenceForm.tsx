"use client";

import type { EvidenceType } from "@qoovex/types";
import { evidenceTypes } from "@qoovex/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formValue, nullableFormValue, submitFormData, submitJson } from "../admin-api-client";
import styles from "../AdminCore.module.css";
import { evidenceTypeLabels } from "@/views/workspace/workspace-format";
import type { WorkspaceChecklistItemRecord, WorkspaceChecklistRecord, WorkspaceEvidenceRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";
import type { WorkspaceCreationContext, WorkspaceOrigin } from "@/views/workspace/workspace-flow-context";

interface EvidenceFormProps {
  jobSites: WorkspaceJobSiteRecord[];
  workers: WorkspaceWorkerRecord[];
  checklistItems: WorkspaceChecklistItemRecord[];
  checklists: WorkspaceChecklistRecord[];
  disabled?: boolean;
  initialContext?: WorkspaceCreationContext | null;
  origin?: WorkspaceOrigin | null;
}

function checklistItemLabel(item: WorkspaceChecklistItemRecord, checklists: WorkspaceChecklistRecord[]) {
  const checklist = checklists.find((candidate) => candidate.id === item.checklistId);
  return `${checklist?.name ?? "Checklist"} - ${item.label}`;
}

export function EvidenceForm({ jobSites, workers, checklistItems, checklists, disabled, initialContext = null, origin = null }: EvidenceFormProps) {
  const router = useRouter();
  const [type, setType] = useState<EvidenceType>("NOTE");
  const availableContextTypes = [jobSites.length ? "job-site" : null, workers.length ? "worker" : null, checklistItems.length ? "checklist-item" : null].filter((value): value is "job-site" | "worker" | "checklist-item" => Boolean(value));
  const initialContextType = initialContext?.type === "job-site" || initialContext?.type === "worker" || initialContext?.type === "checklist-item" ? initialContext.type : availableContextTypes[0] ?? "job-site";
  const [contextType, setContextType] = useState<"job-site" | "worker" | "checklist-item">(initialContextType);
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
        const response = await submitJson<{ evidence: WorkspaceEvidenceRecord }>("/api/evidence", "POST", payload);
        finish(response.evidence.id);
      } else {
        const response = await submitFormData<{ evidence: WorkspaceEvidenceRecord }>("/api/evidence", formData);
        finish(response.evidence.id);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Operazione non riuscita.");
    } finally {
      setPending(false);
    }
  }

  function finish(evidenceId: string) {
    const result = "result=evidence-created";
    if (origin === "dashboard") router.push(`/dashboard?${result}&updated=${encodeURIComponent(evidenceId)}`);
    else if (initialContext?.type === "job-site") router.push(`/job-sites/${encodeURIComponent(initialContext.id)}?${result}`);
    else if (initialContext?.type === "worker") router.push(`/workers/${encodeURIComponent(initialContext.id)}?${result}`);
    else router.push(`/evidence?${result}`);
    router.refresh();
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {error ? <p className={styles.formError}>{error}</p> : null}
      {initialContext ? <p className={styles.formSuccess}>La prova sarà registrata nel contesto da cui sei partito.</p> : null}
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
        {!initialContext ? <label className={styles.field}><span>Registra per</span><select disabled={disabled || pending} onChange={(event) => setContextType(event.target.value as typeof contextType)} value={contextType}>{availableContextTypes.map((value) => <option key={value} value={value}>{value === "job-site" ? "Cantiere" : value === "worker" ? "Lavoratore" : "Voce checklist"}</option>)}</select></label> : null}
        {contextType === "job-site" ? <label className={styles.field}>
          <span>Cantiere</span>
          {initialContext?.type === "job-site" ? <input name="jobSiteId" type="hidden" value={initialContext.id} /> : null}
          <select defaultValue={initialContext?.type === "job-site" ? initialContext.id : ""} disabled={disabled || pending || initialContext?.type === "job-site"} name={initialContext?.type === "job-site" ? undefined : "jobSiteId"} required>
            <option value="">Seleziona cantiere</option>
            {jobSites.map((jobSite) => (
              <option key={jobSite.id} value={jobSite.id}>{jobSite.name}</option>
            ))}
          </select>
        </label> : null}
        {contextType === "worker" ? <label className={styles.field}>
          <span>Lavoratore</span>
          {initialContext?.type === "worker" ? <input name="workerId" type="hidden" value={initialContext.id} /> : null}
          <select defaultValue={initialContext?.type === "worker" ? initialContext.id : ""} disabled={disabled || pending || initialContext?.type === "worker"} name={initialContext?.type === "worker" ? undefined : "workerId"} required>
            <option value="">Seleziona lavoratore</option>
            {workers.map((worker) => (
              <option key={worker.id} value={worker.id}>{worker.displayName}</option>
            ))}
          </select>
        </label> : null}
        {contextType === "checklist-item" ? <label className={styles.field}>
          <span>Voce checklist</span>
          {initialContext?.type === "checklist-item" ? <input name="checklistItemId" type="hidden" value={initialContext.id} /> : null}
          <select defaultValue={initialContext?.type === "checklist-item" ? initialContext.id : ""} disabled={disabled || pending || initialContext?.type === "checklist-item"} name={initialContext?.type === "checklist-item" ? undefined : "checklistItemId"} required>
            <option value="">Seleziona voce</option>
            {checklistItems.map((item) => (
              <option key={item.id} value={item.id}>{checklistItemLabel(item, checklists)}</option>
            ))}
          </select>
        </label> : null}
        {type !== "NOTE" ? (
          <label className={styles.field}>
            <span>File prova</span>
            <input accept={type === "PHOTO" ? "image/jpeg,image/png,image/webp" : "application/pdf,image/jpeg,image/png,image/webp"} disabled={disabled || pending} name="file" required type="file" />
            <small className="text-muted-foreground">Limite 4 MB. Foto: JPEG, PNG, WebP. File: PDF o immagini.</small>
          </label>
        ) : null}
      </div>
      <label className={styles.field}>
        <span>Descrizione</span>
        <textarea disabled={disabled || pending} maxLength={4000} name="description" />
      </label>
      <button className={styles.button} disabled={disabled || pending || !availableContextTypes.length} type="submit">
        {pending ? "Salvataggio..." : "Salva prova"}
      </button>
    </form>
  );
}
