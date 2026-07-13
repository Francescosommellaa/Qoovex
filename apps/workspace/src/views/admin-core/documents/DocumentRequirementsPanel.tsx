"use client";

import { FormEvent, useEffect, useState } from "react";
import type { DocumentRequirementSummary, RequirementTargetType } from "@qoovex/types";
import { submitJson } from "../admin-api-client";
import styles from "../AdminCore.module.css";
import type { WorkspaceDocumentTypeRecord, WorkspaceJobSiteRecord } from "@/views/workspace/workspace-records";

const targetLabels: Record<RequirementTargetType, string> = {
  ORGANIZATION: "Azienda",
  WORKER: "Lavoratori attivi",
  JOB_SITE: "Cantieri attivi",
};

export function DocumentRequirementsPanel({
  canManage,
  documentTypes,
  jobSites,
}: {
  canManage: boolean;
  documentTypes: WorkspaceDocumentTypeRecord[];
  jobSites: WorkspaceJobSiteRecord[];
}) {
  const [requirements, setRequirements] = useState<DocumentRequirementSummary[]>([]);
  const [targetType, setTargetType] = useState<RequirementTargetType>("ORGANIZATION");
  const [pending, setPending] = useState<"load" | "save" | null>(canManage ? "load" : null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadRequirements() {
    if (!canManage) return;
    setPending("load");
    setError(null);
    try {
      const response = await fetch("/api/document-requirements");
      if (!response.ok) throw new Error("Requisiti non disponibili.");
      setRequirements(await response.json() as DocumentRequirementSummary[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Requisiti non disponibili.");
    } finally {
      setPending(null);
    }
  }

  useEffect(() => {
    void loadRequirements();
  }, [canManage]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setPending("save");
    setError(null);
    setMessage(null);
    try {
      await submitJson<DocumentRequirementSummary>("/api/document-requirements", "POST", {
        name: formData.get("name"),
        description: formData.get("description"),
        targetType: formData.get("targetType"),
        documentTypeId: formData.get("documentTypeId"),
        jobSiteId: formData.get("jobSiteId") || null,
        isRequired: true,
      });
      event.currentTarget.reset();
      setTargetType("ORGANIZATION");
      setMessage("Requisito documentale creato.");
      await loadRequirements();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Creazione requisito non riuscita.");
    } finally {
      setPending(null);
    }
  }

  async function archiveRequirement(requirementId: string) {
    setPending("save");
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/document-requirements/${requirementId}`, { method: "DELETE" });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.message ?? "Archiviazione non riuscita.");
      setMessage("Requisito archiviato.");
      await loadRequirements();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Archiviazione non riuscita.");
    } finally {
      setPending(null);
    }
  }

  if (!canManage) {
    return <p className="qv-text-muted">I requisiti documentali sono gestiti da proprietario o amministratore. Qui vedi solo gli eventuali documenti mancanti nel tuo scope.</p>;
  }

  const compatibleTypes = documentTypes.filter((type) => type.appliesTo === targetType);

  return (
    <div className={styles.list}>
      {error ? <p className={styles.formError}>{error}</p> : null}
      {message ? <p className={styles.formSuccess}>{message}</p> : null}
      <form className={styles.form} onSubmit={submit}>
        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span>Nome requisito</span>
            <input name="name" placeholder="Es. Documento richiesto per cantiere" required />
          </label>
          <label className={styles.field}>
            <span>Target</span>
            <select name="targetType" onChange={(event) => setTargetType(event.currentTarget.value as RequirementTargetType)} value={targetType}>
              <option value="ORGANIZATION">Azienda</option>
              <option value="WORKER">Lavoratori</option>
              <option value="JOB_SITE">Cantieri</option>
            </select>
          </label>
          <label className={styles.field}>
            <span>Tipo documento</span>
            <select name="documentTypeId" required>
              <option value="">Seleziona tipo</option>
              {compatibleTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
            </select>
          </label>
          {targetType === "JOB_SITE" ? (
            <label className={styles.field}>
              <span>Cantiere specifico opzionale</span>
              <select name="jobSiteId">
                <option value="">Tutti i cantieri attivi</option>
                {jobSites.map((jobSite) => <option key={jobSite.id} value={jobSite.id}>{jobSite.name}</option>)}
              </select>
            </label>
          ) : null}
        </div>
        <label className={styles.field}>
          <span>Descrizione opzionale</span>
          <textarea name="description" placeholder="Note operative interne, senza riferimenti normativi inventati." />
        </label>
        <button className={styles.button} disabled={pending !== null || !compatibleTypes.length} type="submit">
          {pending === "save" ? "Creazione..." : "Crea requisito"}
        </button>
      </form>
      <div className={styles.list}>
        {pending === "load" ? <p className="qv-text-muted">Caricamento requisiti...</p> : null}
        {!requirements.length && pending !== "load" ? <p className="qv-text-muted">Nessun requisito configurato.</p> : null}
        {requirements.map((requirement) => (
          <article className={styles.record} key={requirement.id}>
            <div className={styles.recordMain}>
              <strong>{requirement.name}</strong>
              <span>{targetLabels[requirement.targetType]} - {requirement.documentTypeName ?? "Tipo documento non disponibile"}</span>
              {requirement.jobSiteName ? <small>Cantiere specifico: {requirement.jobSiteName}</small> : null}
            </div>
            <div className={styles.actions}>
              <button className={styles.dangerButton} disabled={pending !== null} onClick={() => archiveRequirement(requirement.id)} type="button">
                Archivia
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
