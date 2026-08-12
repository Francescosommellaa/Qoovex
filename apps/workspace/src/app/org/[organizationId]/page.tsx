import Link from "next/link";
import { requireOrganizationContext } from "@shared/server/access-context-service";
import { listOrganizationJobSites } from "@shared/server/job-site-lifecycle-service";
import { buttonVariants } from "@qoovex/ui/components/button";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";
import { presentJobSiteStatus } from "@shared/lib/product-state-presentation";

export default async function OrganizationHome({ params }: { params: Promise<{ organizationId: string }> }) {
  const { organizationId } = await params; const [context, jobSites] = await Promise.all([requireOrganizationContext(organizationId), listOrganizationJobSites(organizationId)]);
  const open = jobSites.filter((value) => !["CLOSED", "ARCHIVED"].includes(value.status));
  return <WorkspacePage><WorkspacePageHeader title={context.organization.name} description="Spazio Azienda per documentare e condividere i lavori con i clienti." action={<Link className={buttonVariants()} href={`/org/${organizationId}/job-sites`}>Gestisci cantieri</Link>} /><div className="grid gap-4 sm:grid-cols-3"><WorkspacePanel title="Lavori aperti"><p className="text-3xl font-semibold">{open.length}</p></WorkspacePanel><WorkspacePanel title="In attesa cliente"><p className="text-3xl font-semibold">{jobSites.filter((value) => ["WAITING_FOR_CLIENT", "PENDING_INITIAL_CONFIRMATION"].includes(value.status)).length}</p></WorkspacePanel><WorkspacePanel title="Chiusi"><p className="text-3xl font-semibold">{jobSites.filter((value) => value.status === "CLOSED").length}</p></WorkspacePanel></div><WorkspacePanel title="Aggiornati di recente">{jobSites.slice(0, 8).length ? <ul className="divide-y">{jobSites.slice(0, 8).map((site) => <li className="flex items-center justify-between gap-3 py-3" key={site.id}><Link className="font-medium hover:underline" href={`/org/${organizationId}/job-sites/${site.id}`}>{site.name}</Link><WorkspaceState state={presentJobSiteStatus(site.status)} /></li>)}</ul> : <p className="text-sm text-muted-foreground">Nessun cantiere ancora creato.</p>}</WorkspacePanel></WorkspacePage>;
}
