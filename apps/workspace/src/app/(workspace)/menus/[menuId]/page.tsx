import { redirect } from "next/navigation";
import { getCurrentWorkspaceUser } from "@shared/server/current-workspace-user";
import { MenuDetailView } from "@views/menus";

export default async function MenuDetailPage({
  params,
}: {
  params: Promise<{ menuId: string }>;
}) {
  const user = await getCurrentWorkspaceUser();
  if (!user) redirect("/sign-in");

  const { menuId } = await params;
  return <MenuDetailView user={user} menuId={menuId} />;
}
