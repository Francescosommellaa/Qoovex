import Link from "next/link";
import { ChecklistArchiveButton } from "./ChecklistArchiveButton";
import { ChecklistForm } from "./ChecklistForm";
import styles from "../AdminCore.module.css";
import { WorkspaceEmptyState, WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceStatusBadge } from "@/views/workspace/WorkspacePrimitives";
import { checklistItemStatusLabels, formatDate, recordStatusLabels, statusTone } from "@/views/workspace/workspace-format";
import type { WorkspaceCapabilities, WorkspaceChecklistRecord, WorkspaceJobSiteRecord } from "@/views/workspace/workspace-records";

function jobSiteLabel(jobSiteId: string | null | undefined, jobSites: WorkspaceJobSiteRecord[]) {
  return jobSites.find((jobSite) => jobSite.id === jobSiteId)?.name ?? "Nessun cantiere";
}

export function ChecklistsPageView({
  checklists,
  jobSites,
  capabilities,
}: {
  checklists: WorkspaceChecklistRecord[];
  jobSites: WorkspaceJobSiteRecord[];
  capabilities: WorkspaceCapabilities;
}) {
  return (
    <WorkspacePage>
      <WorkspacePageHeader
        title="Checklist"
        description="Checklist configurata per seguire attivita, documenti o prove da controllare."
      />
      <div className={styles.splitGrid}>
        <WorkspacePanel title="Lista checklist" description="Gli elementi archiviati sono esclusi dalla vista standard.">
          <div className={styles.list}>
            {!checklists.length ? (
              <WorkspaceEmptyState title="Nessuna checklist" description="Crea una checklist configurata per seguire attivita, documenti o prove da controllare." />
            ) : checklists.map((checklist) => {
              const done = checklist.items?.filter((item) => item.status === "DONE").length ?? 0;
              const open = checklist.items?.filter((item) => item.status !== "DONE").length ?? 0;
              return (
                <article className={styles.record} key={checklist.id}>
                  <div className={styles.recordMain}>
                    <strong>{checklist.name}</strong>
                    <span>{jobSiteLabel(checklist.jobSiteId, jobSites)} - Voci aperte: {open} - {checklistItemStatusLabels.DONE}: {done}</span>
                    <small>Aggiornata: {formatDate(checklist.updatedAt)}</small>
                  </div>
                  <div className={styles.actions}>
                    <WorkspaceStatusBadge label={recordStatusLabels[checklist.status]} tone={statusTone(checklist.status)} />
                    <Link className={styles.linkButton} href={`/checklists/${checklist.id}`}>Apri</Link>
                    {capabilities.canManageChecklists ? <ChecklistArchiveButton checklistId={checklist.id} /> : null}
                  </div>
                </article>
              );
            })}
          </div>
        </WorkspacePanel>
        <WorkspacePanel title="Crea checklist" description="Non vengono creati template normativi o liste precompilate.">
          {capabilities.canManageChecklists ? (
            <ChecklistForm mode="create" jobSites={jobSites} />
          ) : (
            <p className="qv-text-muted">Il tuo ruolo puo leggere le checklist, ma non crearne una da questa schermata.</p>
          )}
        </WorkspacePanel>
      </div>
    </WorkspacePage>
  );
}
