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
              </div>
            </div>
          </WorkspacePanel>
          {capabilities.canUploadDocumentVersions ? <WorkspacePanel title="Aggiungi file" description="Il file viene collegato al documento e resta da verificare."><DocumentVersionUploadForm documentId={document.id} returnToDashboard={returnToDashboard} /></WorkspacePanel> : null}
          <WorkspacePanel title="File caricati" description="Scarica tramite accesso protetto. Nessun URL permanente viene mostrato.">
            <DocumentVersionList documentId={document.id} versions={versions} canArchive={capabilities.canManageCore} />
          </WorkspacePanel>
          <WorkspacePanel title="Scadenze collegate">
            {!deadlines.length ? <p className="text-muted-foreground">Nessuna scadenza collegata a questo documento.</p> : (
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
      {capabilities.canUpdateDocuments || capabilities.canManageCore ? <WorkspacePanel title="Gestione avanzata" description="Modifica informazioni o archivia in una zona separata.">{capabilities.canUpdateDocuments ? <details className={styles.details}><summary>Modifica informazioni</summary><DocumentForm mode="update" document={document} documentTypes={documentTypes} workers={workers} jobSites={jobSites} /></details> : null}{capabilities.canManageCore ? <details className={styles.details}><summary>Zona riservata</summary><DocumentArchiveButton documentId={document.id} redirectToList /></details> : null}</WorkspacePanel> : null}
    </WorkspacePage>
  );
}
