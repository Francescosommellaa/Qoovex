import Link from "next/link";
import { JobSiteArchiveButton } from "./JobSiteArchiveButton";
import { JobSiteForm } from "./JobSiteForm";
import styles from "../AdminCore.module.css";
import { WorkspaceEmptyState, WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceStatusBadge } from "@/views/workspace/WorkspacePrimitives";
import { formatDate, recordStatusLabels, statusTone } from "@/views/workspace/workspace-format";
import type { WorkspaceCapabilities, WorkspaceJobSiteRecord } from "@/views/workspace/workspace-records";

export function JobSitesPageView({ jobSites, capabilities }: { jobSites: WorkspaceJobSiteRecord[]; capabilities: WorkspaceCapabilities }) {
  return (
    <WorkspacePage>
      <WorkspacePageHeader title="Cantieri" description="Organizza contesti operativi a cui collegare documenti e scadenze, senza geolocalizzazione continua." />
      <div className={styles.splitGrid}>
        <WorkspacePanel title="Lista cantieri" description="Gli elementi archiviati sono esclusi dalla vista standard.">
          <div className={styles.list}>
            {!jobSites.length ? (
              <WorkspaceEmptyState title="Nessun cantiere" description="Crea un cantiere per raccogliere documenti, scadenze e prossime attivita." />
            ) : jobSites.map((jobSite) => (
              <article className={styles.record} key={jobSite.id}>
                <div className={styles.recordMain}>
                  <strong>{jobSite.name}</strong>
                  <span>{jobSite.clientName || "Committente non indicato"}</span>
                  <small>{jobSite.startDate ? `Inizio ${formatDate(jobSite.startDate)}` : "Data inizio non registrata"}</small>
                </div>
                <div className={styles.actions}>
                  <WorkspaceStatusBadge label={recordStatusLabels[jobSite.status]} tone={statusTone(jobSite.status)} />
                  <Link className={styles.linkButton} href={`/job-sites/${jobSite.id}`}>Apri</Link>
                  {capabilities.canManageCore ? <JobSiteArchiveButton jobSiteId={jobSite.id} /> : null}
                </div>
              </article>
            ))}
          </div>
        </WorkspacePanel>
        <WorkspacePanel title="Aggiungi cantiere" description="Usa solo dati operativi minimi. Coordinate e presenze restano fuori scope.">
          {capabilities.canManageCore ? <JobSiteForm mode="create" /> : <p className="qv-text-muted">Il tuo ruolo puo leggere i cantieri, ma non gestirli da questa schermata.</p>}
        </WorkspacePanel>
      </div>
    </WorkspacePage>
  );
}
