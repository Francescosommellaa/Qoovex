import Link from "next/link";
import { linkVariants } from "@qoovex/ui/components/link";
import { AccessError } from "@shared/server/access-errors";
import { listPlatformOrganizations } from "@shared/server/platform-admin-service";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceEmptyState } from "@/views/workspace/WorkspacePrimitives";
import { PlatformAdminAccessState } from "@/views/platform-admin/PlatformAdminAccessState";
import { SupportSessionForm } from "@/views/platform-admin/SupportSessionForm";
import styles from "@/views/platform-admin/PlatformAdmin.module.css";

export default async function PlatformOrganizationsPage({ searchParams }: { searchParams: Promise<{ q?: string; cursor?: string }> }) {
  const search = await searchParams;
  try {
    const data = await listPlatformOrganizations(search);
    return (
      <WorkspacePage>
        <WorkspacePageHeader title="Aziende e supporto" description="Individua l'azienda e apri un accesso temporaneo con motivo registrato." />
        <WorkspacePanel><form className={styles.formRow} action="/qoovex-admin/organizations"><div className={styles.field}><label htmlFor="organization-search">Nome, codice o email owner</label><input defaultValue={search.q} id="organization-search" name="q" /></div><button className={styles.button} type="submit">Cerca</button></form></WorkspacePanel>
        <WorkspacePanel title="Risultati">
          {data.organizations.length === 0 ? <WorkspaceEmptyState title="Nessuna azienda" description="Modifica i criteri di ricerca." /> : <div className={styles.recordList}>{data.organizations.map((organization) => (
            <article className={styles.record} key={organization.id}>
              <div className={styles.recordHeader}><div><h2>{organization.name}</h2><p className={styles.meta}>Codice Azienda: {organization.code}</p></div></div>
              <p className="text-muted-foreground">{organization._count.memberships} membri · {organization._count.workers} lavoratori · {organization._count.jobSites} cantieri · {organization._count.jobSiteAttachments} allegati</p>
              <p className="text-muted-foreground">Owner: {organization.memberships.map((membership) => membership.user.email).join(", ") || "non disponibile"}</p>
              <SupportSessionForm organizationCode={organization.code} />
            </article>
          ))}</div>}
          {data.nextCursor ? <Link className={linkVariants({ variant: "outline" })} href={`/qoovex-admin/organizations?${new URLSearchParams({ ...(search.q ? { q: search.q } : {}), cursor: data.nextCursor }).toString()}`}>Pagina successiva</Link> : null}
        </WorkspacePanel>
      </WorkspacePage>
    );
  } catch (error) {
    return <PlatformAdminAccessState mfaRequired={error instanceof AccessError && error.status === 403} />;
  }
}
