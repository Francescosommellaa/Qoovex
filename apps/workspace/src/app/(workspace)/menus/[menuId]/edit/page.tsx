import { redirect } from "next/navigation";
import { bootstrapUser } from "@shared/actions/bootstrap-user";
import { EditMenuView } from "@views/menus";

export default async function EditMenuPage({
  params,
}: {
  params: Promise<{ menuId: string }>;
}) {
  const user = await bootstrapUser();
  if (!user) redirect("/sign-in");

  const { menuId } = await params;
  return <EditMenuView user={user} menuId={menuId} />;
}
