import Link from "next/link";
import styles from "../AdminCore.module.css";
import { WorkspaceEmptyState, WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";
import { formatDate, recordStatusLabels, statusTone } from "@/views/workspace/workspace-format";
import type { WorkspaceCapabilities, WorkspaceJobSiteRecord } from "@/views/workspace/workspace-records";

export function JobSitesPageView({ jobSites, capabilities }: { jobSites: WorkspaceJobSiteRecord[]; capabilities: WorkspaceCapabilities }) {
  return (
    <WorkspacePage>
      <WorkspacePageHeader title="Cantieri" description="Apri un cantiere per vedere lavoro aperto, documenti, checklist e prove collegate." action={capabilities.canCreateJobSites ? <Link className={styles.linkButton} href="/job-sites/new">Aggiungi cantiere</Link> : undefined} />
      <WorkspacePanel title="Cantieri" description="Gli elementi archiviati sono esclusi dalla vista standard.">
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
                  <WorkspaceState label={recordStatusLabels[jobSite.status]} tone={statusTone(jobSite.status)} />
                  <Link className={styles.linkButton} href={`/job-sites/${jobSite.id}`}>Apri</Link>
                </div>
              </article>
            ))}
          </div>
      </WorkspacePanel>
    </WorkspacePage>
  );
}
