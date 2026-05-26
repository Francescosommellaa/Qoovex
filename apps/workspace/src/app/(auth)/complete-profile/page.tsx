import { redirect } from "next/navigation";
import { auth } from "@shared/server/auth/config";
import { findWorkspaceUserById } from "@shared/server/repositories/user-repository";
import { AuthShell } from "../ui";
import { CompleteProfileClient } from "./complete-profile-client";

export default async function CompleteProfilePage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/sign-in");

  const user = await findWorkspaceUserById(userId);
  if (!user) redirect("/sign-in");
  if (user.usernameOnboarded) redirect("/dashboard");

  return (
    <AuthShell
      title="Completa il profilo"
      subtitle="Scegli lo username da usare nel workspace."
      steps={{ current: 2, total: 2, labels: ["Google", "Username"] }}
    >
      <CompleteProfileClient initialUsername={user.username} />
    </AuthShell>
  );
}
