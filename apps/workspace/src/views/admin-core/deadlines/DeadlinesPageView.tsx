import { DeadlineArchiveButton } from "./DeadlineArchiveButton";
import { DeadlineForm } from "./DeadlineForm";
import styles from "../AdminCore.module.css";
import { WorkspaceEmptyState, WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceStatusBadge } from "@/views/workspace/WorkspacePrimitives";
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
}: {
  deadlines: WorkspaceDeadlineRecord[];
  documents: WorkspaceDocumentRecord[];
  workers: WorkspaceWorkerRecord[];
  jobSites: WorkspaceJobSiteRecord[];
  capabilities: WorkspaceCapabilities;
}) {
  return (
    <WorkspacePage>
      <WorkspacePageHeader
        title="Scadenze"
        description="Registra date inserite o confermate dall'utente. Non vengono calcolate scadenze normative."
      />
      <div className={styles.splitGrid}>
        <WorkspacePanel title="Scadenze registrate" description="Le scadenze sono ordinate per data. La soglia in scadenza e operativa, non normativa.">
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
                  <WorkspaceStatusBadge label={deadlineStatusLabels[deadline.status]} tone={statusTone(deadline.status)} />
                  {capabilities.canManageCore ? <DeadlineArchiveButton deadlineId={deadline.id} /> : null}
                </div>
                {capabilities.canManageCore ? (
                  <details className={styles.details}>
                    <summary>Modifica scadenza</summary>
                    <DeadlineForm mode="update" deadline={deadline} documents={documents} workers={workers} jobSites={jobSites} />
                  </details>
                ) : null}
              </article>
            ))}
          </div>
        </WorkspacePanel>
        <WorkspacePanel title="Aggiungi scadenza" description="La data deve essere inserita o confermata dall'utente.">
          {capabilities.canManageCore ? (
            <DeadlineForm mode="create" documents={documents} workers={workers} jobSites={jobSites} />
          ) : (
            <p className={styles.muted}>Il tuo ruolo puo leggere le scadenze, ma non gestirle da questa schermata.</p>
          )}
        </WorkspacePanel>
      </div>
    </WorkspacePage>
  );
}
