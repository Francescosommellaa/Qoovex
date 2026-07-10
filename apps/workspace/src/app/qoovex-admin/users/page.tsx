import Link from "next/link";
import { AccessError } from "@shared/server/access-errors";
import { listPlatformUsers } from "@shared/server/platform-admin-service";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceEmptyState, WorkspaceStatusBadge } from "@/views/workspace/WorkspacePrimitives";
import { PlatformAdminAccessState } from "@/views/platform-admin/PlatformAdminAccessState";
import styles from "@/views/platform-admin/PlatformAdmin.module.css";

export default async function PlatformUsersPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; cursor?: string }> }) {
  const search = await searchParams;
  try {
    const data = await listPlatformUsers(search);
    return (
      <WorkspacePage>
        <WorkspacePageHeader title="Utenti" description="Cerca account, controlla lo stato e apri il dettaglio operativo." />
        <WorkspacePanel>
          <form className={styles.formRow} action="/qoovex-admin/users">
            <div className={styles.field}><label htmlFor="user-search">Email, username o azienda</label><input defaultValue={search.q} id="user-search" name="q" /></div>
            <button className={styles.button} type="submit">Cerca</button>
          </form>
          <div className={styles.filters}>
            <Link className={styles.ghostButton} href="/qoovex-admin/users">Tutti</Link>
            <Link className={styles.ghostButton} href="/qoovex-admin/users?status=active">Attivi</Link>
            <Link className={styles.ghostButton} href="/qoovex-admin/users?status=suspended">Sospesi</Link>
          </div>
        </WorkspacePanel>
        <WorkspacePanel title="Risultati">
          {data.users.length === 0 ? <WorkspaceEmptyState title="Nessun utente" description="Modifica la ricerca o il filtro selezionato." /> : (
            <div className={styles.recordList}>
              {data.users.map((user) => (
                <article className={styles.record} key={user.id}>
                  <div className={styles.recordHeader}>
                    <div><h2>{[user.firstName, user.lastName].filter(Boolean).join(" ") || user.username}</h2><p className={styles.meta}>{user.email} · @{user.username}</p></div>
                    <WorkspaceStatusBadge label={user.suspendedAt ? "Sospeso" : user.platformRole === "SUPER_ADMIN" ? "Operatore Qoovex" : "Attivo"} tone={user.suspendedAt ? "danger" : user.platformRole === "SUPER_ADMIN" ? "info" : "good"} />
                  </div>
                  <p className={styles.muted}>{user.organizationMemberships.map((item) => `${item.organization.name} (${item.role})`).join(", ") || "Nessuna azienda attiva"}</p>
                  <div className={styles.actions}><Link className={styles.linkButton} href={`/qoovex-admin/users/${user.id}`}>Apri dettaglio</Link></div>
                </article>
              ))}
            </div>
          )}
          {data.nextCursor ? <Link className={styles.ghostButton} href={`/qoovex-admin/users?${new URLSearchParams({ ...(search.q ? { q: search.q } : {}), ...(search.status ? { status: search.status } : {}), cursor: data.nextCursor }).toString()}`}>Pagina successiva</Link> : null}
        </WorkspacePanel>
      </WorkspacePage>
    );
  } catch (error) {
    return <PlatformAdminAccessState mfaRequired={error instanceof AccessError && error.status === 403} />;
  }
}
