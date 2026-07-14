import Link from "next/link";
import { DocumentPackageArchiveButton } from "./DocumentPackageArchiveButton";
import { DocumentPackageForm } from "./DocumentPackageForm";
import styles from "../AdminCore.module.css";
import { WorkspaceEmptyState, WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";
import { documentPackageStatusLabels, formatDate, statusTone } from "@/views/workspace/workspace-format";
import type { WorkspaceCapabilities, WorkspaceDocumentPackageRecord, WorkspaceJobSiteRecord, WorkspaceShareLinkRecord } from "@/views/workspace/workspace-records";

function jobSiteLabel(jobSiteId: string | null | undefined, jobSites: WorkspaceJobSiteRecord[]) {
  return jobSites.find((jobSite) => jobSite.id === jobSiteId)?.name ?? "Nessun cantiere";
}

function activeLinks(links: WorkspaceShareLinkRecord[] = []) {
  const now = Date.now();
  return links.filter((link) => !link.revokedAt && (!link.expiresAt || new Date(link.expiresAt).getTime() > now)).length;
}

export function DocumentPackagesPageView({
  packages,
  jobSites,
  shareLinksByPackage,
  capabilities,
}: {
  packages: WorkspaceDocumentPackageRecord[];
  jobSites: WorkspaceJobSiteRecord[];
  shareLinksByPackage: Record<string, WorkspaceShareLinkRecord[]>;
  capabilities: WorkspaceCapabilities;
}) {
  return (
    <WorkspacePage>
      <WorkspacePageHeader
        title="Pacchetti documentali"
        description="Prepara documenti, prove e checklist per revisione in lettura."
      />
      <div className={styles.splitGrid}>
        <WorkspacePanel title="Lista pacchetti" description="I pacchetti archiviati sono esclusi dalla vista standard.">
          <div className={styles.list}>
            {!packages.length ? (
              <WorkspaceEmptyState title="Nessun pacchetto" description="Crea un pacchetto documentale pronto per revisione." />
            ) : packages.map((documentPackage) => (
              <article className={styles.record} key={documentPackage.id}>
                <div className={styles.recordMain}>
                  <strong>{documentPackage.title}</strong>
                  <span>{jobSiteLabel(documentPackage.jobSiteId, jobSites)} - Item: {documentPackage.items?.length ?? 0} - Link attivi: {activeLinks(shareLinksByPackage[documentPackage.id])}</span>
                  <small>Aggiornato: {formatDate(documentPackage.updatedAt)}</small>
                </div>
                <div className={styles.actions}>
                  <WorkspaceState label={documentPackageStatusLabels[documentPackage.status]} tone={statusTone(documentPackage.status)} />
                  <Link className={styles.linkButton} href={`/document-packages/${documentPackage.id}`}>Apri</Link>
                  {capabilities.canManagePackages ? <DocumentPackageArchiveButton packageId={documentPackage.id} /> : null}
                </div>
              </article>
            ))}
          </div>
        </WorkspacePanel>
        <WorkspacePanel title="Crea pacchetto" description="Raccogli solo elementi scelti esplicitamente per la revisione.">
          {capabilities.canManagePackages ? (
            <DocumentPackageForm mode="create" jobSites={jobSites} />
          ) : (
            <p className="qv-text-muted">Il tuo ruolo puo leggere i pacchetti, ma non crearne uno da questa schermata.</p>
          )}
        </WorkspacePanel>
      </div>
    </WorkspacePage>
  );
}
