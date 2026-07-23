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
  activeView,
  page,
  hasNextPage,
}: {
  packages: WorkspaceDocumentPackageRecord[];
  jobSites: WorkspaceJobSiteRecord[];
  shareLinksByPackage: Record<string, WorkspaceShareLinkRecord[]>;
  capabilities: WorkspaceCapabilities;
  activeView?: "ready";
  page: number;
  hasNextPage: boolean;
}) {
  const pageHref = (nextPage: number) => `/document-packages?${new URLSearchParams({ ...(activeView ? { view: activeView } : {}), ...(nextPage > 1 ? { page: String(nextPage) } : {}) }).toString()}`.replace(/\?$/, "");
  return (
    <WorkspacePage>
      <WorkspacePageHeader
        title="Condivisioni"
        description={activeView ? "Pacchetti pronti per revisione o già condivisi nello scope autorizzato." : "Controlla gli elementi preparati e lo stato dei link in sola lettura."}
        action={<div className="flex flex-wrap gap-2">{activeView ? <Link className={styles.linkButton} href="/document-packages">Tutti i pacchetti</Link> : null}{capabilities.canManagePackages ? <Link className={styles.linkButton} href="/document-packages/new">Prepara condivisione</Link> : null}</div>}
      />
      <WorkspacePanel title={activeView ? "Pacchetti pronti" : "Documenti preparati"} description="Le condivisioni archiviate sono escluse dalla vista standard.">
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
      {page > 1 || hasNextPage ? <nav aria-label="Paginazione pacchetti" className="flex items-center justify-between gap-3"><span className="text-sm text-muted-foreground">Pagina {page}</span><div className="flex gap-2">{page > 1 ? <Link className={styles.linkButton} href={pageHref(page - 1)}>Precedente</Link> : null}{hasNextPage ? <Link className={styles.linkButton} href={pageHref(page + 1)}>Successiva</Link> : null}</div></nav> : null}
    </WorkspacePage>
  );
}
