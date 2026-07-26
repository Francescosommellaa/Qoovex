import Link from "next/link";
import styles from "../AdminCore.module.css";
import { WorkspaceEmptyState, WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";
import { checklistItemStatusLabels, formatDate, recordStatusLabels, statusTone } from "@/views/workspace/workspace-format";
import type { WorkspaceCapabilities, WorkspaceChecklistRecord, WorkspaceJobSiteRecord } from "@/views/workspace/workspace-records";

function jobSiteLabel(jobSiteId: string | null | undefined, jobSites: WorkspaceJobSiteRecord[]) {
  return jobSites.find((jobSite) => jobSite.id === jobSiteId)?.name ?? "Nessun cantiere";
}

export function ChecklistsPageView({
  checklists,
  jobSites,
  capabilities,
  activeView,
  page,
  hasNextPage,
}: {
  checklists: WorkspaceChecklistRecord[];
  jobSites: WorkspaceJobSiteRecord[];
  capabilities: WorkspaceCapabilities;
  activeView?: "open";
  page: number;
  hasNextPage: boolean;
}) {
  const pageHref = (nextPage: number) => `/checklists?${new URLSearchParams({ ...(activeView ? { view: activeView } : {}), ...(nextPage > 1 ? { page: String(nextPage) } : {}) }).toString()}`.replace(/\?$/, "");
  return (
    <WorkspacePage>
      <WorkspacePageHeader
        title="Checklist"
        description={activeView ? "Checklist con almeno una voce aperta o da verificare nello scope autorizzato." : "Consulta il progresso e apri la prossima voce da completare."}
        action={<div className="flex flex-wrap gap-2">{activeView ? <Link className={styles.linkButton} href="/checklists">Tutte le checklist</Link> : null}{capabilities.canManageChecklists ? <Link className={styles.linkButton} href="/checklists/new">Crea checklist</Link> : null}</div>}
      />
      <WorkspacePanel title={activeView ? "Checklist aperte" : "Checklist"} description="La gestione quotidiana resta nel cantiere collegato.">
          <div className={styles.list}>
            {!checklists.length ? (
              <WorkspaceEmptyState title="Nessuna checklist" description="Crea una checklist configurata per seguire attivita, documenti o prove da controllare." />
            ) : checklists.map((checklist) => {
              const done = checklist.items?.filter((item) => item.status === "DONE").length ?? 0;
              const open = checklist.items?.filter((item) => item.status !== "DONE").length ?? 0;
              return (
                <article className={styles.record} key={checklist.id}>
                  <div className={styles.recordMain}>
                    <strong>{checklist.name}</strong>
                    <span>{jobSiteLabel(checklist.jobSiteId, jobSites)} - Voci aperte: {open} - {checklistItemStatusLabels.DONE}: {done}</span>
                    <small>Aggiornata: {formatDate(checklist.updatedAt)}</small>
                  </div>
                  <div className={styles.actions}>
                    <WorkspaceState label={recordStatusLabels[checklist.status]} tone={statusTone(checklist.status)} />
                    <Link className={styles.linkButton} href={`/checklists/${checklist.id}`}>Apri</Link>
                  </div>
                </article>
              );
            })}
          </div>
      </WorkspacePanel>
      {page > 1 || hasNextPage ? <nav aria-label="Paginazione checklist" className="flex items-center justify-between gap-3"><span className="text-sm text-muted-foreground">Pagina {page}</span><div className="flex gap-2">{page > 1 ? <Link className={styles.linkButton} href={pageHref(page - 1)}>Precedente</Link> : null}{hasNextPage ? <Link className={styles.linkButton} href={pageHref(page + 1)}>Successiva</Link> : null}</div></nav> : null}
    </WorkspacePage>
  );
}
