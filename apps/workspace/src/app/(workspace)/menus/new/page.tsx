import { redirect } from "next/navigation";
import { bootstrapUser } from "@shared/actions/bootstrap-user";
import { NewMenuView } from "@views/menus";

export default async function NewMenuPage() {
  const user = await bootstrapUser();
  if (!user) redirect("/sign-in");

  return <NewMenuView user={user} />;
}
