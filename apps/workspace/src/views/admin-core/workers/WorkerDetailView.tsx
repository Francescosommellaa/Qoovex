import Link from "next/link";
import { WorkerArchiveButton } from "./WorkerArchiveButton";
import { WorkerForm } from "./WorkerForm";
import styles from "../AdminCore.module.css";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceStatusBadge } from "@/views/workspace/WorkspacePrimitives";
import { deadlineStatusLabels, documentStatusLabels, formatDate, recordStatusLabels, statusTone } from "@/views/workspace/workspace-format";
import type { WorkspaceCapabilities, WorkspaceDeadlineRecord, WorkspaceDocumentRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";

export function WorkerDetailView({ worker, documents, deadlines, capabilities }: { worker: WorkspaceWorkerRecord; documents: WorkspaceDocumentRecord[]; deadlines: WorkspaceDeadlineRecord[]; capabilities: WorkspaceCapabilities }) {
  return (
    <WorkspacePage>
      <WorkspacePageHeader title={worker.displayName} description={worker.roleLabel || "Ruolo operativo non indicato"} action={<Link className={styles.ghostButton} href="/workers">Torna ai lavoratori</Link>} />
      <div className={styles.splitGrid}>
        <div className={styles.grid}>
          <WorkspacePanel title="Dati minimi">
            <article className={styles.record}>
              <div className={styles.recordMain}>
                <strong>{worker.displayName}</strong>
                <span>{worker.email || "Email non registrata"}</span>
                <span>{worker.phone || "Telefono non registrato"}</span>
                <small>{worker.notes || "Nessuna nota operativa registrata."}</small>
              </div>
              <div className={styles.actions}>
                <WorkspaceStatusBadge label={recordStatusLabels[worker.status]} tone={statusTone(worker.status)} />
                {capabilities.canManageCore ? <WorkerArchiveButton workerId={worker.id} redirectToList /> : null}
              </div>
            </article>
          </WorkspacePanel>
          <WorkspacePanel title="Documenti collegati">
            {!documents.length ? <p className={styles.muted}>Nessun documento collegato al lavoratore.</p> : (
              <div className={styles.list}>
                {documents.map((document) => (
                  <article className={styles.record} key={document.id}>
                    <div className={styles.recordMain}>
                      <strong>{document.title}</strong>
                      <span>Scadenza: {formatDate(document.expiryDate)}</span>
                    </div>
                    <div className={styles.actions}>
                      <WorkspaceStatusBadge label={documentStatusLabels[document.status]} tone={statusTone(document.status)} />
                      <Link className={styles.linkButton} href={`/documents/${document.id}`}>Apri</Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </WorkspacePanel>
          <WorkspacePanel title="Scadenze collegate">
            {!deadlines.length ? <p className={styles.muted}>Nessuna scadenza collegata al lavoratore.</p> : (
              <div className={styles.list}>
                {deadlines.map((deadline) => (
                  <article className={styles.record} key={deadline.id}>
                    <div className={styles.recordMain}>
                      <strong>{deadline.title}</strong>
                      <span>{formatDate(deadline.dueDate)}</span>
                    </div>
                    <WorkspaceStatusBadge label={deadlineStatusLabels[deadline.status]} tone={statusTone(deadline.status)} />
                  </article>
                ))}
              </div>
            )}
          </WorkspacePanel>
        </div>
        <WorkspacePanel title="Aggiorna lavoratore">
          {capabilities.canManageCore ? <WorkerForm mode="update" worker={worker} /> : <p className={styles.muted}>Il tuo ruolo non puo modificare questo lavoratore.</p>}
        </WorkspacePanel>
      </div>
    </WorkspacePage>
  );
}
