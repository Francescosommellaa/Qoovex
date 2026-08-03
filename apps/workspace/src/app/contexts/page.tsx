import Link from "next/link";
import { getContextHub } from "@shared/server/access-context-service";
import { buttonVariants } from "@qoovex/ui/components/button";
import { WorkspaceEmptyState, WorkspacePage, WorkspacePageHeader, WorkspacePanel } from "@/views/workspace/WorkspacePrimitives";

export default async function ContextsPage() {
  const hub = await getContextHub();
  const hasAny = hub.organizations.length || hub.clientJobSites.length || hub.platform;
  return <WorkspacePage>
    <WorkspacePageHeader title="Scegli il contesto" description="La route selezionata determina il contesto di autorizzazione. Nessun cookie concede accesso." action={<Link className={buttonVariants({ variant: "outline" })} href="/contexts/notifications">Preferenze notifiche</Link>} />
    {!hasAny ? <WorkspaceEmptyState title="Nessun contesto disponibile" description="Chiedi un invito a un'Azienda o a un cantiere." /> : <div className="grid gap-4 md:grid-cols-2">
      {hub.organizations.map((context) => <WorkspacePanel key={context.membershipId} title={context.organization.name} description={`${context.role} · contesto Azienda`}><Link className={buttonVariants()} href={`/org/${context.organization.id}`}>Entra nell'Azienda</Link></WorkspacePanel>)}
      {hub.clientJobSites.length ? <WorkspacePanel title="I tuoi lavori" description={`${hub.clientJobSites.length} cantier${hub.clientJobSites.length === 1 ? "e" : "i"} come cliente`}><Link className={buttonVariants()} href="/client">Apri la vista cliente</Link></WorkspacePanel> : null}
      {hub.platform ? <WorkspacePanel title="Piattaforma" description={hub.platform.role}><Link className={buttonVariants()} href="/qoovex-admin">Apri la console</Link></WorkspacePanel> : null}
    </div>}
  </WorkspacePage>;
}
