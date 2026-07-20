import "server-only";

import { db } from "@qoovex/db";

export async function loadAuthJwtIdentity(userId: string) {
  const identity = await db.user.findUnique({
    where: { id: userId },
    select: {
      authVersion: true,
      platformRole: true,
      suspendedAt: true,
      credential: { select: { passwordUpdatedAt: true } },
    },
  });

  if (!identity) return null;
  return {
    authVersion: identity.authVersion,
    platformRole: identity.platformRole,
    suspendedAt: identity.suspendedAt,
    passwordUpdatedAt: identity.credential?.passwordUpdatedAt ?? null,
  };
}
