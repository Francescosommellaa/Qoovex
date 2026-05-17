import { redirect } from "next/navigation";
import { bootstrapUser } from "@shared/actions/bootstrap-user";
import { MenuDetailView } from "@views/menus";

export default async function MenuDetailPage({
  params,
}: {
  params: Promise<{ menuId: string }>;
}) {
  const user = await bootstrapUser();
  if (!user) redirect("/sign-in");

  const { menuId } = await params;
  return <MenuDetailView user={user} menuId={menuId} />;
}
