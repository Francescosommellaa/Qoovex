import Link from "next/link";
import styles from "../AdminCore.module.css";
import { WorkspaceEmptyState, WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";
import { evidenceTypeLabels, fileSizeLabel, formatDate, statusTone } from "@/views/workspace/workspace-format";
import type { WorkspaceCapabilities, WorkspaceChecklistItemRecord, WorkspaceChecklistRecord, WorkspaceEvidenceRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";

function jobSiteLabel(jobSiteId: string | null | undefined, jobSites: WorkspaceJobSiteRecord[]) {
  return jobSites.find((jobSite) => jobSite.id === jobSiteId)?.name ?? null;
}

function workerLabel(workerId: string | null | undefined, workers: WorkspaceWorkerRecord[]) {
  return workers.find((worker) => worker.id === workerId)?.displayName ?? null;
}

function checklistItemLabel(itemId: string | null | undefined, items: WorkspaceChecklistItemRecord[], checklists: WorkspaceChecklistRecord[]) {
  const item = items.find((candidate) => candidate.id === itemId);
  if (!item) return null;
  const checklist = checklists.find((candidate) => candidate.id === item.checklistId);
  return `${checklist?.name ?? "Checklist"} - ${item.label}`;
}

function contextLabel(evidence: WorkspaceEvidenceRecord, jobSites: WorkspaceJobSiteRecord[], workers: WorkspaceWorkerRecord[], items: WorkspaceChecklistItemRecord[], checklists: WorkspaceChecklistRecord[]) {
  return [jobSiteLabel(evidence.jobSiteId, jobSites), workerLabel(evidence.workerId, workers), checklistItemLabel(evidence.checklistItemId, items, checklists)]
    .filter(Boolean)
    .join(" - ") || "Contesto operativo";
}

export function EvidencePageView({
  evidence,
  jobSites,
  workers,
  checklists,
  checklistItems,
  capabilities,
}: {
  evidence: WorkspaceEvidenceRecord[];
  jobSites: WorkspaceJobSiteRecord[];
  workers: WorkspaceWorkerRecord[];
  checklists: WorkspaceChecklistRecord[];
  checklistItems: WorkspaceChecklistItemRecord[];
  capabilities: WorkspaceCapabilities;
}) {
  return (
    <WorkspacePage>
      <WorkspacePageHeader
        title="Prove"
        description="Consulta foto, file e note operative nei contesti in cui sono state registrate."
        action={capabilities.canUploadEvidence ? <Link className={styles.linkButton} href="/evidence/new">Aggiungi prova</Link> : undefined}
      />
      <WorkspacePanel title="Prove recenti" description="Il download passa sempre da accesso protetto server-side.">
          <div className={styles.list}>
            {!evidence.length ? (
              <WorkspaceEmptyState title="Nessuna prova" description="Aggiungi una foto, un file o una nota per collegare una prova al cantiere." />
            ) : evidence.map((item) => (
              <article className={styles.record} key={item.id}>
                <div className={styles.recordMain}>
                  <strong>{item.title}</strong>
                  <span>{contextLabel(item, jobSites, workers, checklistItems, checklists)}</span>
                  <small>{formatDate(item.createdAt)}{item.originalFileName ? ` - ${item.originalFileName} (${item.size ? fileSizeLabel(item.size) : "dimensione non registrata"})` : ""}</small>
                </div>
                <div className={styles.actions}>
                  <WorkspaceState label={evidenceTypeLabels[item.type]} tone={item.type === "NOTE" ? "info" : "good"} />
                  {item.hasFile ? <a className={styles.linkButton} href={`/api/evidence/${item.id}/download`}>Scarica</a> : null}
                </div>
              </article>
            ))}
          </div>
      </WorkspacePanel>
    </WorkspacePage>
  );
}
