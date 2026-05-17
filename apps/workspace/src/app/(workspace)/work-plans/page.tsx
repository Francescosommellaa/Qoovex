import { redirect } from "next/navigation";
import { bootstrapUser } from "@shared/actions/bootstrap-user";
import { WorkPlansIndexView } from "@views/work-plan";

export default async function WorkPlansPage() {
  const user = await bootstrapUser();
  if (!user) redirect("/sign-in");

  return <WorkPlansIndexView user={user} />;
}
