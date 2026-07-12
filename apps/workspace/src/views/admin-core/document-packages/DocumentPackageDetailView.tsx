import Link from "next/link";
import { DocumentPackageArchiveButton } from "./DocumentPackageArchiveButton";
import { DocumentPackageForm } from "./DocumentPackageForm";
import { DocumentPackageItemForm } from "./DocumentPackageItemForm";
import { DocumentPackageItemsList } from "./DocumentPackageItemsList";
import { ShareLinkCreateForm } from "./ShareLinkCreateForm";
import { ShareLinksPanel } from "./ShareLinksPanel";
import styles from "../AdminCore.module.css";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceStatusBadge } from "@/views/workspace/WorkspacePrimitives";
import { documentPackageStatusLabels, formatDate, statusTone } from "@/views/workspace/workspace-format";
import type {
  WorkspaceCapabilities,
  WorkspaceChecklistRecord,
  WorkspaceDocumentPackageRecord,
  WorkspaceDocumentRecord,
  WorkspaceDocumentVersionRecord,
  WorkspaceEvidenceRecord,
  WorkspaceJobSiteRecord,
  WorkspaceShareLinkRecord,
} from "@/views/workspace/workspace-records";

function jobSiteLabel(jobSiteId: string | null | undefined, jobSites: WorkspaceJobSiteRecord[]) {
  return jobSites.find((jobSite) => jobSite.id === jobSiteId)?.name ?? "Nessun cantiere";
}

export function DocumentPackageDetailView({
  documentPackage,
  jobSites,
  documents,
  documentVersions,
  evidence,
  checklists,
  shareLinks,
  capabilities,
}: {
  documentPackage: WorkspaceDocumentPackageRecord;
  jobSites: WorkspaceJobSiteRecord[];
  documents: WorkspaceDocumentRecord[];
  documentVersions: WorkspaceDocumentVersionRecord[];
  evidence: WorkspaceEvidenceRecord[];
  checklists: WorkspaceChecklistRecord[];
  shareLinks: WorkspaceShareLinkRecord[];
  capabilities: WorkspaceCapabilities;
}) {
  const items = documentPackage.items ?? [];
  return (
    <WorkspacePage>
      <WorkspacePageHeader
        title={documentPackage.title}
        description={`${jobSiteLabel(documentPackage.jobSiteId, jobSites)} - Pacchetto pronto per revisione quando hai incluso gli elementi necessari.`}
        action={<Link className={styles.ghostButton} href="/document-packages">Torna ai pacchetti</Link>}
      />
      <div className={styles.splitGrid}>
        <div className={styles.grid}>
          <WorkspacePanel title="Dettaglio pacchetto">
            <article className={styles.record}>
              <div className={styles.recordMain}>
                <strong>{documentPackage.title}</strong>
                <span>{documentPackage.description || "Nessuna descrizione registrata."}</span>
                <small>Aggiornato: {formatDate(documentPackage.updatedAt)}</small>
              </div>
              <div className={styles.actions}>
                <WorkspaceStatusBadge label={documentPackageStatusLabels[documentPackage.status]} tone={statusTone(documentPackage.status)} />
                {capabilities.canManagePackages ? <DocumentPackageArchiveButton packageId={documentPackage.id} redirectToList /> : null}
              </div>
            </article>
          </WorkspacePanel>
          <WorkspacePanel title="Item inclusi" description="Il destinatario esterno vede solo gli elementi inclusi nel pacchetto.">
            <DocumentPackageItemsList
              packageId={documentPackage.id}
              items={items}
              documents={documents}
              documentVersions={documentVersions}
              evidence={evidence}
              checklists={checklists}
              canManage={capabilities.canManagePackages}
            />
          </WorkspacePanel>
          <WorkspacePanel title="Link di condivisione" description="Link revocabile con scadenza. I link gia creati non mostrano il codice copiabile.">
            <ShareLinksPanel packageId={documentPackage.id} links={shareLinks} canShare={capabilities.canSharePackages} />
          </WorkspacePanel>
        </div>
        <div className={styles.grid}>
          <WorkspacePanel title="Aggiorna pacchetto">
            {capabilities.canManagePackages ? (
              <DocumentPackageForm mode="update" documentPackage={documentPackage} jobSites={jobSites} />
            ) : (
              <p className={styles.muted}>Il tuo ruolo puo leggere il pacchetto, ma non modificarlo.</p>
            )}
          </WorkspacePanel>
          <WorkspacePanel title="Aggiungi item">
            {capabilities.canManagePackages ? (
              <DocumentPackageItemForm
                packageId={documentPackage.id}
                documents={documents}
                documentVersions={documentVersions}
                evidence={evidence}
                checklists={checklists}
              />
            ) : (
              <p className={styles.muted}>Non puoi aggiungere item con il ruolo corrente.</p>
            )}
          </WorkspacePanel>
          <WorkspacePanel title="Crea link di condivisione">
            {capabilities.canSharePackages ? (
              <ShareLinkCreateForm packageId={documentPackage.id} />
            ) : (
              <p className={styles.muted}>Solo Owner e Admin possono creare o revocare link di condivisione.</p>
            )}
          </WorkspacePanel>
        </div>
      </div>
    </WorkspacePage>
  );
}
