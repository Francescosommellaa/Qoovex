import { redirect } from "next/navigation";
import { bootstrapUser } from "@shared/actions/bootstrap-user";
import { ShoppingListsIndexView } from "@views/shopping-list";

export default async function ShoppingListsPage() {
  const user = await bootstrapUser();
  if (!user) redirect("/sign-in");

  return <ShoppingListsIndexView user={user} />;
}
