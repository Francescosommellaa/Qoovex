import Link from "next/link";
import { DocumentForm } from "./DocumentForm";
import { DocumentArchiveButton } from "./DocumentArchiveButton";
import { DocumentRequirementsPanel } from "./DocumentRequirementsPanel";
import styles from "../AdminCore.module.css";
import { WorkspaceEmptyState, WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";
import { documentStatusLabels, formatDate, ownerLabel, statusTone } from "@/views/workspace/workspace-format";
import type { MissingDocumentRequirementItem } from "@qoovex/types";
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
  missingRequirements,
}: {
  documents: WorkspaceDocumentRecord[];
  documentTypes: WorkspaceDocumentTypeRecord[];
  workers: WorkspaceWorkerRecord[];
  jobSites: WorkspaceJobSiteRecord[];
  activeStatus?: string;
  capabilities: WorkspaceCapabilities;
  missingRequirements: MissingDocumentRequirementItem[];
}) {
  return (
    <WorkspacePage>
      <WorkspacePageHeader
        title="Documenti"
        description="Gestisci documenti logici, stati documentali e scadenze registrate senza caricare file direttamente nel record."
      />
      <WorkspacePanel title="Documenti mancanti da requisiti" description="Elementi virtuali derivati dai requisiti attivi. Non vengono creati record documento automaticamente.">
        {!missingRequirements.length ? (
          <WorkspaceEmptyState title="Nessun documento mancante derivato dai requisiti." description="Configura requisiti e tipi documento per far emergere automaticamente le mancanze operative." />
        ) : (
          <div className={styles.list}>
            {missingRequirements.slice(0, 12).map((item) => (
              <article className={styles.record} key={item.id}>
                <div className={styles.recordMain}>
                  <strong>{item.documentTypeName}</strong>
                  <span>{item.ownerLabel} - requisito: {item.requirementName}</span>
                  <small>Target: {item.targetType === "ORGANIZATION" ? "Azienda" : item.targetType === "WORKER" ? "Lavoratore" : "Cantiere"}</small>
                </div>
                <div className={styles.actions}>
                  <WorkspaceState label="Mancante" tone="danger" />
                </div>
              </article>
            ))}
          </div>
        )}
      </WorkspacePanel>
      <WorkspacePanel title="Requisiti documentali" description="Configura il minimo operativo per far emergere documenti mancanti. Il primo rilascio richiede sempre un tipo documento.">
        <DocumentRequirementsPanel canManage={capabilities.canManageCore} documentTypes={documentTypes} jobSites={jobSites} />
      </WorkspacePanel>
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
                  <WorkspaceState label={documentStatusLabels[document.status]} tone={statusTone(document.status)} />
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
            <p className="qv-text-muted">Il tuo ruolo puo leggere i documenti, ma non creare nuovi record da questa schermata.</p>
          )}
        </WorkspacePanel>
      </div>
    </WorkspacePage>
  );
}
