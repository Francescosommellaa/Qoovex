import { redirect } from "next/navigation";
import { getCurrentWorkspaceUser } from "@shared/server/current-workspace-user";
import { EditMenuView } from "@views/menus";

export default async function EditMenuPage({
  params,
}: {
  params: Promise<{ menuId: string }>;
}) {
  const user = await getCurrentWorkspaceUser();
  if (!user) redirect("/sign-in");

  const { menuId } = await params;
  return <EditMenuView user={user} menuId={menuId} />;
}
