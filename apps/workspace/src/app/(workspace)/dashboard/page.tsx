import { redirect } from "next/navigation";
import { bootstrapUser } from "@shared/actions/bootstrap-user";
import { DashboardView } from "@views/dashboard";

export default async function DashboardPage() {
  const user = await bootstrapUser();
  if (!user) redirect("/sign-in");

  return <DashboardView user={user} />;
}
