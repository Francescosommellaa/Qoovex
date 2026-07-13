import Link from "next/link";
import { JobSiteArchiveButton } from "./JobSiteArchiveButton";
import { JobSiteForm } from "./JobSiteForm";
import styles from "../AdminCore.module.css";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceStatusBadge } from "@/views/workspace/WorkspacePrimitives";
import { deadlineStatusLabels, documentStatusLabels, formatDate, recordStatusLabels, statusTone } from "@/views/workspace/workspace-format";
import type { WorkspaceCapabilities, WorkspaceDeadlineRecord, WorkspaceDocumentRecord, WorkspaceJobSiteRecord } from "@/views/workspace/workspace-records";

export function JobSiteDetailView({ jobSite, documents, deadlines, capabilities }: { jobSite: WorkspaceJobSiteRecord; documents: WorkspaceDocumentRecord[]; deadlines: WorkspaceDeadlineRecord[]; capabilities: WorkspaceCapabilities }) {
  return (
    <WorkspacePage>
      <WorkspacePageHeader title={jobSite.name} description={jobSite.clientName || "Committente non indicato"} action={<Link className={styles.ghostButton} href="/job-sites">Torna ai cantieri</Link>} />
      <div className={styles.splitGrid}>
        <div className={styles.grid}>
          <WorkspacePanel title="Dati cantiere">
            <article className={styles.record}>
              <div className={styles.recordMain}>
                <strong>{jobSite.name}</strong>
                <span>{jobSite.address || "Indirizzo non registrato"}</span>
                <small>{formatDate(jobSite.startDate)} - {formatDate(jobSite.endDate)}</small>
                <small>{jobSite.notes || "Nessuna nota operativa registrata."}</small>
              </div>
              <div className={styles.actions}>
                <WorkspaceStatusBadge label={recordStatusLabels[jobSite.status]} tone={statusTone(jobSite.status)} />
                {capabilities.canManageCore ? <JobSiteArchiveButton jobSiteId={jobSite.id} redirectToList /> : null}
              </div>
            </article>
          </WorkspacePanel>
          <WorkspacePanel title="Documenti collegati">
            {!documents.length ? <p className="qv-text-muted">Nessun documento collegato al cantiere.</p> : (
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
          <WorkspacePanel title="Scadenze registrate">
            {!deadlines.length ? <p className="qv-text-muted">Nessuna scadenza collegata al cantiere.</p> : (
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
        <WorkspacePanel title="Aggiorna cantiere">
          {capabilities.canManageCore ? <JobSiteForm mode="update" jobSite={jobSite} /> : <p className="qv-text-muted">Il tuo ruolo non puo modificare questo cantiere.</p>}
        </WorkspacePanel>
      </div>
    </WorkspacePage>
  );
}
