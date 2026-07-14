import Link from "next/link";
import { DocumentArchiveButton } from "./DocumentArchiveButton";
import { DocumentForm } from "./DocumentForm";
import { DocumentVersionList } from "./DocumentVersionList";
import { DocumentVersionUploadForm } from "./DocumentVersionUploadForm";
import styles from "../AdminCore.module.css";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";
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
  returnToDashboard = false,
}: {
  document: WorkspaceDocumentRecord;
  versions: WorkspaceDocumentVersionRecord[];
  deadlines: WorkspaceDeadlineRecord[];
  documentTypes: WorkspaceDocumentTypeRecord[];
  workers: WorkspaceWorkerRecord[];
  jobSites: WorkspaceJobSiteRecord[];
  capabilities: WorkspaceCapabilities;
  returnToDashboard?: boolean;
}) {
  return (
    <WorkspacePage>
      <WorkspacePageHeader
        title={document.title}
        description={`${ownerLabel(document.ownerType, document.workerId, document.jobSiteId, workers, jobSites)} - Scadenza registrata: ${formatDate(document.expiryDate)}`}
        action={<Link className={styles.ghostButton} href={returnToDashboard ? "/dashboard" : "/documents"}>{returnToDashboard ? "Torna alla dashboard" : "Torna ai documenti"}</Link>}
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
                <WorkspaceState label={documentStatusLabels[document.status]} tone={statusTone(document.status)} />
                {capabilities.canManageCore ? <DocumentArchiveButton documentId={document.id} redirectToList /> : null}
              </div>
            </div>
          </WorkspacePanel>
          <WorkspacePanel title="Versioni caricate" description="Scarica tramite accesso protetto. Nessun URL permanente viene mostrato.">
            <DocumentVersionList documentId={document.id} versions={versions} canArchive={capabilities.canManageCore} />
          </WorkspacePanel>
          <WorkspacePanel title="Scadenze collegate">
            {!deadlines.length ? <p className="qv-text-muted">Nessuna scadenza collegata a questo documento.</p> : (
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
              <p className="qv-text-muted">Il tuo ruolo non puo modificare questo documento.</p>
            )}
          </WorkspacePanel>
          <WorkspacePanel title="Carica versione" description="Il file viene salvato su Blob e collegato come metadato al documento.">
            {capabilities.canUploadDocumentVersions ? <DocumentVersionUploadForm documentId={document.id} returnToDashboard={returnToDashboard} /> : <p className="qv-text-muted">Upload disponibile solo per ruoli di gestione.</p>}
          </WorkspacePanel>
        </div>
      </div>
    </WorkspacePage>
  );
}
