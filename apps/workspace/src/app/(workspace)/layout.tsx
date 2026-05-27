import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { ToastProvider } from "@qoovex/ui";
import { getCurrentWorkspaceUser } from "@shared/server/current-workspace-user";
import { registerAuthDeviceForRequest } from "@shared/server/auth-device-service";
import { isMfaSatisfiedForUser } from "@shared/server/mfa-service";
import { getRequestIpHash } from "@shared/server/security-audit-service";
import { ProfileOnboardingFreeze } from "@shared/ui";
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

function isProductionBuildPhase() {
  return process.env.NEXT_PHASE === "phase-production-build";
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
    if (isProductionBuildPhase()) {
      redirect("/workspace-unavailable");
    }

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

  if (!user.usernameOnboarded) {
    redirect("/complete-profile");
  }

  if (!(await isMfaSatisfiedForUser(user.id))) {
    redirect("/mfa-challenge");
  }

  const headerStore = await headers();
  try {
    await registerAuthDeviceForRequest({
      userId: user.id,
      email: user.email,
      headers: headerStore,
      ipHash: getRequestIpHash(headerStore),
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[workspace] device registration failed", error);
    }
  }

  const userSummary: WorkspaceUserSummary = {
    firstName: user.firstName || user.username,
    username: user.username,
    email: user.email,
    imageUrl: "imageUrl" in user ? user.imageUrl : null,
    plan: user.plan,
    isAdmin: user.isAdmin,
  };

  return (
    <ToastProvider position="bottom-right">
      <WorkspaceShell user={userSummary} nowIso={new Date().toISOString()}>
        <ProfileOnboardingFreeze
          required={!user.profileOnboarded}
          initialFirstName={user.firstName}
          initialLastName={user.lastName}
        >
          {children}
        </ProfileOnboardingFreeze>
      </WorkspaceShell>
    </ToastProvider>
  );
}
