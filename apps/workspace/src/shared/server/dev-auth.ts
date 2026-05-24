import "server-only";

import { cookies, headers } from "next/headers";
import {
  DEV_AUTH_COOKIE_NAME,
  isDevAuthSecretConfigured,
  verifyDevAuthCookieValue,
} from "@shared/lib/dev-auth-cookie";
import { isDevAuthAllowedForHost } from "@shared/lib/dev-auth-guard";
import { findWorkspaceUserById } from "@shared/server/repositories/user-repository";
import { syncWorkspaceUser } from "@shared/server/workspace-user-sync";

export { DEV_AUTH_COOKIE_NAME } from "@shared/lib/dev-auth-cookie";

const DEV_USER = {
  id: "dev_qoovex_local_user",
  email: "mario.rossi.dev.profile.email.molto.lunga@qoovex.local",
  username: "dev_mario_rossi",
  firstName: "Mario",
  lastName: "Rossi",
};

export async function isDevAuthAllowed() {
  if (!isDevAuthSecretConfigured()) return false;

  const headerStore = await headers();
  return isDevAuthAllowedForHost(headerStore.get("host"));
}

export async function hasDevAuthSession() {
  if (!(await isDevAuthAllowed())) return false;

  const cookieStore = await cookies();
  return verifyDevAuthCookieValue(cookieStore.get(DEV_AUTH_COOKIE_NAME)?.value);
}

export async function bootstrapDevUser() {
  if (!(await hasDevAuthSession())) return null;

  const existingUser = await findWorkspaceUserById(DEV_USER.id);
  if (existingUser) {
    return {
      ...existingUser,
      imageUrl: null,
      isAdmin: true,
    };
  }

  const user = await syncWorkspaceUser(DEV_USER);
  if (!user) return null;

  return {
    ...user,
    imageUrl: null,
    isAdmin: true,
  };
}
