import { redirect } from "next/navigation";
import { getCurrentWorkspaceUser } from "@shared/server/current-workspace-user";
import { DashboardView } from "@views/dashboard";

export default async function DashboardPage() {
  const user = await getCurrentWorkspaceUser();
  if (!user) redirect("/sign-in");

  return <DashboardView user={user} />;
}
