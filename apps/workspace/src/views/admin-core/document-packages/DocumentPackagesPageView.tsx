import Link from "next/link";
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
        title="Condivisioni"
        description="Controlla gli elementi preparati e lo stato dei link in sola lettura."
        action={capabilities.canManagePackages ? <Link className={styles.linkButton} href="/document-packages/new">Prepara condivisione</Link> : undefined}
      />
      <WorkspacePanel title="Documenti preparati" description="Le condivisioni archiviate sono escluse dalla vista standard.">
          <div className={styles.list}>
            {!packages.length ? (
              <WorkspaceEmptyState title="Nessun pacchetto" description="Crea un pacchetto documentale pronto per revisione." />
            ) : packages.map((documentPackage) => (
              <article className={styles.record} key={documentPackage.id}>
                <div className={styles.recordMain}>
                  <strong>{documentPackage.title}</strong>
                  <span>{jobSiteLabel(documentPackage.jobSiteId, jobSites)} - Elementi: {documentPackage.items?.length ?? 0} - Link attivi: {activeLinks(shareLinksByPackage[documentPackage.id])}</span>
                  <small>Aggiornato: {formatDate(documentPackage.updatedAt)}</small>
                </div>
                <div className={styles.actions}>
                  <WorkspaceState label={documentPackageStatusLabels[documentPackage.status]} tone={statusTone(documentPackage.status)} />
                  <Link className={styles.linkButton} href={`/document-packages/${documentPackage.id}`}>Apri</Link>
                </div>
              </article>
            ))}
          </div>
      </WorkspacePanel>
    </WorkspacePage>
  );
}
