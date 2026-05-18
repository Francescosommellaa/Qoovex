import { redirect } from "next/navigation";
import { getCurrentWorkspaceUser } from "@shared/server/current-workspace-user";
import { ShoppingListDetailView } from "@views/shopping-list";

export default async function ShoppingListDetailPage({
  params,
}: {
  params: Promise<{ shoppingListId: string }>;
}) {
  const user = await getCurrentWorkspaceUser();
  if (!user) redirect("/sign-in");

  const { shoppingListId } = await params;
  return <ShoppingListDetailView user={user} listId={shoppingListId} />;
}
