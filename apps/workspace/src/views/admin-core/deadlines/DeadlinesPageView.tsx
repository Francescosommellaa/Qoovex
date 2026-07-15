import Link from "next/link";
import styles from "../AdminCore.module.css";
import { WorkspaceEmptyState, WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";
import { deadlineStatusLabels, formatDate, ownerLabel, statusTone } from "@/views/workspace/workspace-format";
import type { WorkspaceCapabilities, WorkspaceDeadlineRecord, WorkspaceDocumentRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";

function relationLabel(deadline: WorkspaceDeadlineRecord, documents: WorkspaceDocumentRecord[], workers: WorkspaceWorkerRecord[], jobSites: WorkspaceJobSiteRecord[]) {
  if (deadline.documentId) return documents.find((document) => document.id === deadline.documentId)?.title ?? "Documento";
  if (deadline.workerId) return workers.find((worker) => worker.id === deadline.workerId)?.displayName ?? "Lavoratore";
  if (deadline.jobSiteId) return jobSites.find((jobSite) => jobSite.id === deadline.jobSiteId)?.name ?? "Cantiere";
  return "Scadenza manuale";
}

export function DeadlinesPageView({
  deadlines,
  documents,
  workers,
  jobSites,
  capabilities,
  returnToDashboard = false,
}: {
  deadlines: WorkspaceDeadlineRecord[];
  documents: WorkspaceDocumentRecord[];
  workers: WorkspaceWorkerRecord[];
  jobSites: WorkspaceJobSiteRecord[];
  capabilities: WorkspaceCapabilities;
  returnToDashboard?: boolean;
}) {
  return (
    <WorkspacePage>
      <WorkspacePageHeader
        title="Scadenze"
        description="Registra date inserite o confermate dall'utente. Non vengono calcolate scadenze normative."
        action={returnToDashboard ? <Link className={styles.ghostButton} href="/dashboard">Torna a Da fare</Link> : capabilities.canCreateDeadlines ? <Link className={styles.linkButton} href="/deadlines/new">Aggiungi scadenza</Link> : undefined}
      />
      <WorkspacePanel title="Scadenze registrate" description="Le scadenze sono ordinate per data. La soglia in scadenza è operativa, non normativa.">
          <div className={styles.list}>
            {!deadlines.length ? (
              <WorkspaceEmptyState title="Nessuna scadenza" description="Registra una scadenza per ricevere una vista chiara delle date da controllare." />
            ) : deadlines.map((deadline) => (
              <article className={styles.record} key={deadline.id}>
                <div className={styles.recordMain}>
                  <strong>{deadline.title}</strong>
                  <span>Scadenza registrata: {formatDate(deadline.dueDate)}</span>
                  <small>{relationLabel(deadline, documents, workers, jobSites)}</small>
                </div>
                <div className={styles.actions}>
                  <WorkspaceState label={deadlineStatusLabels[deadline.status]} tone={statusTone(deadline.status)} />
                </div>
              </article>
            ))}
          </div>
      </WorkspacePanel>
    </WorkspacePage>
  );
}
