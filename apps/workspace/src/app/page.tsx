import Link from "next/link";
import { redirect } from "next/navigation";
import { bootstrapUser } from "@shared/server/current-user-service";
import { getWorkspaceAccessContext, requirePrimaryIdentity } from "@shared/server/access-context-service";
import { getOrganizationHomeOverview } from "@shared/server/job-site-lifecycle-service";
import { buttonVariants } from "@qoovex/ui/components/button";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel } from "@/views/workspace/WorkspacePrimitives";
import { OrganizationHomeRecentActivities } from "@/views/workspace/OrganizationHomeRecentActivities";
import { OrganizationHomeWorkQueue } from "@/views/workspace/OrganizationHomeWorkQueue";

export default async function RootPage() {
  const user = await bootstrapUser();
  if (!user) redirect("/sign-in?callbackUrl=%2F");
  const [identity, context] = await Promise.all([requirePrimaryIdentity(), getWorkspaceAccessContext()]);
  if (identity.platformRole !== "USER") redirect("/qoovex-admin");
  if (identity.accountRole === "CLIENT") redirect("/client");
  if (context.company) {
    const organizationId = context.company.organization.id;
    const overview = await getOrganizationHomeOverview(organizationId);
    const { jobSites, recentActivities, workQueueItems } = overview;
    const open = jobSites.filter((value) => !["CLOSED", "ARCHIVED"].includes(value.status));
    return <WorkspacePage>
      <WorkspacePageHeader title={context.company.organization.name} description="Spazio Azienda per documentare e condividere i lavori con i clienti." action={<Link className={buttonVariants()} href="/job-sites">Gestisci cantieri</Link>} />
      <OrganizationHomeWorkQueue items={workQueueItems} />
      <div className="grid gap-4 sm:grid-cols-3" aria-label="Riepilogo cantieri">
        <WorkspacePanel title="Lavori aperti"><p className="text-2xl font-semibold">{open.length}</p></WorkspacePanel>
        <WorkspacePanel title="In attesa cliente"><p className="text-2xl font-semibold">{jobSites.filter((value) => ["WAITING_FOR_CLIENT", "PENDING_INITIAL_CONFIRMATION"].includes(value.status)).length}</p></WorkspacePanel>
        <WorkspacePanel title="Chiusi"><p className="text-2xl font-semibold">{jobSites.filter((value) => value.status === "CLOSED").length}</p></WorkspacePanel>
      </div>
      <OrganizationHomeRecentActivities activities={recentActivities} />
    </WorkspacePage>;
  }
  if (identity.accountRole === "BUSINESS") redirect("/account/organization");
  if (identity.accountRole === "PROFESSIONAL") redirect("/account/invitations");
  redirect("/account/role");
}
