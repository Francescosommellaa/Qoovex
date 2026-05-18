import { redirect } from "next/navigation";
import { getCurrentWorkspaceUser } from "@shared/server/current-workspace-user";
import { SettingsView } from "@views/settings";

export default async function SettingsPage() {
  const user = await getCurrentWorkspaceUser();
  if (!user) redirect("/sign-in");

  return <SettingsView user={user} />;
}
