"use client";

import { useState } from "react";
import type { BlobOrphanDryRunResponse, DataControlJobListResponse } from "@qoovex/types";
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
  organizationCode,
}: {
  initialJobs: DataControlJobListResponse;
  initialOrphans: BlobOrphanDryRunResponse;
  organizationCode: string;
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
      setMessage("Job creato. Il runner cron lo eseguira alla prossima esecuzione.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operazione non disponibile.");
    } finally {
      setPendingAction(null);
    }
  }

  async function createDeletionJob(formData: FormData) {
    await run("delete", () => submitJson("/api/data/deletion-jobs", {
      organizationCode: formData.get("organizationCode"),
      confirmation: formData.get("confirmation"),
    }));
  }

  return (
    <div className={styles.list}>
      {message ? <p className={styles.formSuccess}>{message}</p> : null}
      {error ? <p className={styles.formError}>{error}</p> : null}

      <article className={styles.record}>
        <div className={styles.recordMain}>
          <strong>Export metadata asincrono</strong>
          <span>Genera un file JSON privato su Blob. Non include file, token, hash, URL permanenti o body email.</span>
        </div>
        <div className={styles.actions}>
          <button className={styles.button} disabled={pendingAction !== null} onClick={() => run("export", () => submitJson("/api/data/export-jobs"))} type="button">
            Crea job export
          </button>
        </div>
      </article>

      <article className={styles.record}>
        <div className={styles.recordMain}>
          <strong>Blob orfani</strong>
          <span>Prefisso: {initialOrphans.prefix}</span>
          <small>Scansionati {initialOrphans.scanned}. Orfani {initialOrphans.orphanCount}. Eliminabili dopo 24h: {initialOrphans.deletableCount}.</small>
        </div>
        <div className={styles.actions}>
          <button className={styles.button} disabled={pendingAction !== null || initialOrphans.deletableCount === 0} onClick={() => run("cleanup", () => submitJson("/api/data/blob-orphans/cleanup"))} type="button">
            Crea job cleanup
          </button>
        </div>
      </article>

      <article className={styles.record}>
        <div className={styles.recordMain}>
          <strong>Cancellazione definitiva azienda</strong>
          <span>Crea un job pending. La cancellazione non parte nella request UI.</span>
          <small>Codice azienda richiesto: {organizationCode}. Conferma esatta: ELIMINA DEFINITIVAMENTE.</small>
        </div>
        <form action={createDeletionJob} className={styles.form}>
          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span>Codice azienda</span>
              <input autoComplete="off" name="organizationCode" placeholder={organizationCode} />
            </label>
            <label className={styles.field}>
              <span>Conferma testuale</span>
              <input autoComplete="off" name="confirmation" placeholder="ELIMINA DEFINITIVAMENTE" />
            </label>
          </div>
          <button className={styles.dangerButton} disabled={pendingAction !== null} type="submit">
            Crea job cancellazione definitiva
          </button>
        </form>
      </article>

      <article className={styles.record}>
        <div className={styles.recordMain}>
          <strong>Job recenti</strong>
          <span>{initialJobs.jobs.length ? "Ultimi job Data Control." : "Nessun job Data Control ancora creato."}</span>
        </div>
      </article>
      {initialJobs.jobs.map((job) => (
        <article className={styles.record} key={job.id}>
          <div className={styles.recordMain}>
            <strong>{job.type}</strong>
            <span>Stato: {job.status} - creato {new Date(job.createdAt).toLocaleString("it-IT")}</span>
            {job.errorCode ? <small>Errore: {job.errorCode}</small> : null}
          </div>
          <div className={styles.actions}>
            {job.type === "METADATA_EXPORT" && job.status === "COMPLETED" ? (
              <a className={styles.linkButton} href={`/api/data/export-jobs/${job.id}/download`}>Scarica</a>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
