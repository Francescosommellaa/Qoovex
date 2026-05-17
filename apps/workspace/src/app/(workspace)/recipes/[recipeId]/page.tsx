import { redirect } from "next/navigation";
import { bootstrapUser } from "@shared/actions/bootstrap-user";
import { RecipeDetailView } from "@views/recipes";

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ recipeId: string }>;
}) {
  const user = await bootstrapUser();
  if (!user) redirect("/sign-in");

  const { recipeId } = await params;
  return <RecipeDetailView user={user} recipeId={recipeId} />;
}
