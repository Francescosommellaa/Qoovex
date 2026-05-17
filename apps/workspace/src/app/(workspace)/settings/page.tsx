import { redirect } from "next/navigation";
import { bootstrapUser } from "@shared/actions/bootstrap-user";
import { SettingsView } from "@views/settings";

export default async function SettingsPage() {
  const user = await bootstrapUser();
  if (!user) redirect("/sign-in");

  return <SettingsView user={user} />;
}
