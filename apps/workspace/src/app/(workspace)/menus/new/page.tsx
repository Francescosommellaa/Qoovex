import { redirect } from "next/navigation";
import { getCurrentWorkspaceUser } from "@shared/server/current-workspace-user";
import { NewMenuView } from "@views/menus";

export default async function NewMenuPage() {
  const user = await getCurrentWorkspaceUser();
  if (!user) redirect("/sign-in");

  return <NewMenuView user={user} />;
}
