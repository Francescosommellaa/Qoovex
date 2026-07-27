import Link from "next/link";
import { DocumentPackageArchiveButton } from "./DocumentPackageArchiveButton";
import { DocumentPackageForm } from "./DocumentPackageForm";
import { DocumentPackageItemForm } from "./DocumentPackageItemForm";
import { DocumentPackageItemsList } from "./DocumentPackageItemsList";
import { ShareLinkCreateForm } from "./ShareLinkCreateForm";
import { ShareLinksPanel } from "./ShareLinksPanel";
import styles from "../AdminCore.module.css";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";
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
import { OperationalArtifactStatus } from "@entities/operational-process/ui/OperationalArtifactStatus";

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
  returnToDashboard = false,
}: {
  documentPackage: WorkspaceDocumentPackageRecord;
  jobSites: WorkspaceJobSiteRecord[];
  documents: WorkspaceDocumentRecord[];
  documentVersions: WorkspaceDocumentVersionRecord[];
  evidence: WorkspaceEvidenceRecord[];
  checklists: WorkspaceChecklistRecord[];
  shareLinks: WorkspaceShareLinkRecord[];
  capabilities: WorkspaceCapabilities;
  returnToDashboard?: boolean;
}) {
  const items = documentPackage.items ?? [];
  return (
    <WorkspacePage>
      <WorkspacePageHeader
        title={documentPackage.title}
        description={`${jobSiteLabel(documentPackage.jobSiteId, jobSites)} - Controlla ogni elemento prima di creare il link.`}
        action={<Link className={styles.ghostButton} href={returnToDashboard ? "/dashboard" : "/document-packages"}>{returnToDashboard ? "Torna al Centro operativo" : "Torna alle condivisioni"}</Link>}
      />
      <OperationalArtifactStatus artifactId={documentPackage.id} artifactType="DOCUMENT_PACKAGE" />
      <div className={styles.grid}>
          <WorkspacePanel title="Riepilogo condivisione">
            <article className={styles.record}>
              <div className={styles.recordMain}>
                <strong>{documentPackage.title}</strong>
                <span>{documentPackage.description || "Nessuna descrizione registrata."}</span>
                <small>Aggiornato: {formatDate(documentPackage.updatedAt)}</small>
              </div>
              <div className={styles.actions}>
                <WorkspaceState label={documentPackageStatusLabels[documentPackage.status]} tone={statusTone(documentPackage.status)} />
              </div>
            </article>
          </WorkspacePanel>
          <WorkspacePanel title="Elementi selezionati" description="Il destinatario esterno vede soltanto gli elementi presenti in questo riepilogo.">
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
          {capabilities.canManagePackages ? <WorkspacePanel title="Aggiungi elementi" description="Seleziona esplicitamente documenti, file, prove o checklist da includere."><details className={styles.details}><summary>Aggiungi elemento</summary><DocumentPackageItemForm packageId={documentPackage.id} documents={documents} documentVersions={documentVersions} evidence={evidence} checklists={checklists} /></details></WorkspacePanel> : null}
          {capabilities.canSharePackages ? <WorkspacePanel title="Crea link" description="Crea il link solo dopo aver controllato il riepilogo."><ShareLinkCreateForm packageId={documentPackage.id} /></WorkspacePanel> : null}
          <WorkspacePanel title="Accessi creati" description="Ogni accesso può avere una scadenza ed essere revocato. Il codice copiabile è mostrato solo alla creazione.">
            <ShareLinksPanel packageId={documentPackage.id} links={shareLinks} canShare={capabilities.canSharePackages} />
          </WorkspacePanel>
      </div>
      {capabilities.canManagePackages ? <WorkspacePanel title="Gestione avanzata" description="Modifica informazioni o archivia la condivisione."><details className={styles.details}><summary>Modifica informazioni</summary><DocumentPackageForm mode="update" documentPackage={documentPackage} jobSites={jobSites} /></details><details className={styles.details}><summary>Zona riservata</summary><DocumentPackageArchiveButton packageId={documentPackage.id} redirectToList /></details></WorkspacePanel> : null}
    </WorkspacePage>
  );
}
