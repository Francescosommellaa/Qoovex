"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formValue, nullableFormValue, submitFormData, submitJson } from "../admin-api-client";
import type { WorkspaceDocumentRecord, WorkspaceDocumentTypeRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";
import type { WorkspaceCreationContext, WorkspaceOrigin } from "@/views/workspace/workspace-flow-context";
import { workspaceResultHref } from "@/views/workspace/workspace-flow-context";
import styles from "../AdminCore.module.css";

type DocumentContextType = "ORGANIZATION" | "WORKER" | "JOB_SITE";

export function DocumentCreateFlow({ documentTypes, workers, jobSites, initialContext, origin }: { documentTypes: WorkspaceDocumentTypeRecord[]; workers: WorkspaceWorkerRecord[]; jobSites: WorkspaceJobSiteRecord[]; initialContext: WorkspaceCreationContext | null; origin: WorkspaceOrigin | null }) {
  const router = useRouter();
  const inheritedType: DocumentContextType = initialContext?.type === "worker" ? "WORKER" : initialContext?.type === "job-site" ? "JOB_SITE" : "ORGANIZATION";
  const [contextType, setContextType] = useState<DocumentContextType>(inheritedType);
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [createdDocumentId, setCreatedDocumentId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedType = useMemo(() => documentTypes.find((item) => item.id === selectedTypeId), [documentTypes, selectedTypeId]);

  async function upload(documentId: string, file: File) {
    const uploadData = new FormData();
    uploadData.set("file", file);
    await submitFormData(`/api/documents/${documentId}/versions`, uploadData);
  }

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const intent = submitter instanceof HTMLButtonElement ? submitter.value : "upload";
    const file = formData.get("file");
    const title = formValue(formData, "title") || selectedType?.name;
    const payload: Record<string, unknown> = {
      title,
      documentTypeId: nullableFormValue(formData, "documentTypeId"),
      ownerType: contextType,
      status: "TO_REVIEW",
      expiryDate: nullableFormValue(formData, "expiryDate"),
      notes: nullableFormValue(formData, "notes"),
    };
    if (contextType === "WORKER") payload.workerId = formValue(formData, "workerId");
    if (contextType === "JOB_SITE") payload.jobSiteId = formValue(formData, "jobSiteId");

    try {
      const document = await submitJson<WorkspaceDocumentRecord>("/api/documents", "POST", payload);
      setCreatedDocumentId(document.id);
      if (intent === "later" || !(file instanceof File) || file.size === 0) {
        router.push(workspaceResultHref(origin, "document-created", document.id));
        router.refresh();
        return;
      }
      await upload(document.id, file);
      router.push(workspaceResultHref(origin, "file-uploaded", document.id));
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Salvataggio non riuscito.");
      setPending(false);
    }
  }

  async function retryUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!createdDocumentId) return;
    setPending(true);
    setError(null);
    const file = new FormData(event.currentTarget).get("file");
    try {
      if (!(file instanceof File) || !file.size) throw new Error("Scegli un file da caricare.");
      await upload(createdDocumentId, file);
      router.push(workspaceResultHref(origin, "file-uploaded", createdDocumentId));
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Caricamento non riuscito.");
      setPending(false);
    }
  }

  if (createdDocumentId) {
    return (
      <form className={styles.form} onSubmit={retryUpload}>
        <p className={styles.formSuccess}>Documento salvato. Il file non è ancora stato caricato.</p>
        {error ? <p className={styles.formError}>{error} Puoi riprovare senza creare un duplicato.</p> : null}
        <label className={styles.field}><span>File da caricare</span><input accept="application/pdf,image/jpeg,image/png,image/webp" name="file" required type="file" /></label>
        <button className={styles.button} disabled={pending} type="submit">{pending ? "Caricamento..." : "Riprova caricamento"}</button>
      </form>
    );
  }

  return (
    <form className={styles.form} onSubmit={create}>
      {error ? <p className={styles.formError}>{error}</p> : null}
      {initialContext ? <p className={styles.formSuccess}>Contesto già collegato dal punto di partenza.</p> : null}
      <div className={styles.fieldGrid}>
        <label className={styles.field}><span>Collegato a</span><select disabled={Boolean(initialContext)} name="ownerType" onChange={(event) => { setContextType(event.target.value as DocumentContextType); setSelectedTypeId(""); }} value={contextType}><option value="ORGANIZATION">Azienda</option><option value="WORKER">Lavoratore</option><option value="JOB_SITE">Cantiere</option></select></label>
        {contextType === "WORKER" ? <label className={styles.field}><span>Lavoratore</span>{initialContext?.type === "worker" ? <input name="workerId" type="hidden" value={initialContext.id} /> : null}<select defaultValue={initialContext?.type === "worker" ? initialContext.id : ""} disabled={initialContext?.type === "worker"} name={initialContext?.type === "worker" ? undefined : "workerId"} required><option value="">Seleziona lavoratore</option>{workers.map((worker) => <option key={worker.id} value={worker.id}>{worker.displayName}</option>)}</select></label> : null}
        {contextType === "JOB_SITE" ? <label className={styles.field}><span>Cantiere</span>{initialContext?.type === "job-site" ? <input name="jobSiteId" type="hidden" value={initialContext.id} /> : null}<select defaultValue={initialContext?.type === "job-site" ? initialContext.id : ""} disabled={initialContext?.type === "job-site"} name={initialContext?.type === "job-site" ? undefined : "jobSiteId"} required><option value="">Seleziona cantiere</option>{jobSites.map((jobSite) => <option key={jobSite.id} value={jobSite.id}>{jobSite.name}</option>)}</select></label> : null}
        <label className={styles.field}><span>Tipo documento</span><select name="documentTypeId" onChange={(event) => setSelectedTypeId(event.target.value)} value={selectedTypeId}><option value="">Senza tipo</option>{documentTypes.filter((type) => type.appliesTo === contextType).map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}</select></label>
        <label className={styles.field}><span>Titolo {selectedType ? "opzionale" : ""}</span><input name="title" required={!selectedType} minLength={2} maxLength={160} /></label>
        <label className={styles.field}><span>File</span><input accept="application/pdf,image/jpeg,image/png,image/webp" name="file" type="file" /></label>
        <label className={styles.field}><span>Scadenza {selectedType?.requiresExpiryDate ? "richiesta" : "opzionale"}</span><input name="expiryDate" required={selectedType?.requiresExpiryDate} type="date" /></label>
      </div>
      <details className={styles.details}><summary>Altre opzioni</summary><label className={styles.field}><span>Note operative</span><textarea name="notes" maxLength={4000} /></label><p className="qv-text-muted">Il documento viene salvato come da verificare. Lo stato può essere aggiornato in seguito.</p></details>
      <div className={styles.actions}><button className={styles.button} disabled={pending} name="intent" type="submit" value="upload">{pending ? "Salvataggio..." : "Salva documento"}</button><button className={styles.ghostButton} disabled={pending} name="intent" type="submit" value="later">Salva e carica più tardi</button></div>
    </form>
  );
}
