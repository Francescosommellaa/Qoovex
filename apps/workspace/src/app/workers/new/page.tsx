import { redirect } from "next/navigation";
import { getWorkspaceCapabilities } from "@/views/admin-core/admin-core-server";
import { WorkspaceAccessState } from "@/views/workspace/WorkspaceAccessState";

export default async function NewWorkerPage() {
  let canCreateWorkers = false;
  try {
    canCreateWorkers = (await getWorkspaceCapabilities()).canCreateWorkers;
  } catch {
    return <WorkspaceAccessState title="Creazione non disponibile" description="Verifica accesso e autorizzazioni." />;
  }
  if (!canCreateWorkers) return <WorkspaceAccessState />;
  redirect("/workers?intent=create");
}
