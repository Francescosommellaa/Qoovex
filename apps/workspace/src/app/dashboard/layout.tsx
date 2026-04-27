import { auth } from "@clerk/nextjs/server";
import { bootstrapUser } from "@shared/actions/bootstrap-user";
import type { ReactNode } from "react";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth();
  if (userId) await bootstrapUser();

  return <>{children}</>;
}