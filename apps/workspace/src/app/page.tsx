import { redirect } from "next/navigation";
import { bootstrapUser } from "@shared/server/current-user-service";
import { getContextHub } from "@shared/server/access-context-service";

export default async function RootPage() {
  const user = await bootstrapUser();
  if (!user) redirect("/sign-in?callbackUrl=%2Fcontexts");
  const hub = await getContextHub();
  const targets = [
    ...hub.organizations.map((value) => `/org/${value.organization.id}`),
    ...(hub.clientJobSites.length ? ["/client"] : []),
    ...(hub.platform ? ["/qoovex-admin"] : []),
  ];
  if (targets.length === 1) redirect(targets[0]!);
  redirect("/contexts");
}
