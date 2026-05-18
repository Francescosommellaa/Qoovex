import { redirect } from "next/navigation";
import { getCurrentWorkspaceUser } from "@shared/server/current-workspace-user";
import { ShoppingListsIndexView } from "@views/shopping-list";

export default async function ShoppingListsPage() {
  const user = await getCurrentWorkspaceUser();
  if (!user) redirect("/sign-in");

  return <ShoppingListsIndexView user={user} />;
}
