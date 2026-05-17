import { redirect } from "next/navigation";
import { bootstrapUser } from "@shared/actions/bootstrap-user";
import { ShoppingListDetailView } from "@views/shopping-list";

export default async function ShoppingListDetailPage({
  params,
}: {
  params: Promise<{ shoppingListId: string }>;
}) {
  const user = await bootstrapUser();
  if (!user) redirect("/sign-in");

  const { shoppingListId } = await params;
  return <ShoppingListDetailView user={user} listId={shoppingListId} />;
}
