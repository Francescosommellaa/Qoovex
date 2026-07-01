import Link from "next/link";
import { DocumentForm } from "./DocumentForm";
import { DocumentArchiveButton } from "./DocumentArchiveButton";
import styles from "../AdminCore.module.css";
import { WorkspaceEmptyState, WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceStatusBadge } from "@/views/workspace/WorkspacePrimitives";
import { documentStatusLabels, formatDate, ownerLabel, statusTone } from "@/views/workspace/workspace-format";
import type { WorkspaceCapabilities, WorkspaceDocumentRecord, WorkspaceDocumentTypeRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";

const filters = [
  { label: "Tutti", href: "/documents" },
  { label: "Da verificare", href: "/documents?status=TO_REVIEW" },
  { label: "Mancanti", href: "/documents?status=MISSING" },
  { label: "Scaduti", href: "/documents?status=EXPIRED" },
  { label: "In scadenza", href: "/documents?status=EXPIRING_SOON" },
  { label: "Presenti", href: "/documents?status=PRESENT" },
] as const;

export function DocumentsPageView({
  documents,
  documentTypes,
  workers,
  jobSites,
  activeStatus,
  capabilities,
}: {
  documents: WorkspaceDocumentRecord[];
  documentTypes: WorkspaceDocumentTypeRecord[];
  workers: WorkspaceWorkerRecord[];
  jobSites: WorkspaceJobSiteRecord[];
  activeStatus?: string;
  capabilities: WorkspaceCapabilities;
}) {
  return (
    <WorkspacePage>
      <WorkspacePageHeader
        title="Documenti"
        description="Gestisci documenti logici, stati documentali e scadenze registrate senza caricare file direttamente nel record."
      />
      <div className={styles.splitGrid}>
        <WorkspacePanel title="Lista documenti" description="Gli elementi archiviati sono esclusi dalla vista standard.">
          <div className={styles.filterBar} aria-label="Filtra documenti per stato">
            {filters.map((filter) => (
              <Link aria-current={(activeStatus ? filter.href.endsWith(activeStatus) : filter.href === "/documents") ? "page" : undefined} href={filter.href} key={filter.href}>
                {filter.label}
              </Link>
            ))}
          </div>
          <div className={styles.list}>
            {!documents.length ? (
              <WorkspaceEmptyState title="Nessun documento" description="Aggiungi il primo documento per iniziare a vedere cosa e presente, scaduto o da verificare." />
            ) : documents.map((document) => (
              <article className={styles.record} key={document.id}>
                <div className={styles.recordMain}>
                  <strong>{document.title}</strong>
                  <span>{ownerLabel(document.ownerType, document.workerId, document.jobSiteId, workers, jobSites)} - Scadenza: {formatDate(document.expiryDate)}</span>
                  <small>Aggiornato: {formatDate(document.updatedAt)}</small>
                </div>
                <div className={styles.actions}>
                  <WorkspaceStatusBadge label={documentStatusLabels[document.status]} tone={statusTone(document.status)} />
                  <Link className={styles.linkButton} href={`/documents/${document.id}`}>Apri</Link>
                  {capabilities.canManageCore ? <DocumentArchiveButton documentId={document.id} /> : null}
                </div>
              </article>
            ))}
          </div>
        </WorkspacePanel>
        <WorkspacePanel title="Aggiungi documento" description="Crea un record logico. Il file si carica nel dettaglio come versione.">
          {capabilities.canManageCore ? (
            <DocumentForm mode="create" documentTypes={documentTypes} workers={workers} jobSites={jobSites} />
          ) : (
            <p className={styles.muted}>Il tuo ruolo puo leggere i documenti, ma non creare nuovi record da questa schermata.</p>
          )}
        </WorkspacePanel>
      </div>
    </WorkspacePage>
  );
}
