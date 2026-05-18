import { ClerkProvider } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { ToastProvider } from "@qoovex/ui";
import { getCurrentWorkspaceUser } from "@shared/server/current-workspace-user";
import {
  WorkspaceShell,
  type WorkspaceUserSummary,
} from "@widgets/workspace-shell";

export default async function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  let user: Awaited<ReturnType<typeof getCurrentWorkspaceUser>>;
  try {
    user = await getCurrentWorkspaceUser();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[workspace] bootstrap failed", error);
    }
    redirect("/complete-profile?next=/dashboard&sync=failed");
  }

  if (!user) {
    redirect("/sign-in");
  }

  const userSummary: WorkspaceUserSummary = {
    name: user.name,
    username: user.username,
    email: user.email,
    plan: user.plan,
    isAdmin: user.isAdmin,
  };

  return (
    <ClerkProvider>
      <ToastProvider position="bottom-right">
        <WorkspaceShell user={userSummary} nowIso={new Date().toISOString()}>
          {children}
        </WorkspaceShell>
      </ToastProvider>
    </ClerkProvider>
  );
}
