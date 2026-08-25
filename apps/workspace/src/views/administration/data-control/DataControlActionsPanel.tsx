"use client";

import { useState } from "react";
import type { BlobOrphanDryRunResponse, DataControlJobListResponse } from "@qoovex/types";
import { linkVariants } from "@qoovex/ui/components/link";
import { presentDataControlJobStatus, presentDataControlJobType } from "@shared/lib/product-state-presentation";
import styles from "../AdminCore.module.css";

async function submitJson<T>(url: string, body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.message ?? "Operazione non disponibile.");
  return payload as T;
}

export function DataControlActionsPanel({
  initialJobs,
  initialOrphans,
}: {
  initialJobs: DataControlJobListResponse;
  initialOrphans: BlobOrphanDryRunResponse;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  async function run(action: string, callback: () => Promise<unknown>) {
    setPendingAction(action);
    setError(null);
    setMessage(null);
    try {
      await callback();
      setMessage("Richiesta registrata. La preparazione inizierà automaticamente.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operazione non disponibile.");
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className={styles.list}>
      {message ? <p className={styles.formSuccess}>{message}</p> : null}
      {error ? <p className={styles.formError}>{error}</p> : null}

      <article className={styles.record}>
        <div className={styles.recordMain}>
          <strong>Prepara un archivio dei dati</strong>
          <span>Prepara un archivio privato delle informazioni disponibili, senza includere file caricati o dati sensibili.</span>
        </div>
        <div className={styles.actions}>
          <button className={styles.button} disabled={pendingAction !== null} onClick={() => run("export", () => submitJson("/api/data/export-jobs"))} type="button">
            Prepara archivio
          </button>
        </div>
      </article>

      <article className={styles.record}>
        <div className={styles.recordMain}>
          <strong>File non collegati</strong>
          <span>La verifica dei file conservati è completata.</span>
          <small>File verificati: {initialOrphans.scanned}. Non collegati: {initialOrphans.orphanCount}. Eliminabili dopo 24 ore: {initialOrphans.deletableCount}.</small>
        </div>
        <div className={styles.actions}>
          <button className={styles.button} disabled={pendingAction !== null || initialOrphans.deletableCount === 0} onClick={() => run("cleanup", () => submitJson("/api/data/blob-orphans/cleanup"))} type="button">
            Avvia pulizia
          </button>
        </div>
      </article>

      <article className={styles.record}>
        <div className={styles.recordMain}>
          <strong>Operazioni recenti</strong>
          <span>{initialJobs.jobs.length ? "Ultime operazioni sui dati." : "Nessuna operazione sui dati ancora richiesta."}</span>
        </div>
      </article>
      {initialJobs.jobs.map((job) => (
        <article className={styles.record} key={job.id}>
          <div className={styles.recordMain}>
            <strong>{presentDataControlJobType(job.type).label}</strong>
            <span>Stato: {presentDataControlJobStatus(job.status).label} - creato {new Date(job.createdAt).toLocaleString("it-IT")}</span>
            {job.errorCode ? <small>L'operazione non è riuscita. Riprova o contatta l'assistenza.</small> : null}
          </div>
          <div className={styles.actions}>
            {job.type === "METADATA_EXPORT" && job.status === "COMPLETED" ? (
              <a className={linkVariants({ variant: "primary" })} href={`/api/data/export-jobs/${job.id}/download`}>Scarica</a>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
