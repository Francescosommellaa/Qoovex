import Link from "next/link";
import { AccessError } from "@shared/server/access-errors";
import { listRuntimeErrors } from "@shared/server/platform-admin-service";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceEmptyState, WorkspaceStatusBadge } from "@/views/workspace/WorkspacePrimitives";
import { PlatformAdminAccessState } from "@/views/platform-admin/PlatformAdminAccessState";
import { RuntimeErrorAction } from "@/views/platform-admin/RuntimeErrorAction";
import styles from "@/views/platform-admin/PlatformAdmin.module.css";

export default async function PlatformErrorsPage({ searchParams }: { searchParams: Promise<{ status?: string; source?: string; cursor?: string }> }) {
  const search = await searchParams;
  try {
    const data = await listRuntimeErrors(search);
    return (
      <WorkspacePage>
        <WorkspacePageHeader title="Errori runtime" description="Errori server aggregati e sanitizzati. Le indisponibilita del database restano nei log Vercel." />
        <WorkspacePanel>
          <div className={styles.filters}>
            <Link className={styles.ghostButton} href="/qoovex-admin/errors">Tutti</Link>
            <Link className={styles.ghostButton} href="/qoovex-admin/errors?status=OPEN">Aperti</Link>
            <Link className={styles.ghostButton} href="/qoovex-admin/errors?status=RESOLVED">Risolti</Link>
          </div>
        </WorkspacePanel>
        <WorkspacePanel title="Eventi">
          {data.errors.length === 0 ? <WorkspaceEmptyState title="Nessun errore" description="Non risultano eventi per il filtro selezionato." /> : (
            <div className={styles.recordList}>{data.errors.map((error) => (
              <article className={styles.record} key={error.id}>
                <div className={styles.recordHeader}><div><h2>{error.errorName}</h2><p className={styles.meta}>{error.source} · {error.requestMethod ?? "-"} {error.routePath ?? "route non disponibile"}</p></div><WorkspaceStatusBadge label={error.status === "OPEN" ? "Aperto" : "Risolto"} tone={error.status === "OPEN" ? "danger" : "good"} /></div>
                <p>{error.message}</p>
                <p className={styles.muted}>{error.occurrenceCount} occorrenze · ultima {error.lastSeenAt.toLocaleString("it-IT")}</p>
                {error.stackPreview ? <details><summary>Stack sanitizzato</summary><pre className={styles.codeBlock}>{error.stackPreview}</pre></details> : null}
                {error.resolutionNote ? <p className={styles.success}>{error.resolutionNote}</p> : null}
                <RuntimeErrorAction errorId={error.id} status={error.status} />
              </article>
            ))}</div>
          )}
          {data.nextCursor ? <Link className={styles.ghostButton} href={`/qoovex-admin/errors?${new URLSearchParams({ ...(search.status ? { status: search.status } : {}), ...(search.source ? { source: search.source } : {}), cursor: data.nextCursor }).toString()}`}>Pagina successiva</Link> : null}
        </WorkspacePanel>
      </WorkspacePage>
    );
  } catch (error) {
    return <PlatformAdminAccessState mfaRequired={error instanceof AccessError && error.status === 403} />;
  }
}
