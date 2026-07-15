import Link from "next/link";
import styles from "../AdminCore.module.css";
import { WorkspaceEmptyState, WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";
import { recordStatusLabels, statusTone } from "@/views/workspace/workspace-format";
import type { WorkspaceCapabilities, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";

export function WorkersPageView({ workers, capabilities }: { workers: WorkspaceWorkerRecord[]; capabilities: WorkspaceCapabilities }) {
  return (
    <WorkspacePage>
      <WorkspacePageHeader title="Lavoratori" description="Apri una persona per vedere documenti, scadenze e cantieri collegati." action={capabilities.canCreateWorkers ? <Link className={styles.linkButton} href="/workers/new">Aggiungi lavoratore</Link> : undefined} />
      <WorkspacePanel title="Lavoratori" description="Sono mostrati solo i dati disponibili per il tuo ruolo.">
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
                </div>
              </article>
            ))}
          </div>
      </WorkspacePanel>
    </WorkspacePage>
  );
}
