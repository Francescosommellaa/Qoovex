import { redirect } from "next/navigation";
import { getCurrentWorkspaceUser } from "@shared/server/current-workspace-user";
import { ExploreView } from "@views/explore";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await getCurrentWorkspaceUser();
  if (!user) redirect("/sign-in");

  const params = await searchParams;
  return <ExploreView user={user} query={params.q} />;
}
