import "server-only";

import { cookies, headers } from "next/headers";
import {
  DEV_AUTH_COOKIE_NAME,
  readDevAuthCookieValue,
} from "@shared/lib/dev-auth-cookie";
import { db } from "@qoovex/db";
import { isDevAuthAllowedForHost } from "@shared/lib/dev-auth-guard";
import { findWorkspaceUserById } from "@shared/server/repositories/user-repository";
import { syncWorkspaceUser } from "@shared/server/workspace-user-sync";

export { DEV_AUTH_COOKIE_NAME } from "@shared/lib/dev-auth-cookie";

export const DEV_USER_ID = "dev_qoovex_local_user";

const DEV_USER = {
  id: DEV_USER_ID,
  email: "mario.rossi.dev.profile.email.molto.lunga@qoovex.local",
  username: "dev_mario_rossi",
  firstName: "Mario",
  lastName: "Rossi",
};

async function ensureDevUserEmailVerified(user: NonNullable<Awaited<ReturnType<typeof findWorkspaceUserById>>>) {
  if (user.emailVerified) return user;
  const emailVerified = new Date(0);
  await db.user.update({
    where: { id: user.id },
    data: { emailVerified },
    select: { id: true },
  });
  return { ...user, emailVerified };
}

export async function isDevAuthAllowed() {
  const headerStore = await headers();
  return isDevAuthAllowedForHost(headerStore.get("host"));
}

export async function hasDevAuthSession() {
  return Boolean(await getDevAuthSession());
}

export async function getDevAuthSession() {
  if (!(await isDevAuthAllowed())) return null;

  const cookieStore = await cookies();
  return readDevAuthCookieValue(cookieStore.get(DEV_AUTH_COOKIE_NAME)?.value);
}

export async function bootstrapDevUser() {
  const devSession = await getDevAuthSession();
  if (!devSession) return null;

  const existingUser = await findWorkspaceUserById(DEV_USER.id);
  if (existingUser) {
    const verifiedUser = await ensureDevUserEmailVerified(existingUser);
    return {
      ...verifiedUser,
      platformRole: "SUPER_ADMIN" as const,
      suspendedAt: null,
      suspensionReason: null,
      imageUrl: null,
      isAdmin: true,
      devRole: devSession.role,
    };
  }

  const user = await syncWorkspaceUser(DEV_USER);
  if (!user) return null;
  const syncedUser = await findWorkspaceUserById(user.id);
  if (!syncedUser) return null;
  const verifiedUser = await ensureDevUserEmailVerified(syncedUser);

  return {
    ...verifiedUser,
    platformRole: "SUPER_ADMIN" as const,
    suspendedAt: null,
    suspensionReason: null,
    imageUrl: null,
    isAdmin: true,
    devRole: devSession.role,
  };
}

export async function isCurrentDevAuthIdentity(userId: string) {
  return userId === DEV_USER_ID && (await hasDevAuthSession());
}
