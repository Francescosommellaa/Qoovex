"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { submitJson } from "../admin-api-client";
import styles from "../AdminCore.module.css";
import { formatDate } from "@/views/workspace/workspace-format";
import type { WorkspaceShareLinkRecord } from "@/views/workspace/workspace-records";

function shareLinkState(link: WorkspaceShareLinkRecord) {
  if (link.revokedAt) return "Revocato";
  if (link.expiresAt && new Date(link.expiresAt).getTime() <= Date.now()) return "Scaduto";
  return "Attivo";
}

export function ShareLinksPanel({ packageId, links, canShare }: { packageId: string; links: WorkspaceShareLinkRecord[]; canShare: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function revokeLink(shareLinkId: string) {
    setPending(shareLinkId);
    setError(null);
    try {
      await submitJson(`/api/document-packages/${packageId}/share-links/${shareLinkId}`, "DELETE");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Revoca non riuscita.");
    } finally {
      setPending(null);
    }
  }

  if (!canShare) return <p className="qv-text-muted">I link di condivisione sono gestiti da Owner e Admin.</p>;
  if (!links.length) return <p className="qv-text-muted">Nessun link di condivisione creato.</p>;

  return (
    <div className={styles.list}>
      {error ? <p className={styles.formError}>{error}</p> : null}
      {links.map((link) => (
        <article className={styles.record} key={link.id}>
          <div className={styles.recordMain}>
            <strong>{shareLinkState(link)}</strong>
            <span>Scadenza del link: {formatDate(link.expiresAt)}</span>
            <small>Ultimo accesso: {formatDate(link.lastAccessedAt)}</small>
          </div>
          <div className={styles.actions}>
            {!link.revokedAt ? (
              <button className={styles.dangerButton} disabled={pending === link.id} onClick={() => revokeLink(link.id)} type="button">
                {pending === link.id ? "Revoca..." : "Revoca link"}
              </button>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
