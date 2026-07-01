import Link from "next/link";
import { ChecklistArchiveButton } from "./ChecklistArchiveButton";
import { ChecklistForm } from "./ChecklistForm";
import { ChecklistItemActions } from "./ChecklistItemActions";
import { ChecklistItemForm } from "./ChecklistItemForm";
import styles from "../AdminCore.module.css";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceStatusBadge } from "@/views/workspace/WorkspacePrimitives";
import { checklistItemStatusLabels, formatDate, recordStatusLabels, statusTone } from "@/views/workspace/workspace-format";
import type { WorkspaceCapabilities, WorkspaceChecklistRecord, WorkspaceJobSiteRecord } from "@/views/workspace/workspace-records";

function jobSiteLabel(jobSiteId: string | null | undefined, jobSites: WorkspaceJobSiteRecord[]) {
  return jobSites.find((jobSite) => jobSite.id === jobSiteId)?.name ?? "Nessun cantiere";
}

export function ChecklistDetailView({
  checklist,
  jobSites,
  capabilities,
}: {
  checklist: WorkspaceChecklistRecord;
  jobSites: WorkspaceJobSiteRecord[];
  capabilities: WorkspaceCapabilities;
}) {
  const items = checklist.items ?? [];
  return (
    <WorkspacePage>
      <WorkspacePageHeader
        title={checklist.name}
        description={`${jobSiteLabel(checklist.jobSiteId, jobSites)} - Voce completata significa solo azione registrata.`}
        action={<Link className={styles.ghostButton} href="/checklists">Torna alle checklist</Link>}
      />
      <div className={styles.splitGrid}>
        <div className={styles.grid}>
          <WorkspacePanel title="Dettaglio checklist">
            <article className={styles.record}>
              <div className={styles.recordMain}>
                <strong>{checklist.name}</strong>
                <span>{checklist.description || "Nessuna descrizione registrata."}</span>
                <small>Aggiornata: {formatDate(checklist.updatedAt)}</small>
              </div>
              <div className={styles.actions}>
                <WorkspaceStatusBadge label={recordStatusLabels[checklist.status]} tone={statusTone(checklist.status)} />
                {capabilities.canManageChecklists ? <ChecklistArchiveButton checklistId={checklist.id} redirectToList /> : null}
              </div>
            </article>
          </WorkspacePanel>
          <WorkspacePanel title="Voci checklist" description="Completare una voce registra un'attivita, non una verifica normativa.">
            {!items.length ? <p className={styles.muted}>Nessuna voce checklist registrata.</p> : (
              <div className={styles.list}>
                {items.map((item) => (
                  <article className={styles.record} key={item.id}>
                    <div className={styles.recordMain}>
                      <strong>{item.label}</strong>
                      <span>{item.description || "Nessuna descrizione."}</span>
                      <small>Completata: {formatDate(item.completedAt)}{item.completedById ? ` - Da: ${item.completedById}` : ""}</small>
                    </div>
                    <div className={styles.actions}>
                      <WorkspaceStatusBadge label={checklistItemStatusLabels[item.status]} tone={statusTone(item.status)} />
                      <ChecklistItemActions
                        checklistId={checklist.id}
                        itemId={item.id}
                        currentStatus={item.status}
                        canComplete={capabilities.canCompleteChecklists}
                        canManage={capabilities.canManageChecklists}
                      />
                    </div>
                    {capabilities.canManageChecklists ? (
                      <details className={styles.details}>
                        <summary>Aggiorna voce</summary>
                        <ChecklistItemForm checklistId={checklist.id} mode="update" item={item} />
                      </details>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </WorkspacePanel>
        </div>
        <div className={styles.grid}>
          <WorkspacePanel title="Aggiorna checklist">
            {capabilities.canManageChecklists ? (
              <ChecklistForm mode="update" checklist={checklist} jobSites={jobSites} />
            ) : (
              <p className={styles.muted}>Il tuo ruolo puo leggere la checklist, ma non modificarla.</p>
            )}
          </WorkspacePanel>
          <WorkspacePanel title="Aggiungi voce">
            {capabilities.canManageChecklists ? (
              <ChecklistItemForm checklistId={checklist.id} mode="create" />
            ) : (
              <p className={styles.muted}>Non puoi aggiungere voci con il ruolo corrente.</p>
            )}
          </WorkspacePanel>
        </div>
      </div>
    </WorkspacePage>
  );
}
