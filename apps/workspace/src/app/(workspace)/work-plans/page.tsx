import { redirect } from "next/navigation";
import { getCurrentWorkspaceUser } from "@shared/server/current-workspace-user";
import { WorkPlansIndexView } from "@views/work-plan";

export default async function WorkPlansPage() {
  const user = await getCurrentWorkspaceUser();
  if (!user) redirect("/sign-in");

  return <WorkPlansIndexView user={user} />;
}
