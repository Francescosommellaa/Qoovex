import { getDashboardData } from "@shared/server/dashboard-service";
import { DashboardAccessState, DashboardView } from "@/views/dashboard/DashboardView";

export default async function DashboardPage() {
  try {
    const data = await getDashboardData();
    return <DashboardView data={data} />;
  } catch {
    return <DashboardAccessState />;
  }
}
