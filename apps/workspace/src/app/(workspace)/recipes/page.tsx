import { redirect } from "next/navigation";
import { bootstrapUser } from "@shared/actions/bootstrap-user";
import { RecipesIndexView } from "@views/recipes";

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await bootstrapUser();
  if (!user) redirect("/sign-in");

  const params = await searchParams;
  return <RecipesIndexView user={user} query={params.q} />;
}
