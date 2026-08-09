import { redirect } from "next/navigation";
import { bootstrapUser } from "@shared/server/current-user-service";
import { getWorkspaceAccessContext, requirePrimaryIdentity } from "@shared/server/access-context-service";

export default async function RootPage() {
  const user = await bootstrapUser();
  if (!user) redirect("/sign-in?callbackUrl=%2F");
  const [identity, context] = await Promise.all([requirePrimaryIdentity(), getWorkspaceAccessContext()]);
  if (identity.platformRole !== "USER") redirect("/qoovex-admin");
  if (identity.accountRole === "CLIENT") redirect("/client");
  if (context.company) redirect(`/org/${context.company.organization.id}`);
  if (identity.accountRole === "BUSINESS") redirect("/account/organization");
  if (identity.accountRole === "PROFESSIONAL") redirect("/account/invitations");
  redirect("/account/role");
}
