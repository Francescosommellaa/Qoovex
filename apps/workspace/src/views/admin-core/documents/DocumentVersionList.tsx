"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { submitJson } from "../admin-api-client";
import styles from "../AdminCore.module.css";
import { fileSizeLabel, formatDate } from "@/views/workspace/workspace-format";
import type { WorkspaceDocumentVersionRecord } from "@/views/workspace/workspace-records";

export function DocumentVersionList({ documentId, versions, canArchive }: { documentId: string; versions: WorkspaceDocumentVersionRecord[]; canArchive: boolean }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function archive(versionId: string) {
    setPendingId(versionId);
    setError(null);
    try {
      await submitJson(`/api/documents/${documentId}/versions/${versionId}`, "DELETE");
      router.refresh();
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : "Archiviazione versione non riuscita.");
    } finally {
      setPendingId(null);
    }
  }

  if (!versions.length) return <p className="text-muted-foreground">Nessun file caricato.</p>;

  return (
    <div className={styles.versionList}>
      {error ? <p className={styles.formError}>{error}</p> : null}
      {versions.map((version) => (
        <article className={styles.record} key={version.id}>
          <div className={styles.recordMain}>
            <strong>{version.originalFileName}</strong>
            <span>{version.mimeType} - {fileSizeLabel(version.size)}</span>
            <small>Caricato: {formatDate(version.createdAt)}</small>
          </div>
          <div className={styles.actions}>
            <a className={styles.linkButton} href={`/api/documents/${documentId}/versions/${version.id}/download`}>Scarica</a>
            {canArchive ? <details className={styles.details}><summary>Altre azioni</summary><button className={styles.dangerButton} disabled={pendingId === version.id} onClick={() => archive(version.id)} type="button">{pendingId === version.id ? "Archiviazione..." : "Archivia file"}</button></details> : null}
          </div>
        </article>
      ))}
    </div>
  );
}
