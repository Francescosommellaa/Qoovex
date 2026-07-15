import Link from "next/link";
import styles from "../AdminCore.module.css";
import { WorkspaceEmptyState, WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";
import { documentStatusLabels, formatDate, ownerLabel, statusTone } from "@/views/workspace/workspace-format";
import type { WorkspaceCapabilities, WorkspaceDocumentRecord, WorkspaceJobSiteRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";

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
  workers,
  jobSites,
  activeStatus,
  capabilities,
  returnToDashboard = false,
  originDashboard = false,
  intentUpload = false,
}: {
  documents: WorkspaceDocumentRecord[];
  workers: WorkspaceWorkerRecord[];
  jobSites: WorkspaceJobSiteRecord[];
  activeStatus?: string;
  capabilities: WorkspaceCapabilities;
  returnToDashboard?: boolean;
  originDashboard?: boolean;
  intentUpload?: boolean;
}) {
  return (
    <WorkspacePage>
      <WorkspacePageHeader
        title="Documenti"
        description={intentUpload ? "Apri il documento a cui vuoi aggiungere il file." : "Trova cosa è presente, cosa richiede attenzione e il prossimo passo."}
        action={returnToDashboard || originDashboard ? <Link className={styles.ghostButton} href="/dashboard">Torna a Da fare</Link> : capabilities.canCreateDocuments ? <Link className={styles.linkButton} href="/documents/new">Aggiungi documento</Link> : undefined}
      />
      <WorkspacePanel title="Documenti" description="Gli elementi archiviati sono esclusi dalla vista standard.">
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
                </div>
              </article>
            ))}
          </div>
      </WorkspacePanel>
    </WorkspacePage>
  );
}
