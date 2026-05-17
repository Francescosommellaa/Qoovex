import { redirect } from "next/navigation";
import { bootstrapUser } from "@shared/actions/bootstrap-user";
import { EditRecipeView } from "@views/recipes";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ recipeId: string }>;
}) {
  const user = await bootstrapUser();
  if (!user) redirect("/sign-in");

  const { recipeId } = await params;
  return <EditRecipeView user={user} recipeId={recipeId} />;
}
