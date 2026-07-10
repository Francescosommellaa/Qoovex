import { redirect } from "next/navigation";
import { bootstrapUser } from "@shared/server/current-user-service";

export default async function RootPage() {
  const user = await bootstrapUser();
  if (!user) redirect("/sign-in?callbackUrl=%2Fdashboard");
  if (user.platformRole === "SUPER_ADMIN") redirect("/qoovex-admin");
  redirect("/dashboard");
}
