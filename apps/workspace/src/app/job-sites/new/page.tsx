import { redirect } from "next/navigation";
import { getWorkspaceCapabilities } from "@/views/admin-core/admin-core-server";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";

export default async function NewJobSitePage() {
  let canCreateJobSites = false;
  try {
    canCreateJobSites = (await getWorkspaceCapabilities()).canCreateJobSites;
  } catch {
    return <WorkspaceAccessState title="Creazione non disponibile" description="Verifica accesso e autorizzazioni." />;
  }
  if (!canCreateJobSites) return <WorkspaceAccessState />;
  redirect("/job-sites?intent=create");
}
