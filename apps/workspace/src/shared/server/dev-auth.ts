import "server-only";

import { cookies, headers } from "next/headers";
import { isDevAuthAllowedForHost } from "@shared/lib/dev-auth-guard";
import { findWorkspaceUserByClerkId } from "@shared/server/repositories/user-repository";
import { syncClerkUser } from "@shared/server/clerk-user-sync";

export const DEV_AUTH_COOKIE_NAME = "qv-dev-auth";
export const DEV_AUTH_COOKIE_VALUE = "enabled";

const DEV_USER = {
  clerkId: "dev_qoovex_local_user",
  email: "francesco.sommella.dev.profile.email.molto.lunga@qoovex.local",
  username: "dev_francesco_sommella",
  firstName: "Francesco",
  lastName: "Sommella",
};

export async function isDevAuthAllowed() {
  const headerStore = await headers();
  return isDevAuthAllowedForHost(headerStore.get("host"));
}

export async function hasDevAuthSession() {
  if (!(await isDevAuthAllowed())) return false;

  const cookieStore = await cookies();
  return cookieStore.get(DEV_AUTH_COOKIE_NAME)?.value === DEV_AUTH_COOKIE_VALUE;
}

export async function bootstrapDevUser() {
  if (!(await hasDevAuthSession())) return null;

  const existingUser = await findWorkspaceUserByClerkId(DEV_USER.clerkId);
  if (existingUser) {
    return {
      ...existingUser,
      isAdmin: true,
    };
  }

  const user = await syncClerkUser(DEV_USER);
  if (!user) return null;

  return {
    ...user,
    isAdmin: true,
  };
}
