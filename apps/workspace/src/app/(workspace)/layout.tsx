import { ClerkProvider } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { ToastProvider } from "@qoovex/ui";
import { getCurrentWorkspaceUser } from "@shared/server/current-workspace-user";
import {
  WorkspaceShell,
  type WorkspaceUserSummary,
} from "@widgets/workspace-shell";

function getWorkspaceBootstrapLogContext(error: unknown) {
  if (!error || typeof error !== "object") {
    return { kind: "unknown" };
  }

  const record = error as Record<string, unknown>;
  const message =
    typeof record.message === "string" ? record.message.toLowerCase() : "";

  if (message.includes("database connection env missing")) {
    return { kind: "missing_database_env", name: record.name };
  }

  if (message.includes("does not exist") || message.includes("migration")) {
    return { kind: "database_schema", name: record.name };
  }

  return {
    kind: "database_bootstrap",
    name: record.name,
    code: record.code,
    clientVersion: record.clientVersion,
  };
}

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
    } else {
      console.error(
        "[workspace] bootstrap failed",
        getWorkspaceBootstrapLogContext(error),
      );
    }
    redirect("/workspace-unavailable");
  }

  if (!user) {
    redirect("/sign-in");
  }

  const userSummary: WorkspaceUserSummary = {
    firstName: user.firstName,
    username: user.username,
    email: user.email,
    imageUrl: "imageUrl" in user ? user.imageUrl : null,
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
