import { redirect } from "next/navigation";
import { bootstrapUser } from "@shared/actions/bootstrap-user";
import { MenusIndexView } from "@views/menus";

export default async function MenusPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await bootstrapUser();
  if (!user) redirect("/sign-in");

  const params = await searchParams;
  return <MenusIndexView user={user} query={params.q} />;
}
