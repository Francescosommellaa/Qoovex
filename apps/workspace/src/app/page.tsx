import Link from "next/link";
import { redirect } from "next/navigation";
import { bootstrapUser } from "@shared/server/current-user-service";
import { getWorkspaceAccessContext, requireOrganizationContext, requirePrimaryIdentity } from "@shared/server/access-context-service";
import { listOrganizationJobSites } from "@shared/server/job-site-lifecycle-service";
import { buttonVariants } from "@qoovex/ui/components/button";
import { presentJobSiteStatus } from "@shared/lib/product-state-presentation";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";

export default async function RootPage() {
  const user = await bootstrapUser();
  if (!user) redirect("/sign-in?callbackUrl=%2F");
  const [identity, context] = await Promise.all([requirePrimaryIdentity(), getWorkspaceAccessContext()]);
  if (identity.platformRole !== "USER") redirect("/qoovex-admin");
  if (identity.accountRole === "CLIENT") redirect("/client");
  if (context.company) {
    const organizationId = context.company.organization.id;
    const [organizationContext, jobSites] = await Promise.all([
      requireOrganizationContext(organizationId),
      listOrganizationJobSites(organizationId),
    ]);
    const open = jobSites.filter((value) => !["CLOSED", "ARCHIVED"].includes(value.status));
    return <WorkspacePage><WorkspacePageHeader title={organizationContext.organization.name} description="Spazio Azienda per documentare e condividere i lavori con i clienti." action={<Link className={buttonVariants()} href="/job-sites">Gestisci cantieri</Link>} /><div className="grid gap-4 sm:grid-cols-3"><WorkspacePanel title="Lavori aperti"><p className="text-3xl font-semibold">{open.length}</p></WorkspacePanel><WorkspacePanel title="In attesa cliente"><p className="text-3xl font-semibold">{jobSites.filter((value) => ["WAITING_FOR_CLIENT", "PENDING_INITIAL_CONFIRMATION"].includes(value.status)).length}</p></WorkspacePanel><WorkspacePanel title="Chiusi"><p className="text-3xl font-semibold">{jobSites.filter((value) => value.status === "CLOSED").length}</p></WorkspacePanel></div><WorkspacePanel title="Aggiornati di recente">{jobSites.slice(0, 8).length ? <ul className="divide-y">{jobSites.slice(0, 8).map((site) => <li className="flex items-center justify-between gap-3 py-3" key={site.id}><Link className="font-medium hover:underline" href={`/job-sites/${site.id}`}>{site.name}</Link><WorkspaceState state={presentJobSiteStatus(site.status)} /></li>)}</ul> : <p className="text-sm text-muted-foreground">Nessun cantiere ancora creato.</p>}</WorkspacePanel></WorkspacePage>;
  }
  if (identity.accountRole === "BUSINESS") redirect("/account/organization");
  if (identity.accountRole === "PROFESSIONAL") redirect("/account/invitations");
  redirect("/account/role");
}
