import { redirect } from "next/navigation";
import { bootstrapUser } from "@shared/actions/bootstrap-user";
import { WorkPlanDetailView } from "@views/work-plan";

export default async function WorkPlanDetailPage({
  params,
}: {
  params: Promise<{ workPlanId: string }>;
}) {
  const user = await bootstrapUser();
  if (!user) redirect("/sign-in");

  const { workPlanId } = await params;
  return <WorkPlanDetailView user={user} workPlanId={workPlanId} />;
}
