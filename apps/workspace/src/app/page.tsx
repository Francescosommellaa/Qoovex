import { redirect } from "next/navigation";
import { auth } from "@shared/server/auth/config";

export default async function RootPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=%2Fdashboard");
  redirect("/dashboard");
}
