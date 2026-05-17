import { redirect } from "next/navigation";
import { bootstrapUser } from "@shared/actions/bootstrap-user";
import { ExploreView } from "@views/explore";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await bootstrapUser();
  if (!user) redirect("/sign-in");

  const params = await searchParams;
  return <ExploreView user={user} query={params.q} />;
}
