import { redirect } from "next/navigation";
import { getCurrentWorkspaceUser } from "@shared/server/current-workspace-user";
import { MenusIndexView } from "@views/menus";

export default async function MenusPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await getCurrentWorkspaceUser();
  if (!user) redirect("/sign-in");

  const params = await searchParams;
  return <MenusIndexView user={user} query={params.q} />;
}
