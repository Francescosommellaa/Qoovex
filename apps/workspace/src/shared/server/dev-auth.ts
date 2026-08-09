import "server-only";

import { cookies, headers } from "next/headers";
import {
  DEV_AUTH_COOKIE_NAME,
  readDevAuthCookieValue,
} from "@shared/lib/dev-auth-cookie";
import { db } from "@qoovex/db";
import { isDevAuthAllowedForHost } from "@shared/lib/dev-auth-guard";
import type { DevWorkspaceView } from "@qoovex/types";
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

function getDevAccountRole(view: DevWorkspaceView) {
  return view === "BUSINESS" ? "BUSINESS" as const : view === "PROFESSIONAL" ? "PROFESSIONAL" as const : view === "CLIENT" ? "CLIENT" as const : null;
}

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
      platformRole: devSession.view === "SUPPORT_AGENT" || devSession.view === "PLATFORM_ADMIN" ? devSession.view : "USER" as const,
      accountRole: getDevAccountRole(devSession.view),
      suspendedAt: null,
      suspensionReason: null,
      imageUrl: null,
      isAdmin: true,
      devView: devSession.view,
    };
  }

  const user = await syncWorkspaceUser(DEV_USER);
  if (!user) return null;
  const syncedUser = await findWorkspaceUserById(user.id);
  if (!syncedUser) return null;
  const verifiedUser = await ensureDevUserEmailVerified(syncedUser);

  return {
    ...verifiedUser,
    platformRole: devSession.view === "SUPPORT_AGENT" || devSession.view === "PLATFORM_ADMIN" ? devSession.view : "USER" as const,
    accountRole: getDevAccountRole(devSession.view),
    suspendedAt: null,
    suspensionReason: null,
    imageUrl: null,
    isAdmin: true,
    devView: devSession.view,
  };
}

export async function isCurrentDevAuthIdentity(userId: string) {
  return userId === DEV_USER_ID && (await hasDevAuthSession());
}
