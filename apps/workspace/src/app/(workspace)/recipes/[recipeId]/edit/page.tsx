import { redirect } from "next/navigation";
import { getCurrentWorkspaceUser } from "@shared/server/current-workspace-user";
import { EditRecipeView } from "@views/recipes";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ recipeId: string }>;
}) {
  const user = await getCurrentWorkspaceUser();
  if (!user) redirect("/sign-in");

  const { recipeId } = await params;
  return <EditRecipeView user={user} recipeId={recipeId} />;
}
