import "server-only";

import { cookies } from "next/headers";
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

export function isDevAuthAllowed() {
  return process.env.NODE_ENV === "development";
}

export async function hasDevAuthSession() {
  if (!isDevAuthAllowed()) return false;

  const cookieStore = await cookies();
  return cookieStore.get(DEV_AUTH_COOKIE_NAME)?.value === DEV_AUTH_COOKIE_VALUE;
}

export async function bootstrapDevUser() {
  if (!(await hasDevAuthSession())) return null;

  const user = await syncClerkUser(DEV_USER);
  if (!user) return null;

  return {
    ...user,
    isAdmin: true,
  };
}
