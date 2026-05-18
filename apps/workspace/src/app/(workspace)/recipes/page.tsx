import { redirect } from "next/navigation";
import { getCurrentWorkspaceUser } from "@shared/server/current-workspace-user";
import { RecipesIndexView } from "@views/recipes";

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await getCurrentWorkspaceUser();
  if (!user) redirect("/sign-in");

  const params = await searchParams;
  return <RecipesIndexView user={user} query={params.q} />;
}
