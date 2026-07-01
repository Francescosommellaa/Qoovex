import Link from "next/link";
import { DocumentArchiveButton } from "./DocumentArchiveButton";
import { DocumentForm } from "./DocumentForm";
import { DocumentVersionList } from "./DocumentVersionList";
import { DocumentVersionUploadForm } from "./DocumentVersionUploadForm";
import styles from "../AdminCore.module.css";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceStatusBadge } from "@/views/workspace/WorkspacePrimitives";
import { documentStatusLabels, formatDate, ownerLabel, statusTone } from "@/views/workspace/workspace-format";
import type { WorkspaceCapabilities, WorkspaceDeadlineRecord, WorkspaceDocumentRecord, WorkspaceDocumentTypeRecord, WorkspaceDocumentVersionRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";

export function DocumentDetailView({
  document,
  versions,
  deadlines,
  documentTypes,
  workers,
  jobSites,
  capabilities,
}: {
  document: WorkspaceDocumentRecord;
  versions: WorkspaceDocumentVersionRecord[];
  deadlines: WorkspaceDeadlineRecord[];
  documentTypes: WorkspaceDocumentTypeRecord[];
  workers: WorkspaceWorkerRecord[];
  jobSites: WorkspaceJobSiteRecord[];
  capabilities: WorkspaceCapabilities;
}) {
  return (
    <WorkspacePage>
      <WorkspacePageHeader
        title={document.title}
        description={`${ownerLabel(document.ownerType, document.workerId, document.jobSiteId, workers, jobSites)} - Scadenza registrata: ${formatDate(document.expiryDate)}`}
        action={<Link className={styles.ghostButton} href="/documents">Torna ai documenti</Link>}
      />
      <div className={styles.splitGrid}>
        <div className={styles.grid}>
          <WorkspacePanel title="Stato documento">
            <div className={styles.record}>
              <div className={styles.recordMain}>
                <strong>{document.title}</strong>
                <span>{document.notes || "Nessuna nota operativa registrata."}</span>
                <small>Aggiornato: {formatDate(document.updatedAt)}</small>
              </div>
              <div className={styles.actions}>
                <WorkspaceStatusBadge label={documentStatusLabels[document.status]} tone={statusTone(document.status)} />
                {capabilities.canManageCore ? <DocumentArchiveButton documentId={document.id} redirectToList /> : null}
              </div>
            </div>
          </WorkspacePanel>
          <WorkspacePanel title="Versioni caricate" description="Scarica tramite accesso protetto. Nessun URL permanente viene mostrato.">
            <DocumentVersionList documentId={document.id} versions={versions} canArchive={capabilities.canManageCore} />
          </WorkspacePanel>
          <WorkspacePanel title="Scadenze collegate">
            {!deadlines.length ? <p className={styles.muted}>Nessuna scadenza collegata a questo documento.</p> : (
              <div className={styles.list}>
                {deadlines.map((deadline) => (
                  <article className={styles.record} key={deadline.id}>
                    <div className={styles.recordMain}>
                      <strong>{deadline.title}</strong>
                      <span>Scadenza registrata: {formatDate(deadline.dueDate)}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </WorkspacePanel>
        </div>
        <div className={styles.grid}>
          <WorkspacePanel title="Aggiorna documento">
            {capabilities.canUpdateDocuments ? (
              <DocumentForm mode="update" document={document} documentTypes={documentTypes} workers={workers} jobSites={jobSites} />
            ) : (
              <p className={styles.muted}>Il tuo ruolo non puo modificare questo documento.</p>
            )}
          </WorkspacePanel>
          <WorkspacePanel title="Carica versione" description="Il file viene salvato su Blob e collegato come metadato al documento.">
            {capabilities.canUploadDocumentVersions ? <DocumentVersionUploadForm documentId={document.id} /> : <p className={styles.muted}>Upload disponibile solo per ruoli di gestione.</p>}
          </WorkspacePanel>
        </div>
      </div>
    </WorkspacePage>
  );
}
