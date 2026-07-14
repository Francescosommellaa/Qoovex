import Link from "next/link";
import { WorkerArchiveButton } from "./WorkerArchiveButton";
import { WorkerForm } from "./WorkerForm";
import styles from "../AdminCore.module.css";
import { WorkspaceEmptyState, WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";
import { recordStatusLabels, statusTone } from "@/views/workspace/workspace-format";
import type { WorkspaceCapabilities, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";

export function WorkersPageView({ workers, capabilities }: { workers: WorkspaceWorkerRecord[]; capabilities: WorkspaceCapabilities }) {
  return (
    <WorkspacePage>
      <WorkspacePageHeader title="Lavoratori" description="Raccogli dati minimi per collegare documenti e scadenze a persone operative." />
      <div className={styles.splitGrid}>
        <WorkspacePanel title="Lista lavoratori" description="Non raccogliere dati personali non necessari.">
          <div className={styles.list}>
            {!workers.length ? (
              <WorkspaceEmptyState title="Nessun lavoratore" description="Aggiungi un lavoratore per collegare documenti e scadenze." />
            ) : workers.map((worker) => (
              <article className={styles.record} key={worker.id}>
                <div className={styles.recordMain}>
                  <strong>{worker.displayName}</strong>
                  <span>{worker.roleLabel || "Ruolo operativo non indicato"}</span>
                  <small>{worker.email || worker.phone || "Contatto non registrato"}</small>
                </div>
                <div className={styles.actions}>
                  <WorkspaceState label={recordStatusLabels[worker.status]} tone={statusTone(worker.status)} />
                  <Link className={styles.linkButton} href={`/workers/${worker.id}`}>Apri</Link>
                  {capabilities.canManageCore ? <WorkerArchiveButton workerId={worker.id} /> : null}
                </div>
              </article>
            ))}
          </div>
        </WorkspacePanel>
        <WorkspacePanel title="Aggiungi lavoratore" description="Il ruolo operativo e testo libero, non un permesso o una qualifica legale.">
          {capabilities.canManageCore ? <WorkerForm mode="create" /> : <p className="qv-text-muted">Il tuo ruolo puo leggere i lavoratori, ma non gestirli da questa schermata.</p>}
        </WorkspacePanel>
      </div>
    </WorkspacePage>
  );
}
